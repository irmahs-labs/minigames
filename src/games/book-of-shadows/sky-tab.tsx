import { EclipseKind } from "astronomy-engine";
import { useMemo, useState } from "react";

import { formatDay } from "./format";
import { inFrench, say, tr } from "./french";
import { PeriodNav } from "./period-nav";
import { loreFor } from "./retrograde-lore";
import { SignName } from "./sign-name";
import {
  PLANET_GLYPHS,
  PLANET_MEANINGS,
  eclipsesBetween,
  positionsAt,
  retrogradesBetween,
} from "./sky";
import type { Eclipse, Retrograde, Station } from "./sky";
import { dayKey, startOfYear, wallTimeAt } from "./time";
import { formatDegree, placementOf } from "./zodiac";

interface SkyTabProps {
  now: Date;
  timeZone: string;
}

const ECLIPSE_KINDS: Record<EclipseKind, readonly [string, string]> = {
  [EclipseKind.Annular]: ["Annular", "annulaire"],
  [EclipseKind.Partial]: ["Partial", "partielle"],
  [EclipseKind.Penumbral]: ["Penumbral", "pénombrale"],
  [EclipseKind.Total]: ["Total", "totale"],
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
      {when} {tr("in", "en")} <SignName longitude={station.longitude} />
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
        {tr("The sky today", "Le ciel aujourd’hui")}
      </h2>
      <table className="board board--compact">
        <thead>
          <tr>
            <th scope="col">{tr("Planet", "Planète")}</th>
            <th scope="col">{tr("In", "En")}</th>
            <th scope="col">
              <abbr title={tr("Retrograde", "Rétrograde")}>℞</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map(({ planet, longitude, retrograde }) => (
            <tr
              key={planet}
              title={`${say(planet)}${tr(": ", " : ")}${say(PLANET_MEANINGS[planet])}`}
            >
              <th scope="row">
                <span aria-hidden="true" className="glyph">
                  {PLANET_GLYPHS[planet]}
                </span>{" "}
                {say(planet)}
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
                    <abbr title={tr("retrograde", "rétrograde")}>℞</abbr>
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

const skyYears = new Map<
  string,
  { retrogrades: Retrograde[]; eclipses: Eclipse[] }
>();

/**
 * A year's retrogrades and eclipses, worked out once per year and time
 * zone: going back to a year already seen costs nothing.
 */
const yearInTheSky = (year: number, timeZone: string) => {
  const key = `${year}|${timeZone}`;
  const known = skyYears.get(key);

  if (known) {
    return known;
  }

  const from = startOfYear(year, timeZone);
  const to = startOfYear(year + 1, timeZone);

  const sky = {
    eclipses: eclipsesBetween(from, to),
    retrogrades: retrogradesBetween(from, to),
  };

  skyYears.set(key, sky);

  return sky;
};

/** A year's retrogrades and eclipses, with what each is said to bring. */
const SkyYear = ({ now, timeZone }: SkyTabProps) => {
  const thisYear = wallTimeAt(now, timeZone).year;
  const [year, setYear] = useState(thisYear);

  const { retrogrades, eclipses } = yearInTheSky(year, timeZone);

  return (
    <section
      aria-labelledby="year-title"
      className="panel panel--book panel--wide"
    >
      <span className="legend">retrogrades.csv</span>
      <PeriodNav
        id="year-title"
        unit="year"
        title={tr(`Retrogrades of ${year}`, `Rétrogrades de ${year}`)}
        atCurrent={year === thisYear}
        onStep={(by) => setYear(year + by)}
        onCurrent={() => setYear(thisYear)}
      />

      <ol className="retrogrades">
        {retrogrades.map((retrograde) => {
          const { planet, start, end } = retrograde;
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
                {tr(`${planet} retrograde`, `${say(planet)} rétrograde`)}
                {current ? (
                  <span className="badge">{tr("now", "en cours")}</span>
                ) : null}
              </h3>
              <p className="retrograde__dates">
                <StationAt station={start} timeZone={timeZone} year={year} /> →{" "}
                <StationAt station={end} timeZone={timeZone} year={year} />
              </p>
              {loreFor(retrograde).map((line) => (
                <p key={line} className="retrograde__lore">
                  {say(line)}
                </p>
              ))}
            </li>
          );
        })}
      </ol>

      <h2 className="display book__title">
        {tr(`Eclipses of ${year}`, `Éclipses de ${year}`)}
      </h2>
      <ul className="eclipses">
        {eclipses.map((eclipse) => (
          <li key={eclipse.peak.getTime()}>
            <span aria-hidden="true">
              {eclipse.body === "Sun" ? "🌑" : "🌕"}
            </span>
            <span>
              <strong>
                {formatDay(dayKey(eclipse.peak, timeZone))}
                {tr(": ", " : ")}
                {inFrench()
                  ? `éclipse ${eclipse.body === "Sun" ? "solaire" : "lunaire"} ${ECLIPSE_KINDS[eclipse.kind][1]}`
                  : `${ECLIPSE_KINDS[eclipse.kind][0]} ${eclipse.body === "Sun" ? "solar" : "lunar"} eclipse`}
              </strong>{" "}
              {tr("in", "en")} <SignName longitude={eclipse.longitude} />
            </span>
          </li>
        ))}
      </ul>
      <p className="hint">
        {tr(
          "Eclipses are wild cards: big beginnings at a solar one, big endings at a lunar one. Most witches rest instead of casting.",
          "Les éclipses sont des jokers : de grands débuts à une éclipse solaire, de grandes fins à une lunaire. La plupart des sorcières se reposent au lieu de lancer des sorts."
        )}
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
