import { useState } from "react";
import type { ReactNode } from "react";

import {
  FIRST_CHOICE,
  MAJOR_ARCANA,
  RANKS,
  SUITS,
  SUIT_INFO,
  cardOf,
  choiceOf,
  cryptoRandom,
  drawCard,
} from "./tarot";
import type { Choice, TarotCard } from "./tarot";
import { TarotFace } from "./tarot-face";

/** "Major arcana · Leo" or "Cups · Water: feelings, love…". */
const kindOf = (card: TarotCard) =>
  card.suit
    ? `${SUIT_INFO[card.suit].name} · ${SUIT_INFO[card.suit].element}: ${SUIT_INFO[card.suit].about}`
    : `Major arcana · ${card.ruler}`;

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
    {MAJOR_ARCANA[major]?.name}
  </>
);

const RANK_NUMBERS = RANKS.map((_, i) => i);

/** How to read a card, and the deck's grammar: arcana, suits, courts, numbers. */
const HowToRead = () => (
  <section aria-labelledby="how-title" className="panel panel--book">
    <span className="legend">how-to-read.txt</span>
    <h2 id="how-title" className="display book__title">
      How to read the cards
    </h2>
    <ol className="how-to">
      <li>
        Ask an open question: “What do I need to know about…?” works better than
        a yes or no.
      </li>
      <li>Shuffle while you hold the question in mind, then draw.</li>
      <li>
        <strong>Upright</strong>, a card’s energy flows freely and outward.
      </li>
      <li>
        <strong>Reversed</strong> (upside down), the same energy is blocked,
        delayed, turned inward, or too much of it. Read it as the card’s shadow,
        not its opposite.
      </li>
    </ol>
    <dl className="facts">
      <div>
        <dt>Major arcana</dt>
        <dd>
          The 22 big lessons and turning points. Several in one reading mean it
          matters.
        </dd>
      </div>
      <div>
        <dt>Minor arcana</dt>
        <dd>
          Everyday life, in four suits:{" "}
          {SUITS.map(
            (suit) =>
              `${SUIT_INFO[suit].name} (${SUIT_INFO[suit].element.toLowerCase()}) for ${SUIT_INFO[suit].about}`
          ).join("; ")}
          .
        </dd>
      </div>
      <div>
        <dt>Numbers</dt>
        <dd>
          Aces begin, twos choose, threes grow, fours settle, fives clash, sixes
          heal, sevens test, eights move, nines near the end, tens complete.
        </dd>
      </div>
      <div>
        <dt>Court cards</dt>
        <dd>
          People in your life, or sides of you: Pages learn and bring news,
          Knights act, Queens master within, Kings master the world.
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
          Draw a card
        </button>
        <span className="hint">or choose one, a step at a time</span>
      </div>

      <section aria-labelledby="choose-title" className="panel panel--book">
        <span className="legend">choose-a-card.txt</span>
        <h2 id="choose-title" className="display book__title">
          Choose a card
        </h2>
        <div className="tarot-steps">
          <Step
            legend="1. Arcana"
            options={["major", "minor"] as const}
            chosen={choice.arcana}
            labelOf={(arcana) => (arcana === "major" ? "Major" : "Minor")}
            onChoose={(arcana) => choose({ arcana })}
          />

          {choice.arcana === "minor" ? (
            <>
              <Step
                legend="2. Suit"
                options={SUITS}
                chosen={choice.suit}
                labelOf={(suit) => SUIT_INFO[suit].name}
                onChoose={(suit) => choose({ suit })}
              />
              <Step
                legend="3. Card"
                options={RANK_NUMBERS}
                chosen={choice.rank}
                labelOf={(rank) => RANKS[rank]}
                onChoose={(rank) => choose({ rank })}
                wide
              />
            </>
          ) : (
            <Step
              legend="2. Card"
              options={MAJOR_NUMBERS}
              chosen={choice.major}
              labelOf={majorLabel}
              onChoose={(major) => choose({ major })}
              wide
            />
          )}

          <Step
            legend={`${choice.arcana === "minor" ? 4 : 3}. Which way up`}
            options={["upright", "reversed"] as const}
            chosen={choice.reversed ? "reversed" : "upright"}
            labelOf={(way) => (way === "upright" ? "Upright" : "Reversed")}
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
          <TarotFace card={card} reversed={choice.reversed} width={150} named />
          <div className="stack tarot-reading__text">
            <p className="kicker">{kindOf(card)}</p>
            <h2 id="card-name" className="display page__title">
              {card.name}
            </h2>
            <p className="tarot-reading__way">
              {choice.reversed ? "Reversed" : "Upright"}
              {drawn ? <span className="badge">drawn</span> : null}
            </p>
            <div className="tarot-side tarot-side--shown">
              <p className="tarot-side__keywords">{reading.keywords}</p>
              <p>{reading.meaning}</p>
            </div>
          </div>
        </div>
      </section>

      <HowToRead />
    </>
  );
};
