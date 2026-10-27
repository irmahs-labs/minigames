import { useMemo } from "react";

import { formatDay } from "./format";
import {
  ANIMALS,
  ELEMENT_LORE,
  allies,
  clash,
  hourAnimal,
  hoursOf,
  lunarNewYear,
  lunarYearOf,
  secretFriend,
  yearName,
  yearsOf,
} from "./lunar-zodiac";
import type { Animal, LunarYear } from "./lunar-zodiac";
import type { Birth } from "./profile";
import { dayKey, parseClock } from "./time";

const LONG_DAY = { day: "numeric", month: "long", year: "numeric" } as const;

/** The animals one gets on with, as a sentence: "Dragon 🐉, Monkey 🐒". */
const listed = (animals: readonly Animal[]) =>
  animals.map((animal) => `${animal.name} ${animal.emoji}`).join(", ");

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
      <section className="panel panel--book panel--wide empty">
        <span className="legend">your-animal.txt</span>
        <h2 className="display page__title">Your animal</h2>
        <p className="page__sub">
          Your birth date on your profile tells which of the twelve is yours.
        </p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onOpenProfile}
        >
          Fill in your profile
        </button>
      </section>
    );
  }

  const year = lunarYearOf(birth.day);
  const { animal } = year;
  const newYear = lunarNewYear(birth.year);
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
            {year.polarity} {year.element} · {animal.hanzi}
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
      {birth.day < newYear ? (
        <p className="hint">
          Born before that year’s Lunar New Year ({formatDay(newYear, LONG_DAY)}
          ), so your animal is the year before’s.
        </p>
      ) : null}
    </section>
  );
};

/** The year we are in, and when the next one starts. */
const ThisYear = ({ now, timeZone }: { now: Date; timeZone: string }) => {
  const today = dayKey(now, timeZone);
  const year = lunarYearOf(today);
  const next = lunarYearOf(lunarNewYear(year.year + 1));
  const started = lunarNewYear(year.year);
  const nextStart = lunarNewYear(year.year + 1);

  return (
    <section
      aria-labelledby="this-year-title"
      className="panel panel--book panel--narrow lunar-year"
    >
      <span className="legend">this-year.txt</span>
      <span aria-hidden="true" className="lunar-you__emoji">
        {year.animal.emoji}
      </span>
      <p className="kicker">This year</p>
      <h2 id="this-year-title" className="display page__title">
        Year of the {yearName(year)}
      </h2>
      <p className="page__sub">
        From {formatDay(started, LONG_DAY)} to the next Lunar New Year,{" "}
        {formatDay(nextStart, LONG_DAY)}.
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
      Each year begins at the Lunar New Year, between 21 January and 20
      February: born in January or early February, check the year before. In
      Vietnam the Rabbit is the Cat and the Ox the Buffalo.
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
  const current = useMemo(
    () => lunarYearOf(dayKey(now, timeZone)),
    [now, timeZone]
  );

  const yours = birth ? lunarYearOf(birth.day).animal : null;

  return (
    <>
      <div className="layout">
        <YourAnimal
          birth={birth}
          birthTime={birthTime}
          onOpenProfile={onOpenProfile}
        />
        <ThisYear now={now} timeZone={timeZone} />
      </div>
      <TwelveAnimals yours={yours} current={current} />
    </>
  );
};
