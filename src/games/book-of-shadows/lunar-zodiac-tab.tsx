import { festivalsIn } from "./buddhist-calendar";
import { LONG_DAY, formatDay } from "./format";
import { inFrench, say, tr } from "./french";
import {
  ANIMALS,
  ELEMENT_LORE,
  allies,
  STEMS,
  clash,
  cycleName,
  dayPillarOf,
  hourAnimal,
  hoursOf,
  lunarNewYear,
  lunarYear,
  lunarYearOf,
  secretFriend,
  yearName,
  yearsOf,
} from "./lunar-zodiac";
import type { Animal, DayPillar, LunarYear } from "./lunar-zodiac";
import { NeedsBirth } from "./needs-birth";
import type { Birth } from "./profile";
import { dayKey, mod, parseClock } from "./time";

/** The animals one gets on with, as a sentence: "Dragon 🐉, Monkey 🐒". */
const listed = (animals: readonly Animal[]) =>
  animals.map((animal) => `${say(animal.name)} ${animal.emoji}`).join(", ");

/** "the Dragon 🐉", or "le Dragon 🐉" (la Chèvre) in French. */
const theAnimal = (animal: Animal) =>
  inFrench()
    ? `${animal.id === "goat" ? "la" : "le"} ${say(animal.name)} ${animal.emoji}`
    : `the ${animal.name} ${animal.emoji}`;

/** Khmer New Year's first day, Moha Songkran, in a year. */
const songkranOf = (year: number): string | null =>
  festivalsIn(year).find((entry) => entry.festival.id === "khmer-new-year")
    ?.start ?? null;

/**
 * Who you are by the old reckoning, when it differs: the animal changes at
 * the Lunar New Year, and in Cambodia not until Khmer New Year in April.
 */
const traditionally = (day: string, year: number): string | null => {
  const before = lunarYear(year - 1);
  const newYear = lunarNewYear(year);

  if (day < newYear) {
    return tr(
      `By tradition the animal changes at the Lunar New Year (${formatDay(newYear, LONG_DAY)}), so before it you are the ${yearName(before)} ${before.animal.emoji}.`,
      `Par tradition, l’animal change au Nouvel an lunaire (${formatDay(newYear, LONG_DAY)}) : avant, vous êtes ${yearName(before)} ${before.animal.emoji}.`
    );
  }

  const songkran = songkranOf(year);

  return songkran && day < songkran
    ? tr(
        `In Cambodia the animal changes at Khmer New Year (${formatDay(songkran, LONG_DAY)}), so there you are the ${before.animal.name} ${before.animal.emoji}.`,
        `Au Cambodge, l’animal change au Nouvel an khmer (${formatDay(songkran, LONG_DAY)}) : là-bas, vous êtes ${theAnimal(before.animal)}.`
      )
    : null;
};

/** Your year: its animal, its element, your hour's animal and your matches. */
const YourAnimal = ({
  birth,
  birthTime,
  onOpenProfile,
}: {
  birth: Birth | null;
  birthTime: string;
  onOpenProfile: () => void;
}) => {
  if (!birth) {
    return (
      <NeedsBirth
        onOpen={onOpenProfile}
        legend="your-animal.txt"
        title={tr("Your animal", "Votre animal")}
        text={tr(
          "Your birth date on your profile tells which of the twelve is yours.",
          "Votre date de naissance, dans votre profil, dit lequel des douze est le vôtre."
        )}
        className="panel--wide"
      />
    );
  }

  const year = lunarYearOf(birth.day);
  const { animal } = year;
  const note = traditionally(birth.day, birth.year);
  const clock = parseClock(birthTime);
  const inner = clock ? hourAnimal(clock.hour) : null;

  return (
    <section
      aria-labelledby="animal-title"
      className="panel panel--book panel--wide lunar-you"
    >
      <span className="legend">your-animal.txt</span>
      <div className="lunar-you__head">
        <span aria-hidden="true" className="lunar-you__emoji">
          {animal.emoji}
        </span>
        <div className="stack">
          <p className="kicker">
            {year.polarity} {say(year.element)} · {cycleName(year)}
          </p>
          <h2 id="animal-title" className="display page__title">
            {yearName(year)}
          </h2>
          <p className="page__sub">{say(animal.keywords)}</p>
        </div>
      </div>
      <p className="witch-card__about">{say(animal.about)}</p>
      <dl className="facts">
        <div>
          <dt>{tr("Strengths", "Forces")}</dt>
          <dd>{say(animal.strengths)}</dd>
        </div>
        <div>
          <dt>{tr("Challenges", "Défis")}</dt>
          <dd>{say(animal.challenges)}</dd>
        </div>
        <div>
          <dt>{say(year.element)}</dt>
          <dd>
            {tr(
              `Makes your ${animal.name} ${ELEMENT_LORE[year.element]}.`,
              `Rend votre ${say(animal.name)} ${say(ELEMENT_LORE[year.element])}.`
            )}
          </dd>
        </div>
        <div>
          <dt>{tr("Best with", "Idéal avec")}</dt>
          <dd>
            {listed(allies(animal))}
            {tr(", and your secret friend ", ", et votre ami secret, ")}
            {theAnimal(secretFriend(animal))}
          </dd>
        </div>
        <div>
          <dt>{tr("Clashes with", "S’oppose à")}</dt>
          <dd>{theAnimal(clash(animal))}</dd>
        </div>
        {inner ? (
          <div>
            <dt>{tr("Your inner animal", "Votre animal intérieur")}</dt>
            <dd>
              {theAnimal(inner)}
              {tr(
                ", from your birth hour (",
                ", d’après votre heure de naissance ("
              )}
              {hoursOf(inner)})
            </dd>
          </div>
        ) : null}
      </dl>
      {note ? <p className="hint">{note}</p> : null}
    </section>
  );
};

/** The year we are in, and when tradition starts it. */
const ThisYear = ({ year }: { year: LunarYear }) => {
  const next = lunarYear(year.year + 1);
  const newYear = lunarNewYear(year.year);
  const songkran = songkranOf(year.year);

  return (
    <section
      aria-labelledby="this-year-title"
      className="panel panel--book panel--narrow lunar-year"
    >
      <span className="legend">this-year.txt</span>
      <span aria-hidden="true" className="lunar-you__emoji">
        {year.animal.emoji}
      </span>
      <p className="kicker">
        {tr("This year", "Cette année")} · {cycleName(year)}
      </p>
      <h2 id="this-year-title" className="display page__title">
        {tr(
          `Year of the ${yearName(year)}`,
          `Année ${year.animal.id === "goat" ? "de la" : "du"} ${yearName(year)}`
        )}
      </h2>
      <p className="page__sub">
        {tr(
          `From 1 January to 31 December ${year.year}. By tradition it begins at the Lunar New Year, ${formatDay(newYear, LONG_DAY)}`,
          `Du 1er janvier au 31 décembre ${year.year}. Par tradition, elle commence au Nouvel an lunaire, le ${formatDay(newYear, LONG_DAY)}`
        )}
        {songkran
          ? tr(
              `, and in Cambodia at Khmer New Year, ${formatDay(songkran, LONG_DAY)}`,
              `, et au Cambodge au Nouvel an khmer, le ${formatDay(songkran, LONG_DAY)}`
            )
          : ""}
        .
      </p>
      <p>
        {tr(
          `A ${year.element} year is ${ELEMENT_LORE[year.element]}; the ${year.animal.name} brings ${year.animal.keywords}.`,
          `Une année de ${say(year.element)} est ${say(ELEMENT_LORE[year.element])} ; ${theAnimal(year.animal)} apporte ${say(year.animal.keywords)}.`
        )}
      </p>
      <p className="hint">
        {tr("Next: the ", "Ensuite : ")}
        {yearName(next)} {next.animal.emoji}.
      </p>
    </section>
  );
};

/** All twelve, with their recent years: yours and this year's picked out. */
const TwelveAnimals = ({
  yours,
  current,
}: {
  yours: Animal | null;
  current: LunarYear;
}) => (
  <section aria-labelledby="twelve-title" className="panel panel--book">
    <span className="legend">twelve-animals.csv</span>
    <h2 id="twelve-title" className="display book__title">
      {tr("The twelve animals", "Les douze animaux")}
    </h2>
    <ol className="animals">
      {ANIMALS.map((animal) => (
        <li
          key={animal.id}
          className={animal === yours ? "animal animal--yours" : "animal"}
        >
          <span aria-hidden="true" className="animal__emoji">
            {animal.emoji}
          </span>
          <h3 className="display animal__name">
            {say(animal.name)}{" "}
            <span className="animal__hanzi">{animal.hanzi}</span>
          </h3>
          <p className="animal__keywords">
            {animal.branch.hanzi} {animal.branch.pinyin} · Khmer {animal.khmer}
          </p>
          <p className="animal__keywords">{say(animal.keywords)}</p>
          <p className="animal__years">
            {yearsOf(animal, current.year).join(", ")}
          </p>
          {animal === yours ? (
            <span className="badge">{tr("yours", "le vôtre")}</span>
          ) : null}
          {animal === current.animal ? (
            <span className="badge badge--retro">
              {tr("this year", "cette année")}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
    <p className="hint">
      {tr(
        "Here each animal’s year runs from 1 January. By tradition it begins at the Lunar New Year, between 21 January and 20 February, and in Cambodia at Khmer New Year in mid-April. In Vietnam the Rabbit is the Cat and the Ox the Buffalo; in Japan the Pig is the Boar.",
        "Ici, l’année de chaque animal court à partir du 1er janvier. Par tradition, elle commence au Nouvel an lunaire, entre le 21 janvier et le 20 février, et au Cambodge au Nouvel an khmer, mi-avril. Au Viêt Nam, le Lapin est le Chat et le Buffle le Buffle d’eau ; au Japon, le Cochon est le Sanglier."
      )}
    </p>
  </section>
);

/** A year's two-character name, taken apart. */
const CycleRow = ({ label, year }: { label: string; year: LunarYear }) => (
  <div>
    <dt>
      {label}, {cycleName(year)}
    </dt>
    <dd>
      {tr(
        `${year.stem.hanzi} ${year.polarity} ${year.element} and ${year.animal.branch.hanzi} the ${year.animal.name}, year ${year.cycle} of 60`,
        `${year.stem.hanzi} ${year.polarity} ${say(year.element)} et ${year.animal.branch.hanzi} ${theAnimal(year.animal).replace(/ \S+$/u, "")}, année ${year.cycle} sur 60`
      )}
    </dd>
  </div>
);

/**
 * The ten Heavenly Stems, the roots of the calendar: this year's and yours
 * picked out, with the stem of the day you were born, your day master.
 */
const HeavenlyStems = ({
  current,
  yours,
  day,
}: {
  current: LunarYear;
  yours: LunarYear | null;
  day: DayPillar | null;
}) => (
  <section
    aria-labelledby="stems-title"
    className="panel panel--book stems-panel"
  >
    <span className="legend">heavenly-stems.csv</span>
    <p className="kicker">天干 tiāngān</p>
    <h2 id="stems-title" className="display book__title">
      {tr("The Heavenly Stems", "Les Tiges célestes")}
    </h2>
    <p>
      {tr(
        "The roots of the calendar. Every year, month, day and hour takes one of the ten stems, which gives its element, yang or yin, paired with one of the twelve Earthly Branches, which gives its animal. Together they go round in sixty.",
        "Les racines du calendrier. Chaque année, mois, jour et heure prend l’une des dix tiges, qui donne son élément, yang ou yin, associée à l’une des douze Branches terrestres, qui donne son animal. Ensemble, elles font un cycle de soixante."
      )}
    </p>
    <dl className="facts">
      <CycleRow label={tr("This year", "Cette année")} year={current} />
      {yours ? (
        <CycleRow label={tr("Your year", "Votre année")} year={yours} />
      ) : null}
      {day ? (
        <div>
          <dt>
            {tr("Your day master", "Votre maître du jour")}, {day.stem.hanzi}
            {day.animal.branch.hanzi}
          </dt>
          <dd>
            {day.stem.hanzi} {day.stem.polarity} {say(day.stem.element)},{" "}
            {say(day.stem.image)}
            {tr(
              ": the stem of the day you were born, who you are in Four Pillars (八字) astrology",
              " : la tige du jour de votre naissance, qui vous êtes dans l’astrologie des Quatre Piliers (八字)"
            )}
          </dd>
        </div>
      ) : null}
    </dl>
    <ol className="stems">
      {STEMS.map((stem, i) => {
        const badges = (
          [
            [current.stem, tr("this year", "cette année")],
            [yours?.stem, tr("your year", "votre année")],
            [day?.stem, tr("your day", "votre jour")],
          ] as const
        ).flatMap(([marked, label]) => (marked === stem ? [label] : []));

        return (
          <li
            key={stem.hanzi}
            className={badges.length > 0 ? "stem stem--marked" : "stem"}
          >
            <span className="display stem__hanzi">{stem.hanzi}</span>
            <div className="stack">
              <h3 className="stem__name">
                {stem.pinyin} · {stem.polarity} {say(stem.element)}
              </h3>
              <p>
                {say(stem.image)}
                {tr(": ", " : ")}
                {say(stem.keywords)}
              </p>
              <p className="stem__years">
                {tr("years ending in", "années finissant par")} {mod(i + 4, 10)}
              </p>
              {badges.length > 0 ? (
                <p className="stem__badges">
                  {badges.map((badge) => (
                    <span key={badge} className="badge">
                      {badge}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
    {yours ? (
      <p className="hint">
        {tr(
          `Your own pair comes back in ${yours.year + 60}, your sixtieth year: a whole cycle, and a big birthday across East Asia.`,
          `Votre propre paire revient en ${yours.year + 60}, l’année de vos soixante ans : un cycle complet, et un grand anniversaire dans toute l’Asie de l’Est.`
        )}
      </p>
    ) : null}
  </section>
);

export const LunarZodiacTab = ({
  birth,
  birthTime,
  now,
  timeZone,
  onOpenProfile,
}: {
  birth: Birth | null;
  birthTime: string;
  now: Date;
  timeZone: string;
  onOpenProfile: () => void;
}) => {
  const today = dayKey(now, timeZone);
  const current = lunarYearOf(today);
  const yours = birth ? lunarYearOf(birth.day) : null;

  return (
    <>
      <div className="layout">
        <YourAnimal
          birth={birth}
          birthTime={birthTime}
          onOpenProfile={onOpenProfile}
        />
        <ThisYear year={current} />
      </div>
      <TwelveAnimals yours={yours?.animal ?? null} current={current} />
      <HeavenlyStems
        current={current}
        yours={yours}
        day={birth ? dayPillarOf(birth.day) : null}
      />
    </>
  );
};
