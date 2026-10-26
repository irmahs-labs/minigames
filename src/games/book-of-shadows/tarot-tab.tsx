import { useRef, useState } from "react";

import {
  DECK,
  SUITS,
  SUIT_INFO,
  cardsMatching,
  cryptoRandom,
  drawCard,
} from "./tarot";
import type { DeckFilter, TarotCard } from "./tarot";
import { TarotFace } from "./tarot-face";

const FILTER_NAMES: Record<DeckFilter, string> = {
  all: "All 78",
  cups: "Cups",
  major: "Major arcana",
  pentacles: "Pentacles",
  swords: "Swords",
  wands: "Wands",
};

const FILTERS: readonly DeckFilter[] = ["all", "major", ...SUITS];

/** "Major arcana · Leo" or "Cups · Water: feelings, love…". */
const kindOf = (card: TarotCard) =>
  card.suit
    ? `${SUIT_INFO[card.suit].name} · ${SUIT_INFO[card.suit].element}: ${SUIT_INFO[card.suit].about}`
    : `Major arcana · ${card.ruler}`;

interface Shown {
  card: TarotCard;
  reversed: boolean;
  /** Whether it came from the deck by chance, rather than picked. */
  drawn: boolean;
}

/** How to read a card, and the deck's grammar: arcana, suits, courts, numbers. */
const HowToRead = () => (
  <section
    aria-labelledby="how-title"
    className="panel panel--book panel--narrow"
  >
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
    <dl className="facts facts--wide">
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
  const [shown, setShown] = useState<Shown>(() => ({
    card: DECK[0] ?? drawCard(cryptoRandom).card,
    drawn: false,
    reversed: false,
  }));

  const [filter, setFilter] = useState<DeckFilter>("all");
  const [search, setSearch] = useState("");
  const reading = useRef<HTMLElement>(null);
  const cards = cardsMatching(filter, search);
  const { card, reversed, drawn } = shown;

  const draw = () => setShown({ ...drawCard(cryptoRandom), drawn: true });

  const pick = (picked: TarotCard) => {
    setShown({ card: picked, drawn: false, reversed: false });
    reading.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="layout">
        <section
          ref={reading}
          aria-labelledby="card-name"
          aria-live="polite"
          className="panel panel--book panel--wide"
        >
          <span className="legend">card-reading.txt</span>
          <div className="tarot-reading">
            <TarotFace card={card} reversed={reversed} width={150} named />
            <div className="stack tarot-reading__text">
              <p className="kicker">{kindOf(card)}</p>
              <h2 id="card-name" className="display page__title">
                {card.name}
                {drawn ? (
                  <span className="badge">
                    drawn {reversed ? "reversed" : "upright"}
                  </span>
                ) : null}
              </h2>
              <div className="tarot-sides">
                <section
                  className={
                    reversed ? "tarot-side" : "tarot-side tarot-side--shown"
                  }
                >
                  <h3 className="field-label">Upright</h3>
                  <p className="tarot-side__keywords">
                    {card.upright.keywords}
                  </p>
                  <p>{card.upright.meaning}</p>
                </section>
                <section
                  className={
                    reversed ? "tarot-side tarot-side--shown" : "tarot-side"
                  }
                >
                  <h3 className="field-label">Reversed</h3>
                  <p className="tarot-side__keywords">
                    {card.reversed.keywords}
                  </p>
                  <p>{card.reversed.meaning}</p>
                </section>
              </div>
              <div className="tarot-reading__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={draw}
                >
                  Draw a card
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShown({ ...shown, reversed: !reversed })}
                >
                  Turn it {reversed ? "upright" : "upside down"}
                </button>
              </div>
            </div>
          </div>
        </section>
        <HowToRead />
      </div>

      <section aria-labelledby="deck-title" className="panel panel--book">
        <span className="legend">deck.csv</span>
        <h2 id="deck-title" className="display book__title">
          The deck
        </h2>
        <div className="deck__tools">
          <nav aria-label="Part of the deck" className="picker picker--scroll">
            {FILTERS.map((entry) => (
              <button
                key={entry}
                type="button"
                className="picker__option"
                aria-pressed={entry === filter}
                onClick={() => setFilter(entry)}
              >
                {FILTER_NAMES[entry]}
              </button>
            ))}
          </nav>
          <input
            type="search"
            aria-label="Search the cards"
            className="field deck__search"
            placeholder="Search a name or a meaning"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {cards.length === 0 ? (
          <p className="hint">No card matches “{search.trim()}”.</p>
        ) : (
          <ul className="deck">
            {cards.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="deck__card"
                  aria-pressed={entry.id === card.id}
                  onClick={() => pick(entry)}
                >
                  <TarotFace card={entry} width={48} />
                  <span className="deck__name">{entry.name}</span>
                  <span className="deck__keywords">
                    {entry.upright.keywords}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
};
