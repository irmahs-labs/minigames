import { useState } from "react";
import type { PointerEvent } from "react";

import { useCopy, useLanguage } from "../../lib/language";
import { percent, pieSlices, ranked } from "./quiz";
import type { Quiz, Scores } from "./quiz";

const COPY = {
  en: { mix: "Your mix", other: "Others" },
  fr: { mix: "Votre mélange", other: "Autres" },
};

const CENTRE = 110;
const RADIUS = 100;

/** The point `turn` of the way round the rim, clockwise from twelve o'clock. */
const rim = (turn: number) => {
  const angle = turn * 2 * Math.PI - Math.PI / 2;

  return `${CENTRE + RADIUS * Math.cos(angle)} ${CENTRE + RADIUS * Math.sin(angle)}`;
};

/** A wedge from `from` to `to`, each a fraction of a full turn. */
const wedge = (from: number, to: number) =>
  `M${CENTRE} ${CENTRE}L${rim(from)}A${RADIUS} ${RADIUS} 0 ${to - from > 0.5 ? 1 : 0} 1 ${rim(to)}Z`;

/** Slices take the series colours in rank order; the folded rest is grey. */
const colourOf = (id: string, i: number) =>
  id === "other" ? "var(--series-other)" : `var(--series-${i + 1})`;

interface PieChartProps {
  quiz: Quiz;
  scores: Scores;
}

/**
 * How much of each result the answers scored, as a pie, biggest first from
 * twelve o'clock. The legend beside it names every slice with its share, so
 * nothing is told by colour alone; pointing at a slice or its legend line
 * with a mouse picks it out.
 */
export const PieChart = ({ quiz, scores }: PieChartProps) => {
  const [active, setActive] = useState<string | null>(null);

  // Only a mouse points: a tap would leave a slice picked out with nothing to
  // take it back.
  const point = (id: string) => (event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      setActive(id);
    }
  };

  const language = useLanguage();
  const t = useCopy(COPY);
  const slices = pieSlices(quiz, scores);

  // Where each slice starts, as a fraction of the way round.
  const starts = slices.map((_, i) =>
    slices.slice(0, i).reduce((sum, slice) => sum + slice.share, 0)
  );

  const nameOf = (id: string) =>
    id === "other" ? t.other : (quiz.results[id]?.name[language] ?? id);

  // The results folded into "other", named under it.
  const folded = ranked(quiz, scores)
    .slice(slices.length - 1)
    .map((entry) => nameOf(entry.id));

  const hasOther = slices.at(-1)?.id === "other";

  return (
    <figure className="pie">
      <svg
        aria-hidden="true"
        className="pie__chart"
        viewBox="0 0 220 220"
        onPointerLeave={() => setActive(null)}
      >
        {slices.map((slice, i) => {
          const from = starts[i] ?? 0;

          const mark = {
            className: "pie__slice",
            "data-dim": active !== null && active !== slice.id,
            fill: colourOf(slice.id, i),
            onPointerEnter: point(slice.id),
          };

          const label = `${nameOf(slice.id)}: ${percent(slice.share)}%`;

          return slices.length === 1 ? (
            <circle key={slice.id} cx={CENTRE} cy={CENTRE} r={RADIUS} {...mark}>
              <title>{label}</title>
            </circle>
          ) : (
            <path key={slice.id} d={wedge(from, from + slice.share)} {...mark}>
              <title>{label}</title>
            </path>
          );
        })}
      </svg>

      <figcaption className="pie__legend">
        <span className="kicker">{t.mix}</span>
        <ul onPointerLeave={() => setActive(null)}>
          {slices.map((slice, i) => (
            <li
              key={slice.id}
              className="pie__item"
              data-dim={active !== null && active !== slice.id}
              onPointerEnter={point(slice.id)}
            >
              <span
                aria-hidden="true"
                className="pie__swatch"
                style={{ background: colourOf(slice.id, i) }}
              />
              <span className="pie__name">
                {nameOf(slice.id)}
                {slice.id === "other" && hasOther ? (
                  <span className="pie__folded">{folded.join(", ")}</span>
                ) : null}
              </span>
              <span className="pie__share">{percent(slice.share)}%</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
};
