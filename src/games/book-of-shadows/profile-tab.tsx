import { useConfirm } from "../../lib/use-confirm";
import { BirthplaceField } from "./birthplace-field";
import { LONG_DAY, formatDay } from "./format";
import { inFrench, pick, say, tr } from "./french";
import { lunarYearOf, yearName } from "./lunar-zodiac";
import { Meter } from "./meter";
import { MoonGlyph } from "./moon-glyph";
import { meaningOf } from "./numerology";
import {
  MAX_NAME,
  birthMoonOf,
  birthNumbers,
  birthSeasonOf,
  craftOf,
  elementBalance,
  longitudeIn,
  planetaryDayOf,
} from "./profile";
import type { Birth, Chart, Profile } from "./profile";
import { SignName } from "./sign-name";
import { PLANET_GLYPHS, moonAngle } from "./sky";
import { witchTitle } from "./titles";
import { ELEMENTS, ELEMENT_NAMES } from "./zodiac";

/** Every time zone the browser knows, for a birthplace not on the list. */
const TIME_ZONES = Intl.supportedValuesOf("timeZone");

/** Their options, built once: the forms re-render on every keystroke. */
const ZONE_OPTIONS = TIME_ZONES.map((zone) => (
  <option key={zone} value={zone}>
    {zone}
  </option>
));

/** Your own, or your soulmate's: the person you are matching yours with. */
export type Who = "you" | "partner";

interface DetailsProps {
  who: Who;
  profile: Profile;
  onChange: (fields: Partial<Profile>) => void;
  onClear: () => void;
}

/**
 * The birth details, what every reading in the book is drawn from: a row of
 * fields across the page, which stack on a phone.
 */
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
    <section aria-labelledby={`${prefix}-title`} className="panel panel--book">
      <span className="legend">
        {who === "you" ? "birth-details.txt" : "soul-mate.txt"}
      </span>
      <h2 id={`${prefix}-title`} className="display book__title">
        {who === "you"
          ? tr("Your details", "Vos informations")
          : tr("Your soulmate", "Votre âme sœur")}
      </h2>
      {who === "partner" ? (
        <p className="hint">
          {tr(
            "A partner, a friend or a crush: the Birth chart, Numerology and Lunar Zodiac pages then show how the two of you match.",
            "Un partenaire, un ami ou un coup de cœur : les pages Thème astral, Numérologie et Zodiaque lunaire montrent alors votre compatibilité."
          )}
        </p>
      ) : null}

      <div className="details__fields">
        <div className="stack">
          <label className="field-label" htmlFor={`${prefix}-name`}>
            {tr("Name", "Nom")}
          </label>
          <input
            id={`${prefix}-name`}
            className="field"
            value={profile.name}
            maxLength={MAX_NAME}
            autoComplete={who === "you" ? "name" : "off"}
            placeholder={tr("Name", "Nom")}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>
        <div className="stack">
          <label className="field-label" htmlFor={`${prefix}-date`}>
            {tr("Birth date", "Date de naissance")}
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
            {tr("Birth time", "Heure de naissance")}
          </label>
          <input
            id={`${prefix}-time`}
            type="time"
            className="field"
            value={profile.birthTime}
            onChange={(event) => onChange({ birthTime: event.target.value })}
          />
        </div>
        <BirthplaceField
          idPrefix={prefix}
          profile={profile}
          onChange={onChange}
        />
      </div>
      <p className="hint">
        {tr(
          "No birth time? Leave it empty: everything but the rising sign and the houses still works.",
          "Pas d’heure de naissance ? Laissez vide : tout fonctionne sauf l’ascendant et les maisons."
        )}
      </p>

      <details className="details__more">
        <summary className="field-label">
          {tr(
            "Coordinates and time zone, to check or type in",
            "Coordonnées et fuseau horaire, à vérifier ou à saisir"
          )}
        </summary>
        <div className="details__fields">
          <div className="stack">
            <label className="field-label" htmlFor={`${prefix}-lat`}>
              {tr("Latitude (N +, S −)", "Latitude (N +, S −)")}
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
              {tr("Longitude (E +, W −)", "Longitude (E +, O −)")}
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
          <div className="stack">
            <label className="field-label" htmlFor={`${prefix}-zone`}>
              {tr("Time zone", "Fuseau horaire")}
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
            <datalist id={`${prefix}-zones`}>{ZONE_OPTIONS}</datalist>
          </div>
        </div>
      </details>

      <div className="details__foot">
        <p className="hint">
          {tr(
            "Saved in this browser only.",
            "Enregistré dans ce navigateur uniquement."
          )}
        </p>
        <button
          type="button"
          className="btn btn--quiet"
          disabled={!filled}
          onClick={() => confirm.press("clear", onClear)}
        >
          {confirm.armed === "clear"
            ? tr("Sure? Clear", "Sûr ? Effacer")
            : tr("Clear", "Effacer")}
        </button>
      </div>
    </section>
  );
};

interface CardProps {
  who: Who;
  profile: Profile;
  birth: Birth | null;
  chart: Chart | null;
  thisYear: number;
}

/** "the Sun's", "Saturn's": the lights take "the", the planets do not. */
const dayOwner = (planet: string) =>
  planet === "Sun" || planet === "Moon" ? `the ${planet}’s` : `${planet}’s`;

const FRENCH_OWNERS = new Map(
  Object.entries({ Moon: "de la Lune", Sun: "du Soleil" })
);

/** "a Sunday, the Sun's day", or "un dimanche, jour du Soleil". */
const bornOn = (day: string, planet: string) =>
  inFrench()
    ? `un ${say(day)}, jour ${FRENCH_OWNERS.get(planet) ?? `de ${say(planet)}`}`
    : `a ${day}, ${dayOwner(planet)} day`;

/** "Sun ☉ in Leo ♌". */
const Light = ({
  label,
  glyph,
  longitude,
}: {
  label: string;
  glyph: string;
  longitude: number | null;
}) => (
  <div className="light">
    <span className="light__label">
      <span aria-hidden="true">{glyph} </span>
      {say(label)}
    </span>
    <span className="display light__sign">
      {longitude === null ? "?" : <SignName longitude={longitude} />}
    </span>
  </div>
);

/** What changes between your card and your soulmate's. */
const CARDS = {
  partner: {
    empty: [
      "Write in their birth date to see their card: their Sun, Moon and rising, their craft, their numbers, and the moon they were born under.",
      "Inscrivez sa date de naissance pour voir sa carte : son Soleil, sa Lune et son ascendant, sa magie, ses nombres, et la lune sous laquelle il ou elle est né·e.",
    ],
    legend: "soulmate-card.png",
    their: ["their", "sa"],
    title: ["Their witch card", "Sa carte de sorcière"],
  },
  you: {
    empty: [
      "Write in your birth date to open your book: your Sun, Moon and rising, your craft, your numbers, and the moon you were born under.",
      "Inscrivez votre date de naissance pour ouvrir votre livre : votre Soleil, votre Lune et votre ascendant, votre magie, vos nombres, et la lune sous laquelle vous êtes né·e.",
    ],
    legend: "witch-card.png",
    their: ["your", "votre"],
    title: ["Your witch card", "Votre carte de sorcière"],
  },
} as const;

/** A witch card: a profile at a glance, drawn from everything else. */
export const WitchCard = ({
  who,
  profile,
  birth,
  chart,
  thisYear,
}: CardProps) => {
  const card = CARDS[who];
  const titleId = `${who}-card-title`;

  if (!birth || !chart) {
    return (
      <section aria-labelledby={titleId} className="panel panel--book empty">
        <span className="legend">{card.legend}</span>
        <h2 id={titleId} className="display page__title">
          {pick(card.title)}
        </h2>
        <p className="page__sub">{pick(card.empty)}</p>
      </section>
    );
  }

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

  const title = witchTitle({
    animal: lunar.animal.id,
    moon: longitudeIn(chart, "Moon"),
    rising: chart.angles?.ascendant ?? null,
    sun: longitudeIn(chart, "Sun"),
  });

  return (
    <section aria-labelledby={titleId} className="panel panel--book witch-card">
      <span className="legend">{card.legend}</span>
      <p className="kicker">
        {profile.name.trim() || tr("A witch", "Une sorcière")}
        {tr(", born ", ", née le ")}
        {formatDay(birth.day, LONG_DAY)}
      </p>
      <h2 id={titleId} className="display page__title">
        {title}
      </h2>
      <p className="witch-card__about">
        <strong>{say(craft.name)}.</strong> {say(craft.about)}
      </p>

      <div className="lights">
        <Light
          label="Sun"
          glyph={PLANET_GLYPHS.Sun}
          longitude={longitudeIn(chart, "Sun")}
        />
        <Light
          label="Moon"
          glyph={PLANET_GLYPHS.Moon}
          longitude={longitudeIn(chart, "Moon")}
        />
        <Light
          label={tr("Rising", "Ascendant")}
          glyph="↑"
          longitude={chart.angles?.ascendant ?? null}
        />
      </div>
      {moonUnsure ? (
        <p className="hint">
          {tr(
            `Without a birth time ${card.their[0]} Moon is in ${moonFrom.sign.name} or ${moonTo.sign.name}: it changed signs that day.`,
            `Sans heure de naissance, ${card.their[1]} Lune est en ${say(moonFrom.sign.name)} ou en ${say(moonTo.sign.name)} : elle a changé de signe ce jour-là.`
          )}
        </p>
      ) : null}
      {chart.angles ? null : (
        <p className="hint">
          {tr(
            "The rising sign needs a birth time and a birthplace; it gives the first word of the title.",
            "L’ascendant demande une heure et un lieu de naissance ; il donne une partie du titre."
          )}
        </p>
      )}

      <dl className="facts">
        <div>
          <dt>{tr("Life path", "Chemin de vie")}</dt>
          <dd>
            <span className="display facts__big">{lifePath}</span>{" "}
            {path ? say(path.title) : null}
          </dd>
        </div>
        <div>
          <dt>{tr("Born under", "Né·e sous")}</dt>
          <dd>
            <MoonGlyph angle={moonAngle(birth.moment)} size={20} />{" "}
            {tr("a ", "")}
            {say(moonPhase)}
          </dd>
        </div>
        <div>
          <dt>{tr("Lunar zodiac", "Zodiaque lunaire")}</dt>
          <dd>
            {lunar.animal.emoji} {yearName(lunar)}
          </dd>
        </div>
        <div>
          <dt>{tr("Born in the season of", "Né·e à la saison de")}</dt>
          <dd>{season ? say(season.sabbat.name) : "?"}</dd>
        </div>
        <div>
          <dt>{tr("Born on", "Né·e un")}</dt>
          <dd>
            {weekday ? bornOn(weekday.day, weekday.planet) : ""}
            {tr(": ", " : ")}
            {weekday ? say(weekday.gift) : ""}
          </dd>
        </div>
      </dl>

      <div className="stack">
        <h3 className="field-label">
          {who === "you"
            ? tr("Your elements", "Vos éléments")
            : tr("Their elements", "Ses éléments")}
        </h3>
        <ul className="elements">
          {ELEMENTS.map((element) => (
            <li key={element} className="element">
              <span className="element__name">
                {say(ELEMENT_NAMES[element])}
              </span>
              <Meter percent={(balance[element] / total) * 100} />
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
