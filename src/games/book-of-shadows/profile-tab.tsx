import { useConfirm } from "../../lib/use-confirm";
import { BirthplaceField } from "./birthplace-field";
import { formatDay } from "./format";
import { lunarYearOf, yearName } from "./lunar-zodiac";
import { MoonGlyph } from "./moon-glyph";
import { meaningOf } from "./numerology";
import {
  MAX_NAME,
  birthMoonOf,
  birthNumbers,
  birthSeasonOf,
  craftOf,
  elementBalance,
  planetaryDayOf,
} from "./profile";
import type { Birth, Chart, Profile } from "./profile";
import { PLANET_GLYPHS, moonAngle } from "./sky";
import { ELEMENTS, ELEMENT_NAMES, placementOf } from "./zodiac";

/** Every time zone the browser knows, for a birthplace not on the list. */
const TIME_ZONES = Intl.supportedValuesOf("timeZone");

interface DetailsProps {
  /** Your own details, or the person you are matching yours with. */
  who: "you" | "partner";
  profile: Profile;
  onChange: (fields: Partial<Profile>) => void;
  onClear: () => void;
}

/** The birth details: what every reading in the book is drawn from. */
export const BirthDetails = ({
  who,
  profile,
  onChange,
  onClear,
}: DetailsProps) => {
  const confirm = useConfirm();
  const filled = Object.values(profile).some((value) => value !== "");
  const prefix = who === "you" ? "bos" : "bos-partner";

  return (
    <section
      aria-labelledby={`${prefix}-title`}
      className="panel panel--book panel--narrow"
    >
      <span className="legend">
        {who === "you" ? "birth-details.txt" : "someone-else.txt"}
      </span>
      <h2 id={`${prefix}-title`} className="display book__title">
        {who === "you" ? "Your details" : "Someone else"}
      </h2>
      {who === "partner" ? (
        <p className="hint">
          A partner, a friend or a crush: the Birth chart, Numerology and Lunar
          Zodiac pages then show how the two of you match.
        </p>
      ) : null}

      <div className="stack">
        <label className="field-label" htmlFor={`${prefix}-name`}>
          Full birth name
        </label>
        <input
          id={`${prefix}-name`}
          className="field"
          value={profile.name}
          maxLength={MAX_NAME}
          autoComplete={who === "you" ? "name" : "off"}
          placeholder={
            who === "you"
              ? "As it is on your birth certificate"
              : "Their full birth name"
          }
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </div>

      <div className="details__row">
        <div className="stack">
          <label className="field-label" htmlFor={`${prefix}-date`}>
            Birth date
          </label>
          <input
            id={`${prefix}-date`}
            type="date"
            className="field"
            min="1800-01-01"
            max="2200-12-31"
            value={profile.birthDate}
            onChange={(event) => onChange({ birthDate: event.target.value })}
          />
        </div>
        <div className="stack">
          <label className="field-label" htmlFor={`${prefix}-time`}>
            Birth time
          </label>
          <input
            id={`${prefix}-time`}
            type="time"
            className="field"
            value={profile.birthTime}
            onChange={(event) => onChange({ birthTime: event.target.value })}
          />
        </div>
      </div>
      <p className="hint">
        No birth time? Leave it empty: everything but the rising sign and the
        houses still works.
      </p>

      <BirthplaceField
        idPrefix={prefix}
        profile={profile}
        onChange={onChange}
      />

      <details className="details__more">
        <summary className="field-label">
          Coordinates and time zone, to check or type in
        </summary>
        <div className="details__row">
          <div className="stack">
            <label className="field-label" htmlFor={`${prefix}-lat`}>
              Latitude (N +, S −)
            </label>
            <input
              id={`${prefix}-lat`}
              className="field"
              inputMode="decimal"
              value={profile.lat}
              maxLength={12}
              placeholder="50.85"
              onChange={(event) => onChange({ lat: event.target.value })}
            />
          </div>
          <div className="stack">
            <label className="field-label" htmlFor={`${prefix}-lon`}>
              Longitude (E +, W −)
            </label>
            <input
              id={`${prefix}-lon`}
              className="field"
              inputMode="decimal"
              value={profile.lon}
              maxLength={12}
              placeholder="4.35"
              onChange={(event) => onChange({ lon: event.target.value })}
            />
          </div>
        </div>
        <div className="stack">
          <label className="field-label" htmlFor={`${prefix}-zone`}>
            Time zone
          </label>
          <input
            id={`${prefix}-zone`}
            className="field"
            list={`${prefix}-zones`}
            value={profile.timeZone}
            maxLength={64}
            placeholder="Europe/Brussels"
            onChange={(event) => onChange({ timeZone: event.target.value })}
          />
          <datalist id={`${prefix}-zones`}>
            {TIME_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </datalist>
        </div>
      </details>

      <div className="details__foot">
        <p className="hint">Saved in this browser only.</p>
        <button
          type="button"
          className="btn btn--quiet"
          disabled={!filled}
          onClick={() => confirm.press("clear", onClear)}
        >
          {confirm.armed === "clear" ? "Sure? Clear" : "Clear"}
        </button>
      </div>
    </section>
  );
};

interface CardProps {
  profile: Profile;
  birth: Birth | null;
  chart: Chart | null;
  thisYear: number;
}

/** "the Sun's", "Saturn's": the lights take "the", the planets do not. */
const dayOwner = (planet: string) =>
  planet === "Sun" || planet === "Moon" ? `the ${planet}’s` : `${planet}’s`;

/** "Sun ☉ in Leo ♌". */
const Light = ({
  label,
  glyph,
  longitude,
}: {
  label: string;
  glyph: string;
  longitude: number | null;
}) => {
  const sign = longitude === null ? null : placementOf(longitude).sign;

  return (
    <div className="light">
      <span className="light__label">
        <span aria-hidden="true">{glyph} </span>
        {label}
      </span>
      <span className="display light__sign">
        {sign ? (
          <>
            <span aria-hidden="true">{sign.glyph} </span>
            {sign.name}
          </>
        ) : (
          "?"
        )}
      </span>
    </div>
  );
};

/** The witch card: the profile at a glance, drawn from everything else. */
export const WitchCard = ({ profile, birth, chart, thisYear }: CardProps) => {
  if (!birth || !chart) {
    return (
      <section
        aria-labelledby="card-title"
        className="panel panel--book panel--wide empty"
      >
        <span className="legend">witch-card.png</span>
        <h2 id="card-title" className="display page__title">
          Your witch card
        </h2>
        <p className="page__sub">
          Write in your birth date to open your book: your Sun, Moon and rising,
          your craft, your numbers, and the moon you were born under.
        </p>
      </section>
    );
  }

  const longitudeOf = (planet: "Sun" | "Moon") =>
    chart.positions.find((position) => position.planet === planet)?.longitude ??
    0;

  const craft = craftOf(chart);
  const balance = elementBalance(chart);
  const total = ELEMENTS.reduce((sum, element) => sum + balance[element], 0);
  const { lifePath } = birthNumbers(birth, profile.name, thisYear);
  const path = meaningOf(lifePath);
  const moonPhase = birthMoonOf(birth);
  const season = birthSeasonOf(birth);
  const lunar = lunarYearOf(birth.day);
  const weekday = planetaryDayOf(birth);
  const [moonFrom, moonTo] = chart.moonSpan ?? [];
  const moonUnsure = moonFrom && moonTo && moonFrom.sign !== moonTo.sign;

  return (
    <section
      aria-labelledby="card-title"
      className="panel panel--book panel--wide witch-card"
    >
      <span className="legend">witch-card.png</span>
      <p className="kicker">
        {profile.name.trim() || "A witch"}, born{" "}
        {formatDay(birth.day, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <h2 id="card-title" className="display page__title">
        {craft.name}
      </h2>
      <p className="witch-card__about">{craft.about}</p>

      <div className="lights">
        <Light
          label="Sun"
          glyph={PLANET_GLYPHS.Sun}
          longitude={longitudeOf("Sun")}
        />
        <Light
          label="Moon"
          glyph={PLANET_GLYPHS.Moon}
          longitude={longitudeOf("Moon")}
        />
        <Light
          label="Rising"
          glyph="↑"
          longitude={chart.angles?.ascendant ?? null}
        />
      </div>
      {moonUnsure ? (
        <p className="hint">
          Without a birth time your Moon is in {moonFrom.sign.name} or{" "}
          {moonTo.sign.name}: it changed signs that day.
        </p>
      ) : null}
      {chart.angles ? null : (
        <p className="hint">
          The rising sign needs a birth time and a birthplace.
        </p>
      )}

      <dl className="facts">
        <div>
          <dt>Life path</dt>
          <dd>
            <span className="display facts__big">{lifePath}</span> {path?.title}
          </dd>
        </div>
        <div>
          <dt>Born under</dt>
          <dd>
            <MoonGlyph angle={moonAngle(birth.moment)} size={20} /> a{" "}
            {moonPhase}
          </dd>
        </div>
        <div>
          <dt>Lunar zodiac</dt>
          <dd>
            {lunar.animal.emoji} {yearName(lunar)}
          </dd>
        </div>
        <div>
          <dt>Born in the season of</dt>
          <dd>{season?.sabbat.name ?? "?"}</dd>
        </div>
        <div>
          <dt>Born on</dt>
          <dd>
            a {weekday?.day}, {weekday ? dayOwner(weekday.planet) : ""} day:{" "}
            {weekday?.gift}
          </dd>
        </div>
      </dl>

      <div className="stack">
        <h3 className="field-label">Your elements</h3>
        <ul className="elements">
          {ELEMENTS.map((element) => (
            <li key={element} className="element">
              <span className="element__name">{ELEMENT_NAMES[element]}</span>
              <span className="element__track" aria-hidden="true">
                <span
                  className="element__fill"
                  style={{ width: `${(balance[element] / total) * 100}%` }}
                />
              </span>
              <span className="element__count">
                {Math.round((balance[element] / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
