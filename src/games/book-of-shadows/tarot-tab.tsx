import { useState } from "react";
import type { ReactNode } from "react";

import { cryptoRandom } from "../../lib/random";
import { say, tr } from "./french";
import {
  FIRST_CHOICE,
  MAJOR_ARCANA,
  RANKS,
  SUITS,
  SUIT_INFO,
  cardOf,
  choiceOf,
  drawCard,
} from "./tarot";
import type { Choice, TarotCard } from "./tarot";
import { TarotFace } from "./tarot-face";

/** "Major arcana · Leo" or "Cups · Water: feelings, love…". */
const kindOf = (card: TarotCard) =>
  card.suit
    ? `${say(SUIT_INFO[card.suit].name)} · ${say(SUIT_INFO[card.suit].element)}${tr(": ", " : ")}${say(SUIT_INFO[card.suit].about)}`
    : `${tr("Major arcana", "Arcane majeur")} · ${card.ruler ? say(card.ruler) : ""}`;

/** One step of the choice: a legend and its options, the chosen one pressed. */
const Step = <T extends string | number>({
  legend,
  options,
  chosen,
  labelOf,
  onChoose,
  wide = false,
}: {
  legend: string;
  options: readonly T[];
  chosen: T;
  labelOf: (option: T) => ReactNode;
  onChoose: (option: T) => void;
  /** Many options: a grid of chips, not one joined row. */
  wide?: boolean;
}) => (
  <fieldset className={wide ? "tarot-step tarot-step--wide" : "tarot-step"}>
    <legend className="field-label">{legend}</legend>
    <div className={wide ? "tarot-step__grid" : "picker"}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={wide ? "chip" : "picker__option"}
          aria-pressed={option === chosen}
          onClick={() => onChoose(option)}
        >
          {labelOf(option)}
        </button>
      ))}
    </div>
  </fieldset>
);

const MAJOR_NUMBERS = MAJOR_ARCANA.map((_, i) => i);

/** "XIII Death": a major arcana card's numeral and name, on its chip. */
const majorLabel = (major: number) => (
  <>
    <span className="chip__numeral">{MAJOR_ARCANA[major]?.label}</span>{" "}
    {say(MAJOR_ARCANA[major]?.name ?? "")}
  </>
);

const RANK_NUMBERS = RANKS.map((_, i) => i);

/** Each rank in French, in the order of RANKS. */
const FRENCH_RANKS = [
  "As",
  "Deux",
  "Trois",
  "Quatre",
  "Cinq",
  "Six",
  "Sept",
  "Huit",
  "Neuf",
  "Dix",
  "Valet",
  "Cavalier",
  "Reine",
  "Roi",
];

const rankName = (rank: number) =>
  tr(RANKS[rank] ?? "", FRENCH_RANKS[rank] ?? RANKS[rank] ?? "");

/** How to read a card, and the deck's grammar: arcana, suits, courts, numbers. */
const HowToRead = () => (
  <section aria-labelledby="how-title" className="panel panel--book">
    <span className="legend">how-to-read.txt</span>
    <h2 id="how-title" className="display book__title">
      {tr("How to read the cards", "Comment lire les cartes")}
    </h2>
    <ol className="how-to">
      <li>
        {tr(
          "Ask an open question: “What do I need to know about…?” works better than a yes or no.",
          "Posez une question ouverte : « Que dois-je savoir sur… ? » marche mieux qu’un oui ou non."
        )}
      </li>
      <li>
        {tr(
          "Shuffle while you hold the question in mind, then draw.",
          "Mélangez en gardant la question en tête, puis tirez."
        )}
      </li>
      <li>
        <strong>{tr("Upright", "À l’endroit")}</strong>
        {tr(
          ", a card’s energy flows freely and outward.",
          ", l’énergie d’une carte circule librement, vers l’extérieur."
        )}
      </li>
      <li>
        <strong>{tr("Reversed", "Renversée")}</strong>
        {tr(
          " (upside down), the same energy is blocked, delayed, turned inward, or too much of it. Read it as the card’s shadow, not its opposite.",
          " (la tête en bas), la même énergie est bloquée, retardée, tournée vers l’intérieur, ou en excès. Lisez-la comme l’ombre de la carte, pas son contraire."
        )}
      </li>
    </ol>
    <dl className="facts">
      <div>
        <dt>{tr("Major arcana", "Arcanes majeurs")}</dt>
        <dd>
          {tr(
            "The 22 big lessons and turning points. Several in one reading mean it matters.",
            "Les 22 grandes leçons et tournants. Plusieurs dans un même tirage, c’est que ça compte."
          )}
        </dd>
      </div>
      <div>
        <dt>{tr("Minor arcana", "Arcanes mineurs")}</dt>
        <dd>
          {tr(
            "Everyday life, in four suits: ",
            "La vie de tous les jours, en quatre couleurs : "
          )}
          {SUITS.map((suit) =>
            tr(
              `${SUIT_INFO[suit].name} (${SUIT_INFO[suit].element.toLowerCase()}) for ${SUIT_INFO[suit].about}`,
              `${say(SUIT_INFO[suit].name)} (${say(SUIT_INFO[suit].element).toLowerCase()}) pour ${say(SUIT_INFO[suit].about)}`
            )
          ).join(" ; ")}
          .
        </dd>
      </div>
      <div>
        <dt>{tr("Numbers", "Nombres")}</dt>
        <dd>
          {tr(
            "Aces begin, twos choose, threes grow, fours settle, fives clash, sixes heal, sevens test, eights move, nines near the end, tens complete.",
            "Les as commencent, les deux choisissent, les trois grandissent, les quatre se posent, les cinq s’affrontent, les six guérissent, les sept mettent à l’épreuve, les huit bougent, les neuf approchent de la fin, les dix achèvent."
          )}
        </dd>
      </div>
      <div>
        <dt>{tr("Court cards", "Figures")}</dt>
        <dd>
          {tr(
            "People in your life, or sides of you: Pages learn and bring news, Knights act, Queens master within, Kings master the world.",
            "Des personnes de votre vie, ou des facettes de vous : les Valets apprennent et apportent des nouvelles, les Cavaliers agissent, les Reines maîtrisent le dedans, les Rois maîtrisent le monde."
          )}
        </dd>
      </div>
    </dl>
  </section>
);

export const TarotTab = () => {
  const [choice, setChoice] = useState<Choice>(FIRST_CHOICE);
  // Whether the card on show came from a draw, until the next pick.
  const [drawn, setDrawn] = useState(false);
  const card = cardOf(choice);
  const reading = choice.reversed ? card.reversed : card.upright;

  const choose = (change: Partial<Choice>) => {
    setChoice((current) => ({ ...current, ...change }));
    setDrawn(false);
  };

  const draw = () => {
    setChoice((current) => choiceOf(drawCard(cryptoRandom), current));
    setDrawn(true);
  };

  return (
    <>
      <div className="tarot-top">
        <button type="button" className="btn btn--primary" onClick={draw}>
          {tr("Draw a card", "Tirer une carte")}
        </button>
        <span className="hint">
          {tr(
            "or choose one, a step at a time",
            "ou choisissez-en une, pas à pas"
          )}
        </span>
      </div>

      <section aria-labelledby="choose-title" className="panel panel--book">
        <span className="legend">choose-a-card.txt</span>
        <h2 id="choose-title" className="display book__title">
          {tr("Choose a card", "Choisir une carte")}
        </h2>
        <div className="tarot-steps">
          <Step
            legend={tr("1. Arcana", "1. Arcanes")}
            options={["major", "minor"] as const}
            chosen={choice.arcana}
            labelOf={(arcana) =>
              arcana === "major"
                ? tr("Major", "Majeurs")
                : tr("Minor", "Mineurs")
            }
            onChoose={(arcana) => choose({ arcana })}
          />

          {choice.arcana === "minor" ? (
            <>
              <Step
                legend={tr("2. Suit", "2. Couleur")}
                options={SUITS}
                chosen={choice.suit}
                labelOf={(suit) => say(SUIT_INFO[suit].name)}
                onChoose={(suit) => choose({ suit })}
              />
              <Step
                legend={tr("3. Card", "3. Carte")}
                options={RANK_NUMBERS}
                chosen={choice.rank}
                labelOf={(rank) => rankName(rank)}
                onChoose={(rank) => choose({ rank })}
                wide
              />
            </>
          ) : (
            <Step
              legend={tr("2. Card", "2. Carte")}
              options={MAJOR_NUMBERS}
              chosen={choice.major}
              labelOf={majorLabel}
              onChoose={(major) => choose({ major })}
              wide
            />
          )}

          <Step
            legend={`${choice.arcana === "minor" ? 4 : 3}. ${tr("Which way up", "Dans quel sens")}`}
            options={["upright", "reversed"] as const}
            chosen={choice.reversed ? "reversed" : "upright"}
            labelOf={(way) =>
              way === "upright"
                ? tr("Upright", "À l’endroit")
                : tr("Reversed", "Renversée")
            }
            onChoose={(way) => choose({ reversed: way === "reversed" })}
          />
        </div>
      </section>

      <section
        aria-labelledby="card-name"
        aria-live="polite"
        className="panel panel--book"
      >
        <span className="legend">card-reading.txt</span>
        <div className="tarot-reading">
          <TarotFace card={card} reversed={choice.reversed} width={150} />
          <div className="stack tarot-reading__text">
            <p className="kicker">{kindOf(card)}</p>
            <h2 id="card-name" className="display page__title">
              {say(card.name)}
            </h2>
            <p className="tarot-reading__way">
              {choice.reversed
                ? tr("Reversed", "Renversée")
                : tr("Upright", "À l’endroit")}
              {drawn ? (
                <span className="badge">{tr("drawn", "tirée")}</span>
              ) : null}
            </p>
            <div className="tarot-side">
              <p className="tarot-side__keywords">{say(reading.keywords)}</p>
              <p>{say(reading.meaning)}</p>
            </div>
          </div>
        </div>
      </section>

      <HowToRead />
    </>
  );
};
