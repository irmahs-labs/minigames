import { useMemo, useState } from "react";

import { FULL_DAY, formatDay, inDays } from "./format";
import { inFrench, say, tr } from "./french";
import { PeriodNav } from "./period-nav";
import { nextSabbat, sabbatsIn, sunPointOf } from "./sabbats";
import type { SabbatDate } from "./sabbats";
import { longitudeOf } from "./sky";
import { dayKey, daysBetween } from "./time";

/** A sabbat's kind in French, with its article. */
const KINDS_FR = new Map(
  Object.entries({
    equinox: "Un équinoxe",
    "fire festival": "Une fête du feu",
    solstice: "Un solstice",
  })
);

interface SabbatsTabProps {
  now: Date;
  timeZone: string;
  southern: boolean;
  onSouthern: (southern: boolean) => void;
}

/** On the wheel, clockwise from the top: Yule at the top, Litha at the foot. */
const pointAt = (longitude: number, southern: boolean, radius: number) => {
  const turn = ((longitude - (southern ? 90 : 270)) * Math.PI) / 180;

  return { x: radius * Math.sin(turn), y: -radius * Math.cos(turn) };
};

/**
 * The Wheel of the Year as a wheel: the eight sabbats round the rim where the
 * Sun is at each, and a hand where it is today.
 */
const Wheel = ({
  dates,
  next,
  now,
  southern,
}: {
  dates: readonly SabbatDate[];
  next: SabbatDate | undefined;
  now: Date;
  southern: boolean;
}) => {
  const sun = pointAt(longitudeOf("Sun", now), southern, 104);

  return (
    <svg
      className="year-wheel"
      viewBox="-125 -125 250 250"
      aria-labelledby="year-wheel-title"
    >
      <title id="year-wheel-title">
        {inFrench()
          ? `La Roue de l’année, tournée vers aujourd’hui${next ? `, avec ${say(next.sabbat.name)} à venir` : ""}`
          : `The Wheel of the Year, turned to today${next ? `, with ${next.sabbat.name} next` : ""}`}
      </title>
      <circle
        r="110"
        fill="var(--raised)"
        stroke="var(--outline)"
        strokeWidth="2"
      />
      {dates.map(({ sabbat, key }) => {
        const rim = pointAt(sunPointOf(sabbat.id, southern), southern, 110);
        const label = pointAt(sunPointOf(sabbat.id, southern), southern, 74);
        const isNext = sabbat.id === next?.sabbat.id;

        return (
          <g key={sabbat.id}>
            <line
              x1="0"
              y1="0"
              x2={rim.x}
              y2={rim.y}
              stroke="var(--outline)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <circle
              cx={rim.x}
              cy={rim.y}
              r="7"
              fill={isNext ? "var(--selected)" : "var(--panel)"}
              stroke="var(--outline)"
              strokeWidth="1.5"
            />
            <text
              x={label.x}
              y={label.y - 2}
              textAnchor="middle"
              className="year-wheel__name"
            >
              {say(sabbat.name)}
            </text>
            <text
              x={label.x}
              y={label.y + 10}
              textAnchor="middle"
              className="year-wheel__date"
            >
              {formatDay(key)}
            </text>
          </g>
        );
      })}
      <line
        x1="0"
        y1="0"
        x2={sun.x}
        y2={sun.y}
        stroke="var(--outline)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        r="16"
        fill="var(--accent)"
        stroke="var(--outline)"
        strokeWidth="2"
      />
      <circle
        cx={sun.x}
        cy={sun.y}
        r="5"
        fill="var(--cream)"
        stroke="var(--outline)"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const SabbatsTab = ({
  now,
  timeZone,
  southern,
  onSouthern,
}: SabbatsTabProps) => {
  const today = dayKey(now, timeZone);
  const thisYear = Number(today.slice(0, 4));
  const [year, setYear] = useState(thisYear);

  const next = useMemo(
    () => nextSabbat(today, southern, timeZone),
    [today, southern, timeZone]
  );

  const dates = useMemo(
    () => sabbatsIn(year, southern, timeZone),
    [year, southern, timeZone]
  );

  const wheelDates = useMemo(
    () => sabbatsIn(thisYear, southern, timeZone),
    [thisYear, southern, timeZone]
  );

  return (
    <div className="layout">
      <section
        aria-labelledby="next-title"
        className="panel panel--book panel--narrow"
      >
        <span className="legend">wheel-of-the-year.ics</span>
        <Wheel dates={wheelDates} next={next} now={now} southern={southern} />
        {next ? (
          <div className="stack">
            <p className="kicker">
              {tr("Next sabbat", "Prochain sabbat")},{" "}
              {inDays(daysBetween(today, next.key))}
            </p>
            <h2 id="next-title" className="display page__title">
              {say(next.sabbat.name)}
            </h2>
            <p className="page__sub">{formatDay(next.key, FULL_DAY)}</p>
          </div>
        ) : null}
        <button
          type="button"
          role="switch"
          aria-checked={southern}
          className="switch"
          onClick={() => onSouthern(!southern)}
        >
          <span>{tr("Southern hemisphere", "Hémisphère sud")}</span>
          <span aria-hidden="true" className="switch__track">
            <span className="switch__thumb" />
          </span>
        </button>
        <p className="hint">
          {tr(
            "Below the equator the wheel turns the other way round the calendar: Samhain falls at the start of May.",
            "Sous l’équateur, la roue tourne dans l’autre sens du calendrier : Samhain tombe début mai."
          )}
        </p>
      </section>

      <section
        aria-labelledby="sabbats-title"
        className="panel panel--book panel--wide"
      >
        <span className="legend">sabbats.txt</span>
        <PeriodNav
          id="sabbats-title"
          unit="year"
          title={tr(`The sabbats of ${year}`, `Les sabbats de ${year}`)}
          atCurrent={year === thisYear}
          onStep={(by) => setYear(year + by)}
          onCurrent={() => setYear(thisYear)}
        />

        <ol className="sabbats">
          {dates.map(({ sabbat, key, astronomical }) => (
            <li
              key={sabbat.id}
              className={key === next?.key ? "sabbat sabbat--next" : "sabbat"}
            >
              <p className="sabbat__when">
                {formatDay(key, FULL_DAY)}
                {key === next?.key ? (
                  <span className="badge">
                    {inDays(daysBetween(today, key))}
                  </span>
                ) : null}
              </p>
              <h3 className="display sabbat__name">
                {say(sabbat.name)}
                {sabbat.say ? (
                  <span className="sabbat__say"> ({sabbat.say})</span>
                ) : null}
              </h3>
              <p className="sabbat__also">
                {inFrench()
                  ? `${KINDS_FR.get(sabbat.kind) ?? sabbat.kind} ; aussi ${say(sabbat.also)}.`
                  : `${sabbat.kind === "equinox" ? "An" : "A"} ${sabbat.kind}; also ${sabbat.also}.`}
                {astronomical && astronomical !== key
                  ? tr(
                      ` The Sun is halfway there on ${formatDay(astronomical)}.`,
                      ` Le Soleil est à mi-chemin le ${formatDay(astronomical)}.`
                    )
                  : ""}
              </p>
              <p>{say(sabbat.about)}</p>
              <p>
                <strong>{tr("Celebrate:", "Célébrer :")}</strong>{" "}
                {say(sabbat.rituals)}
              </p>
              <p className="sabbat__also">
                <strong>{tr("Colours:", "Couleurs :")}</strong>{" "}
                {say(sabbat.colors)}.{" "}
                <strong>{tr("Symbols:", "Symboles :")}</strong>{" "}
                {say(sabbat.symbols)}.
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
