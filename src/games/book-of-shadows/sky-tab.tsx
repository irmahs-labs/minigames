import { EclipseKind } from "astronomy-engine";
import { useMemo, useState } from "react";

import { formatDay } from "./format";
import {
  PLANET_GLYPHS,
  PLANET_MEANINGS,
  RETROGRADE_LORE,
  eclipsesBetween,
  positionsAt,
  retrogradesBetween,
} from "./sky";
import type { Station } from "./sky";
import { dayKey, startOfYear, wallTimeAt } from "./time";
import { formatDegree, placementOf } from "./zodiac";

interface SkyTabProps {
  now: Date;
  timeZone: string;
}

const ECLIPSE_KINDS: Record<EclipseKind, string> = {
  [EclipseKind.Annular]: "Annular",
  [EclipseKind.Partial]: "Partial",
  [EclipseKind.Penumbral]: "Penumbral",
  [EclipseKind.Total]: "Total",
};

/** "Sagittarius ♐". */
const SignName = ({ longitude }: { longitude: number }) => {
  const { sign } = placementOf(longitude);

  return (
    <>
      <span aria-hidden="true">{sign.glyph} </span>
      {sign.name}
    </>
  );
};

/** "24 Oct in Scorpio", with the year when it is not the one shown. */
const StationAt = ({
  station,
  timeZone,
  year,
}: {
  station: Station;
  timeZone: string;
  year: number;
}) => {
  const key = dayKey(station.time, timeZone);

  const when = key.startsWith(String(year))
    ? formatDay(key)
    : formatDay(key, { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      {when} in <SignName longitude={station.longitude} />
    </>
  );
};

/** Where everything is today, and which way it is going. */
const SkyToday = ({ now }: SkyTabProps) => {
  const positions = useMemo(() => positionsAt(now), [now]);

  return (
    <section
      aria-labelledby="today-title"
      className="panel panel--book panel--narrow"
    >
      <span className="legend">sky-today.log</span>
      <h2 id="today-title" className="display book__title">
        The sky today
      </h2>
      <table className="board board--compact">
        <thead>
          <tr>
            <th scope="col">Planet</th>
            <th scope="col">In</th>
            <th scope="col">
              <abbr title="Retrograde">℞</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map(({ planet, longitude, retrograde }) => (
            <tr key={planet} title={`${planet}: ${PLANET_MEANINGS[planet]}`}>
              <th scope="row">
                <span aria-hidden="true" className="glyph">
                  {PLANET_GLYPHS[planet]}
                </span>{" "}
                {planet}
              </th>
              <td>
                <SignName longitude={longitude} />{" "}
                <span className="board__record">
                  {formatDegree(placementOf(longitude).degree)}
                </span>
              </td>
              <td>
                {retrograde ? (
                  <span className="badge badge--retro">
                    <abbr title="retrograde">℞</abbr>
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

/** A year's retrogrades and eclipses, with what each is said to bring. */
const SkyYear = ({ now, timeZone }: SkyTabProps) => {
  const thisYear = wallTimeAt(now, timeZone).year;
  const [year, setYear] = useState(thisYear);

  const { retrogrades, eclipses } = useMemo(() => {
    const from = startOfYear(year, timeZone);
    const to = startOfYear(year + 1, timeZone);

    return {
      eclipses: eclipsesBetween(from, to),
      retrogrades: retrogradesBetween(from, to),
    };
  }, [year, timeZone]);

  return (
    <section
      aria-labelledby="year-title"
      className="panel panel--book panel--wide"
    >
      <span className="legend">retrogrades.csv</span>
      <div className="month-nav">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous year"
          onClick={() => setYear(year - 1)}
        >
          ‹
        </button>
        <h2 id="year-title" className="display book__title" aria-live="polite">
          Retrogrades of {year}
        </h2>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next year"
          onClick={() => setYear(year + 1)}
        >
          ›
        </button>
        {year === thisYear ? null : (
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => setYear(thisYear)}
          >
            This year
          </button>
        )}
      </div>

      <ol className="retrogrades">
        {retrogrades.map(({ planet, start, end }) => {
          const current = start.time <= now && now < end.time;

          return (
            <li
              key={`${planet}-${start.time.getTime()}`}
              className={current ? "retrograde retrograde--now" : "retrograde"}
            >
              <h3 className="display retrograde__name">
                <span aria-hidden="true" className="glyph">
                  {PLANET_GLYPHS[planet]}
                </span>{" "}
                {planet} retrograde
                {current ? <span className="badge">now</span> : null}
              </h3>
              <p className="retrograde__dates">
                <StationAt station={start} timeZone={timeZone} year={year} /> →{" "}
                <StationAt station={end} timeZone={timeZone} year={year} />
              </p>
              <p className="retrograde__lore">{RETROGRADE_LORE[planet]}</p>
            </li>
          );
        })}
      </ol>

      <h2 className="display book__title">Eclipses of {year}</h2>
      <ul className="eclipses">
        {eclipses.map((eclipse) => (
          <li key={eclipse.peak.getTime()}>
            <span aria-hidden="true">
              {eclipse.body === "Sun" ? "🌑" : "🌕"}
            </span>
            <span>
              <strong>
                {formatDay(dayKey(eclipse.peak, timeZone))}:{" "}
                {ECLIPSE_KINDS[eclipse.kind]}{" "}
                {eclipse.body === "Sun" ? "solar" : "lunar"} eclipse
              </strong>{" "}
              in <SignName longitude={eclipse.longitude} />
            </span>
          </li>
        ))}
      </ul>
      <p className="hint">
        Eclipses are wild cards: big beginnings at a solar one, big endings at a
        lunar one. Most witches rest instead of casting.
      </p>
    </section>
  );
};

export const SkyTab = (props: SkyTabProps) => (
  <div className="layout">
    <SkyToday {...props} />
    <SkyYear {...props} />
  </div>
);
