import { festivalsIn } from "./festivals";
import { FestivalsPanel } from "./festivals-panel";
import { LONG_DAY, formatDay } from "./format";
import {
  ANIMALS,
  ELEMENT_LORE,
  allies,
  clash,
  cycleName,
  hourAnimal,
  hoursOf,
  lunarNewYear,
  lunarYear,
  lunarYearOf,
  secretFriend,
  yearName,
  yearsOf,
} from "./lunar-zodiac";
import type { Animal, LunarYear } from "./lunar-zodiac";
import { NeedsBirth } from "./needs-birth";
import type { Birth } from "./profile";
import { dayKey, parseClock } from "./time";

/** The animals one gets on with, as a sentence: "Dragon 🐉, Monkey 🐒". */
const listed = (animals: readonly Animal[]) =>
  animals.map((animal) => `${animal.name} ${animal.emoji}`).join(", ");

/** Khmer New Year's first day, Moha Songkran, in a year. */
const songkranOf = (year: number): string | null =>
  festivalsIn(year).find((entry) => entry.festival.id === "songkran")?.start ??
  null;

/**
 * Who you are by the old reckoning, when it differs: the animal changes at
 * the Lunar New Year, and in Cambodia not until Khmer New Year in April.
 */
const traditionally = (day: string, year: number): string | null => {
  const before = lunarYear(year - 1);
  const newYear = lunarNewYear(year);

  if (day < newYear) {
    return `By tradition the animal changes at the Lunar New Year (${formatDay(newYear, LONG_DAY)}), so before it you are the ${yearName(before)} ${before.animal.emoji}.`;
  }

  const songkran = songkranOf(year);

  return songkran && day < songkran
    ? `In Cambodia the animal changes at Khmer New Year (${formatDay(songkran, LONG_DAY)}), so there you are the ${before.animal.name} ${before.animal.emoji}.`
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
        title="Your animal"
        text="Your birth date on your profile tells which of the twelve is yours."
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
            {year.polarity} {year.element} · {cycleName(year)}
          </p>
          <h2 id="animal-title" className="display page__title">
            {yearName(year)}
          </h2>
          <p className="page__sub">{animal.keywords}</p>
        </div>
      </div>
      <p className="witch-card__about">{animal.about}</p>
      <dl className="facts">
        <div>
          <dt>Strengths</dt>
          <dd>{animal.strengths}</dd>
        </div>
        <div>
          <dt>Challenges</dt>
          <dd>{animal.challenges}</dd>
        </div>
        <div>
          <dt>{year.element}</dt>
          <dd>
            Makes your {animal.name} {ELEMENT_LORE[year.element]}.
          </dd>
        </div>
        <div>
          <dt>Best with</dt>
          <dd>
            {listed(allies(animal))}, and your secret friend the{" "}
            {secretFriend(animal).name} {secretFriend(animal).emoji}
          </dd>
        </div>
        <div>
          <dt>Clashes with</dt>
          <dd>
            the {clash(animal).name} {clash(animal).emoji}
          </dd>
        </div>
        {inner ? (
          <div>
            <dt>Your inner animal</dt>
            <dd>
              the {inner.name} {inner.emoji}, from your birth hour (
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
      <p className="kicker">This year · {cycleName(year)}</p>
      <h2 id="this-year-title" className="display page__title">
        Year of the {yearName(year)}
      </h2>
      <p className="page__sub">
        From 1 January to 31 December {year.year}. By tradition it begins at the
        Lunar New Year, {formatDay(newYear, LONG_DAY)}
        {songkran
          ? `, and in Cambodia at Khmer New Year, ${formatDay(songkran, LONG_DAY)}`
          : ""}
        .
      </p>
      <p>
        A {year.element} year is {ELEMENT_LORE[year.element]}; the{" "}
        {year.animal.name} brings {year.animal.keywords}.
      </p>
      <p className="hint">
        Next: the {yearName(next)} {next.animal.emoji}.
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
      The twelve animals
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
            {animal.name} <span className="animal__hanzi">{animal.hanzi}</span>
          </h3>
          <p className="animal__keywords">
            {animal.branch.hanzi} {animal.branch.pinyin} · Khmer {animal.khmer}
          </p>
          <p className="animal__keywords">{animal.keywords}</p>
          <p className="animal__years">
            {yearsOf(animal, current.year).join(", ")}
          </p>
          {animal === yours ? <span className="badge">yours</span> : null}
          {animal === current.animal ? (
            <span className="badge badge--retro">this year</span>
          ) : null}
        </li>
      ))}
    </ol>
    <p className="hint">
      Here each animal’s year runs from 1 January. By tradition it begins at the
      Lunar New Year, between 21 January and 20 February, and in Cambodia at
      Khmer New Year in mid-April. In Vietnam the Rabbit is the Cat and the Ox
      the Buffalo; in Japan the Pig is the Boar.
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
      {year.stem.hanzi} {year.polarity} {year.element} and{" "}
      {year.animal.branch.hanzi} the {year.animal.name}, year {year.cycle} of 60
    </dd>
  </div>
);

/** Where the animals come from: the cycle, the legend, and the road. */
const Roots = ({
  current,
  yours,
}: {
  current: LunarYear;
  yours: LunarYear | null;
}) => (
  <section
    aria-labelledby="roots-title"
    className="panel panel--book panel--narrow roots"
  >
    <span className="legend">roots.txt</span>
    <h2 id="roots-title" className="display book__title">
      The roots
    </h2>
    <h3 className="field-label">Stems and branches</h3>
    <p>
      Every year has a two-character name: one of the ten Heavenly Stems (天干),
      which gives its element, yang or yin, and one of the twelve Earthly
      Branches (地支), which gives its animal. Together they go round in sixty
      years, and China has counted its years with them for over two thousand.
    </p>
    <dl className="facts">
      <CycleRow label="This year" year={current} />
      {yours ? <CycleRow label="Your year" year={yours} /> : null}
    </dl>
    {yours ? (
      <p className="hint">
        Your own pair comes back in {yours.year + 60}, your sixtieth year: a
        whole cycle, and a big birthday across East Asia.
      </p>
    ) : null}
    <h3 className="field-label">The Great Race</h3>
    <p>
      The Jade Emperor called the animals to race across a river and named the
      years for them in the order they arrived. The Rat rode over on the Ox’s
      back and jumped off first. The Cat, pushed in by the Rat, never made it,
      and has chased rats ever since.
    </p>
    <h3 className="field-label">The road it took</h3>
    <p>
      The twelve are first listed on bamboo slips from the third century BCE.
      With the calendar they went to Korea, Japan, Vietnam, Mongolia and Tibet,
      and across Southeast Asia: Cambodia names its years Chhut, Chlov, Khal…
      (Rat, Ox, Tiger…) and starts them at Khmer New Year, as Thailand and Laos
      did too.
    </p>
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
      <div className="layout">
        <FestivalsPanel today={today} />
        <Roots current={current} yours={yours} />
      </div>
      <TwelveAnimals yours={yours?.animal ?? null} current={current} />
    </>
  );
};
