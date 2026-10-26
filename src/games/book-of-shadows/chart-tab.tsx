import { HOUSE_MEANINGS, houseOf } from "./profile";
import type { Chart } from "./profile";
import { PLANET_GLYPHS, PLANET_MEANINGS } from "./sky";
import type { Position } from "./sky";
import {
  ELEMENTS,
  ELEMENT_NAMES,
  SIGNS,
  formatDegree,
  normalize,
  placementOf,
} from "./zodiac";
import type { Modality } from "./zodiac";

/** The least gap kept between two planets' glyphs on the wheel, in degrees. */
const SPREAD = 9;

/**
 * Where each planet's glyph goes round the wheel: at its own longitude,
 * nudged apart from its neighbours until none overlap.
 */
const spreadOut = (positions: readonly Position[]) => {
  const placed = positions
    .map((position) => ({ at: position.longitude, position }))
    .toSorted((a, b) => a.at - b.at);

  for (let pass = 0; pass < 24; pass += 1) {
    for (const [i, current] of placed.entries()) {
      const next = placed[(i + 1) % placed.length];

      if (!next || next === current) {
        continue;
      }

      const gap = normalize(next.at - current.at);

      if (gap < SPREAD) {
        current.at -= (SPREAD - gap) / 2;
        next.at += (SPREAD - gap) / 2;
      }
    }
  }

  return placed;
};

/** The chart as a wheel: the signs round the rim, the Ascendant at nine o'clock. */
const ChartWheel = ({ chart }: { chart: Chart }) => {
  // Without a rising sign, 0° Aries sits at nine o'clock, as on a blank wheel.
  const ascendant = chart.angles?.ascendant ?? 0;

  const point = (longitude: number, radius: number) => {
    const turn = ((180 + longitude - ascendant) * Math.PI) / 180;

    return { x: radius * Math.cos(turn), y: -radius * Math.sin(turn) };
  };

  const rising = placementOf(ascendant).index;

  return (
    <svg
      className="chart-wheel"
      viewBox="-180 -180 360 360"
      aria-labelledby="chart-wheel-title"
    >
      <title id="chart-wheel-title">
        A wheel of the birth chart; the table beside it lists every placement.
      </title>
      <circle
        r="172"
        fill="var(--raised)"
        stroke="var(--outline)"
        strokeWidth="2"
      />
      <circle
        r="138"
        fill="var(--panel)"
        stroke="var(--outline)"
        strokeWidth="1.5"
      />
      <circle
        r="96"
        fill="var(--raised)"
        stroke="var(--outline)"
        strokeWidth="1.5"
      />
      {SIGNS.map((sign, i) => {
        const edgeOut = point(i * 30, 172);
        const edgeIn = point(i * 30, 96);
        const glyph = point(i * 30 + 15, 155);
        const house = point(i * 30 + 15, 82);

        return (
          <g key={sign.name}>
            <line
              x1={edgeIn.x}
              y1={edgeIn.y}
              x2={edgeOut.x}
              y2={edgeOut.y}
              stroke="var(--outline)"
              strokeWidth="1"
            />
            <text
              x={glyph.x}
              y={glyph.y}
              className="chart-wheel__sign"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {sign.glyph}
            </text>
            {chart.angles ? (
              <text
                x={house.x}
                y={house.y}
                className="chart-wheel__house"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {((i - rising + 12) % 12) + 1}
              </text>
            ) : null}
          </g>
        );
      })}
      {chart.angles ? (
        <>
          <line
            x1={point(ascendant, 172).x}
            y1={point(ascendant, 172).y}
            x2={point(ascendant + 180, 96).x}
            y2={point(ascendant + 180, 96).y}
            stroke="var(--outline)"
            strokeWidth="2.5"
          />
          <line
            x1={point(chart.angles.midheaven, 172).x}
            y1={point(chart.angles.midheaven, 172).y}
            x2={point(chart.angles.midheaven + 180, 96).x}
            y2={point(chart.angles.midheaven + 180, 96).y}
            stroke="var(--outline)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={point(ascendant, 66).x}
            y={point(ascendant, 66).y - 8}
            className="chart-wheel__angle"
            textAnchor="middle"
          >
            AC
          </text>
          <text
            x={point(chart.angles.midheaven, 66).x + 12}
            y={point(chart.angles.midheaven, 66).y}
            className="chart-wheel__angle"
            textAnchor="middle"
          >
            MC
          </text>
        </>
      ) : null}
      {spreadOut(chart.positions).map(({ at, position }) => {
        const glyph = point(at, 117);
        const tickOut = point(position.longitude, 138);
        const tickIn = point(position.longitude, 130);

        return (
          <g key={position.planet}>
            <line
              x1={tickIn.x}
              y1={tickIn.y}
              x2={tickOut.x}
              y2={tickOut.y}
              stroke="var(--outline)"
              strokeWidth="2"
            />
            <text
              x={glyph.x}
              y={glyph.y}
              className="chart-wheel__planet"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {PLANET_GLYPHS[position.planet]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const MODALITIES: readonly Modality[] = ["cardinal", "fixed", "mutable"];

/** Every placement, with its house when the rising sign is known. */
const Placements = ({ chart }: { chart: Chart }) => {
  const ascendant = chart.angles?.ascendant;

  const counts = (pick: (longitude: number) => string) => {
    const tally = new Map<string, number>();

    for (const { longitude } of chart.positions) {
      tally.set(pick(longitude), (tally.get(pick(longitude)) ?? 0) + 1);
    }

    return tally;
  };

  const elements = counts((longitude) => placementOf(longitude).sign.element);

  const modalities = counts(
    (longitude) => placementOf(longitude).sign.modality
  );

  return (
    <>
      <table className="board board--compact">
        <thead>
          <tr>
            <th scope="col">Planet</th>
            <th scope="col">Sign</th>
            {ascendant === undefined ? null : <th scope="col">House</th>}
          </tr>
        </thead>
        <tbody>
          {chart.positions.map(({ planet, longitude, retrograde }) => {
            const { sign, degree } = placementOf(longitude);

            return (
              <tr key={planet} title={`${planet}: ${PLANET_MEANINGS[planet]}`}>
                <th scope="row">
                  <span aria-hidden="true" className="glyph">
                    {PLANET_GLYPHS[planet]}
                  </span>{" "}
                  {planet}
                </th>
                <td>
                  <span aria-hidden="true">{sign.glyph} </span>
                  {sign.name}{" "}
                  <span className="board__record">{formatDegree(degree)}</span>
                  {retrograde ? (
                    <span className="badge badge--retro">
                      <abbr title="retrograde">℞</abbr>
                    </span>
                  ) : null}
                </td>
                {ascendant === undefined ? null : (
                  <td
                    className="board__rank"
                    title={HOUSE_MEANINGS[houseOf(longitude, ascendant) - 1]}
                  >
                    {houseOf(longitude, ascendant)}
                  </td>
                )}
              </tr>
            );
          })}
          {chart.angles ? (
            <>
              <tr>
                <th scope="row">Ascendant</th>
                <td>
                  {placementOf(chart.angles.ascendant).sign.name}{" "}
                  <span className="board__record">
                    {formatDegree(placementOf(chart.angles.ascendant).degree)}
                  </span>
                </td>
                <td className="board__rank">1</td>
              </tr>
              <tr>
                <th scope="row">Midheaven</th>
                <td>
                  {placementOf(chart.angles.midheaven).sign.name}{" "}
                  <span className="board__record">
                    {formatDegree(placementOf(chart.angles.midheaven).degree)}
                  </span>
                </td>
                <td className="board__rank">
                  {houseOf(chart.angles.midheaven, chart.angles.ascendant)}
                </td>
              </tr>
            </>
          ) : null}
        </tbody>
      </table>
      <p className="tally">
        {ELEMENTS.map(
          (element) => `${ELEMENT_NAMES[element]} ${elements.get(element) ?? 0}`
        ).join(" · ")}
        <br />
        {MODALITIES.map(
          (modality) =>
            `${modality[0]?.toUpperCase()}${modality.slice(1)} ${modalities.get(modality) ?? 0}`
        ).join(" · ")}
      </p>
    </>
  );
};

/** What the Sun, the Moon and the Rising say, sign by sign. */
const BigThree = ({ chart }: { chart: Chart }) => {
  const at = (planet: "Sun" | "Moon") =>
    placementOf(
      chart.positions.find((position) => position.planet === planet)
        ?.longitude ?? 0
    ).sign;

  const sun = at("Sun");
  const moon = at("Moon");
  const rising = chart.angles ? placementOf(chart.angles.ascendant).sign : null;

  return (
    <dl className="facts facts--wide">
      <div>
        <dt>
          {PLANET_GLYPHS.Sun} Sun in {sun.name}
        </dt>
        <dd>
          {sun.sun}{" "}
          <span className="facts__aside">
            ({sun.keywords}; {sun.element}, ruled by {sun.ruler})
          </span>
        </dd>
      </div>
      <div>
        <dt>
          {PLANET_GLYPHS.Moon} Moon in {moon.name}
        </dt>
        <dd>{moon.moon}</dd>
      </div>
      {rising ? (
        <div>
          <dt>↑ {rising.name} rising</dt>
          <dd>{rising.rising}</dd>
        </div>
      ) : null}
    </dl>
  );
};

export const ChartTab = ({ chart }: { chart: Chart }) => (
  <div className="layout">
    <section
      aria-labelledby="chart-title"
      className="panel panel--book panel--wide chart"
    >
      <span className="legend">birth-chart.svg</span>
      <h2 id="chart-title" className="display book__title">
        Your birth chart
      </h2>
      <ChartWheel chart={chart} />
      <BigThree chart={chart} />
      {chart.angles ? (
        <p className="hint">
          Houses are whole signs: your rising sign is the 1st house, the next
          sign the 2nd, and so on. Hover a house for what it rules.
        </p>
      ) : (
        <p className="hint">
          Add a birth time and a birthplace for your rising sign and houses.
        </p>
      )}
    </section>
    <section
      aria-labelledby="placements-title"
      className="panel panel--book panel--narrow"
    >
      <span className="legend">placements.csv</span>
      <h2 id="placements-title" className="display book__title">
        Placements
      </h2>
      <Placements chart={chart} />
    </section>
  </div>
);
