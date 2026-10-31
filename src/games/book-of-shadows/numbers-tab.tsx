import { say, tr } from "./french";
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
          <h3 className="display number-card__title">{say(meaning.title)}</h3>
          <p className="number-card__keywords">{say(meaning.keywords)}</p>
          <p className="number-card__about">{say(meaning.about)}</p>
        </>
      ) : (
        <p className="number-card__about">
          {tr(
            "Add your name on your profile to find it.",
            "Ajoutez votre nom dans votre profil pour le trouver."
          )}
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
        {tr("Your numbers", "Vos nombres")}
      </h2>
      <p className="page__sub">
        {tr("Your life path: ", "Votre chemin de vie : ")}
        {birth.month} + {birth.date} + {birth.year} → {parts.join(" + ")} ={" "}
        {sum}
        {sum === numbers.lifePath ? "" : ` → ${numbers.lifePath}`}.
      </p>

      <ul className="numbers">
        <NumberCard
          label={tr("Life path", "Chemin de vie")}
          value={numbers.lifePath}
          from={tr(
            "Your birth date: the road you walk.",
            "Votre date de naissance : la route que vous suivez."
          )}
        />
        <NumberCard
          label={tr("Expression", "Expression")}
          value={numbers.expression}
          from={tr(
            "Every letter of your name: what you are here to do.",
            "Chaque lettre de votre nom : ce que vous êtes venu faire."
          )}
        />
        <NumberCard
          label={tr("Soul urge", "Élan de l’âme")}
          value={numbers.soulUrge}
          from={tr(
            "The vowels of your name: what your heart wants.",
            "Les voyelles de votre nom : ce que veut votre cœur."
          )}
        />
        <NumberCard
          label={tr("Personality", "Personnalité")}
          value={numbers.personality}
          from={tr(
            "The consonants of your name: how others see you.",
            "Les consonnes de votre nom : comment les autres vous voient."
          )}
        />
        <NumberCard
          label={tr("Birthday", "Jour de naissance")}
          value={numbers.birthday}
          from={tr(
            "The day you were born: a gift you came with.",
            "Le jour de votre naissance : un don apporté avec vous."
          )}
        />
        <NumberCard
          label={tr("Maturity", "Maturité")}
          value={numbers.maturity}
          from={tr(
            "Life path and expression together: who you grow into.",
            "Chemin de vie et expression réunis : qui vous devenez."
          )}
        />
      </ul>

      <div className="personal-year">
        <p className="kicker">
          {tr("Your personal year", "Votre année personnelle")}, {thisYear}
        </p>
        <p>
          <span className="display number-card__value">
            {numbers.personalYear}
          </span>{" "}
          {say(personalYearOf(numbers.personalYear) ?? "")}
        </p>
      </div>
      <p className="hint">
        {tr(
          "Pythagorean numerology: A is 1, I is 9, J is 1 again; numbers add down to one digit, but 11, 22 and 33 are master numbers and stay.",
          "Numérologie pythagoricienne : A vaut 1, I vaut 9, J revaut 1 ; les nombres se réduisent à un chiffre, mais 11, 22 et 33 sont des nombres maîtres et restent."
        )}
      </p>
    </section>
  );
};
