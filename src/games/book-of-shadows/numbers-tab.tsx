import {
  MASTER_NUMBERS,
  meaningOf,
  personalYearOf,
  reduce,
} from "./numerology";
import { birthNumbers } from "./profile";
import type { Birth } from "./profile";

interface NumbersTabProps {
  birth: Birth;
  name: string;
  thisYear: number;
}

/** One number on its card: the number, what it is, and what it means. */
const NumberCard = ({
  label,
  from,
  value,
}: {
  label: string;
  from: string;
  value: number | null;
}) => {
  const meaning = value === null ? null : meaningOf(value);

  return (
    <li
      className={
        value !== null && MASTER_NUMBERS.includes(value)
          ? "number-card number-card--master"
          : "number-card"
      }
    >
      <p className="kicker">{label}</p>
      <p className="display number-card__value">{value ?? "?"}</p>
      {meaning ? (
        <>
          <h3 className="display number-card__title">{meaning.title}</h3>
          <p className="number-card__keywords">{meaning.keywords}</p>
          <p className="number-card__about">{meaning.about}</p>
        </>
      ) : (
        <p className="number-card__about">
          Add your full birth name on your profile to find it.
        </p>
      )}
      <p className="number-card__from">{from}</p>
    </li>
  );
};

export const NumbersTab = ({ birth, name, thisYear }: NumbersTabProps) => {
  const numbers = birthNumbers(birth, name, thisYear);
  const parts = [birth.month, birth.date, birth.year].map(reduce);
  const sum = parts.reduce((total, part) => total + part, 0);

  return (
    <section aria-labelledby="numbers-title" className="panel panel--book">
      <span className="legend">numerology.txt</span>
      <h2 id="numbers-title" className="display book__title">
        Your numbers
      </h2>
      <p className="page__sub">
        Your life path: {birth.month} + {birth.date} + {birth.year} →{" "}
        {parts.join(" + ")} = {sum}
        {sum === numbers.lifePath ? "" : ` → ${numbers.lifePath}`}.
      </p>

      <ul className="numbers">
        <NumberCard
          label="Life path"
          value={numbers.lifePath}
          from="Your birth date: the road you walk."
        />
        <NumberCard
          label="Expression"
          value={numbers.expression}
          from="Every letter of your name: what you are here to do."
        />
        <NumberCard
          label="Soul urge"
          value={numbers.soulUrge}
          from="The vowels of your name: what your heart wants."
        />
        <NumberCard
          label="Personality"
          value={numbers.personality}
          from="The consonants of your name: how others see you."
        />
        <NumberCard
          label="Birthday"
          value={numbers.birthday}
          from="The day you were born: a gift you came with."
        />
        <NumberCard
          label="Maturity"
          value={numbers.maturity}
          from="Life path and expression together: who you grow into."
        />
      </ul>

      <div className="personal-year">
        <p className="kicker">Your personal year, {thisYear}</p>
        <p>
          <span className="display number-card__value">
            {numbers.personalYear}
          </span>{" "}
          {personalYearOf(numbers.personalYear)}
        </p>
      </div>
      <p className="hint">
        Pythagorean numerology: A is 1, I is 9, J is 1 again; numbers add down
        to one digit, but 11, 22 and 33 are master numbers and stay.
      </p>
    </section>
  );
};
