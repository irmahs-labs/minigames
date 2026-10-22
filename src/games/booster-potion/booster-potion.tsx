import { useEffect, useState } from "react";

import { BoosterPotionIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { currentAccount, signInUrl } from "../../lib/account";
import type { Account } from "../../lib/account";
import { Icon } from "../../lib/icon";
import { Link } from "../../lib/router";
import type { BrewAnswer, Page } from "./api";
import { fetchBook, postBrew } from "./book-api";
import { BrewDialog, listed } from "./brew-dialog";
import { BASE_KINDS, KIND_EMOJI, PANTRY, TIPS, TOPPING_KINDS } from "./pantry";
import type { Form, Kind } from "./pantry";
import {
  EMPTY,
  MIN_INGREDIENTS,
  choose,
  formsOf,
  isReady,
  kindOf,
  labelOf,
  setForm,
} from "./rules";
import type { Part, Selection } from "./rules";

const title = (kind: Kind) => `${kind[0]?.toUpperCase()}${kind.slice(1)}`;

const FORM_NAMES: Record<Form, string> = {
  dried: "Dried",
  fresh: "Fresh",
  powder: "Powder",
};

/** "Apple cider vinegar" → tip-apple-cider-vinegar, for aria-describedby. */
const tipId = (name: string) =>
  `tip-${name.toLowerCase().replaceAll(/[^a-z]+/gu, "-")}`;

/** One kind's shelf of ingredients, each a button that goes in or comes out. */
const Shelf = ({
  kind,
  chosen,
  onChoose,
}: {
  kind: Kind;
  chosen: readonly string[];
  onChoose: (name: string) => void;
}) => (
  <fieldset className="shelf">
    <legend className="field-label">
      {KIND_EMOJI[kind]} {title(kind)}
    </legend>
    <div className="shelf__items">
      {PANTRY[kind].map((name) => (
        <span key={name} className="chip-wrap">
          <button
            type="button"
            className="chip"
            aria-pressed={chosen.includes(name)}
            aria-describedby={tipId(name)}
            onClick={() => onChoose(name)}
          >
            {name}
          </button>
          <span role="tooltip" id={tipId(name)} className="tip">
            {TIPS.get(name)}
          </span>
        </span>
      ))}
    </div>
  </fieldset>
);

/** What an empty place in the cauldron says: the last two are up to you. */
const EMPTY_SLOTS = [
  "an ingredient",
  "an ingredient",
  "a third, if the recipe takes one",
  "a fourth, if the recipe takes one",
];

/** How an ingredient that comes more than one way goes in. */
const FormPicker = ({
  part,
  onForm,
}: {
  part: Part;
  onForm: (form: Form) => void;
}) => (
  <fieldset className="forms" aria-label={`${part.name}: how it goes in`}>
    {formsOf(part.name).map((form) => (
      <button
        key={form}
        type="button"
        className="forms__option"
        aria-pressed={form === part.form}
        onClick={() => onForm(form)}
      >
        {FORM_NAMES[form]}
      </button>
    ))}
  </fieldset>
);

/** The four places in the cauldron, filled in the order they were picked. */
const Cauldron = ({
  selection,
  onForm,
}: {
  selection: Selection;
  onForm: (name: string, form: Form) => void;
}) => (
  <ul className="cauldron">
    {EMPTY_SLOTS.map((empty, i) => {
      const part = selection[i];
      const name = part?.name;
      const kind = name ? kindOf(name) : undefined;

      return (
        // The slots are fixed places, so their position is the key.
        // oxlint-disable-next-line no-array-index-key
        <li
          key={i}
          className={
            name ? "cauldron__slot" : "cauldron__slot cauldron__slot--empty"
          }
        >
          <span aria-hidden="true">{kind ? KIND_EMOJI[kind] : "·"}</span>
          <span className="stack">
            {part ? labelOf(part) : empty}
            {name && TIPS.has(name) ? (
              <span className="cauldron__tip">{TIPS.get(name)}</span>
            ) : null}
            {part?.form ? (
              <FormPicker
                part={part}
                onForm={(form) => onForm(part.name, form)}
              />
            ) : null}
          </span>
        </li>
      );
    })}
  </ul>
);

/** "First brewed by Irma H. and 3 more". */
const bylineOf = ({ by, others }: Extract<Page, { state: "found" }>) =>
  others > 0 ? `First brewed by ${by} and ${others} more` : `Brewed by ${by}`;

/** A page of the shared book: the recipe and who found it, or its clue. */
const BookPage = ({ page }: { page: Page }) => {
  if (page.state === "locked") {
    return (
      <li className="recipe-card">
        <h3 className="display recipe-card__name">🔒 ???</h3>
        <p className="recipe-card__recipe">{page.clue}</p>
      </li>
    );
  }

  return (
    <li
      className={
        page.yours
          ? "recipe-card recipe-card--found recipe-card--yours"
          : "recipe-card recipe-card--found"
      }
    >
      <h3 className="display recipe-card__name">🧪 {page.name}</h3>
      <p className="recipe-card__recipe">{listed(page.ingredients)}</p>
      <p className="recipe-card__note">{page.note}</p>
      <p className="recipe-card__by">
        {bylineOf(page)}
        {page.yours ? " · you brewed it too" : ""}
      </p>
      <a
        className="recipe-card__source"
        href={page.source}
        target="_blank"
        rel="noreferrer"
      >
        The real recipe ↗
      </a>
    </li>
  );
};

const BoosterPotion = ({ name }: GameProps) => {
  const [selection, setSelection] = useState<Selection>(EMPTY);
  // undefined until the server answers, or when it cannot be reached.
  const [account, setAccount] = useState<Account | null | undefined>();
  // undefined while loading, null when the book cannot be had.
  const [pages, setPages] = useState<Page[] | null | undefined>();
  const [answer, setAnswer] = useState<BrewAnswer | null>(null);
  const [brewing, setBrewing] = useState(false);
  const [trouble, setTrouble] = useState<string | null>(null);

  const ready = isReady(selection);

  useEffect(() => {
    let current = true;

    const load = async () => {
      const [who, book] = await Promise.all([currentAccount(), fetchBook()]);

      if (current) {
        setAccount(who);
        setPages(book);
      }
    };

    void load();

    return () => {
      current = false;
    };
  }, []);

  const brewIt = async () => {
    if (!ready || brewing) {
      return;
    }

    setBrewing(true);
    setTrouble(null);
    const result = await postBrew(selection);

    setBrewing(false);

    if (!result.ok) {
      setTrouble(result.message);

      return;
    }

    if (result.answer.type === "potion") {
      // A potion is done with; a mystery stays in to be changed one by one.
      setSelection(EMPTY);
      // Others may have found potions too: the whole book comes back fresh.
      const book = await fetchBook();

      if (book) {
        setPages(book);
      }
    }

    setAnswer(result.answer);
  };

  const status = () => {
    if (!ready) {
      const more = MIN_INGREDIENTS - selection.length;

      return `Pick ${more} more, from any shelf.`;
    }

    return [
      "Two in. Brew now, or add more.",
      "Three in. Brew now, or add a fourth.",
      "Four in. Give it a stir!",
    ][selection.length - MIN_INGREDIENTS];
  };

  const notice = () => {
    if (trouble) {
      return trouble;
    }

    if (account === null) {
      return "Brews go in the shared book under your irmahs.dev name.";
    }

    return account === undefined && pages !== undefined
      ? "The cauldron can't be reached right now."
      : "";
  };

  const found = pages?.filter((page) => page.state === "found") ?? [];
  const yours = found.filter((page) => page.yours).length;
  const chosen = selection.map((part) => part.name);

  return (
    <>
      <Header icon={<BoosterPotionIcon />} name={name} href="/booster-potion">
        <Link href="/" className="btn">
          <Icon name="back" size={16} />
          all games
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub">
          brew real wellness shots and teas, and put your name in the book
        </p>

        <div className="layout">
          <section aria-label="Ingredients" className="panel panel--pantry">
            <span className="legend">pantry</span>

            <div className="stack">
              <h2 className="display turn">Bases</h2>
              <p className="hint">Juices, fruit, vegetables and teas.</p>
            </div>
            {BASE_KINDS.map((kind) => (
              <Shelf
                key={kind}
                kind={kind}
                chosen={chosen}
                onChoose={(next) => setSelection(choose(selection, next))}
              />
            ))}

            <div className="stack">
              <h2 className="display turn">Toppings</h2>
              <p className="hint">The kick, the colour and the sweetness.</p>
            </div>
            {TOPPING_KINDS.map((kind) => (
              <Shelf
                key={kind}
                kind={kind}
                chosen={chosen}
                onChoose={(next) => setSelection(choose(selection, next))}
              />
            ))}
          </section>

          <section
            aria-labelledby="cauldron-title"
            className="panel panel--log"
          >
            <span className="legend">cauldron</span>

            <div className="stack">
              <p className="kicker">In the cauldron</p>
              <h2 id="cauldron-title" className="display turn">
                {ready ? "Ready to brew" : "Pick your ingredients"}
              </h2>
            </div>
            <Cauldron
              selection={selection}
              onForm={(ingredient, form) =>
                setSelection(setForm(selection, ingredient, form))
              }
            />
            <p className="turn__note" aria-live="polite">
              {status()}
            </p>

            <div className="result__actions">
              {account === null ? (
                <a href={signInUrl()} className="btn btn--primary btn--spin">
                  Sign in to brew
                </a>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary btn--spin"
                  disabled={!ready || brewing || account === undefined}
                  onClick={brewIt}
                >
                  {brewing ? "Brewing…" : "🧪 Brew"}
                </button>
              )}
              <button
                type="button"
                className="btn btn--quiet"
                disabled={selection.length === 0}
                onClick={() => setSelection(EMPTY)}
              >
                Empty it
              </button>
            </div>
            <p className="hint" aria-live="polite">
              {notice()}
            </p>

            <div className="stack">
              <h3 className="field-label">How to play</h3>
              <ol className="how-to">
                <li>
                  Pick two to four ingredients from any shelves, like lemon,
                  ginger and honey.
                </li>
                <li>
                  Some come fresh, dried or as a powder: pick which in the
                  cauldron. A ginger shot takes fresh ginger; a ginger tea,
                  dried.
                </li>
                <li>
                  Brew. The right ones make a potion, each a real wellness shot,
                  tea or tonic.
                </li>
                <li>
                  The first to brew a potion puts their name on its page, for
                  everyone. Anything else is a Mystery Potion, with a hint.
                </li>
              </ol>
            </div>
          </section>
        </div>

        <section aria-labelledby="book-title" className="panel panel--board">
          <span className="legend">recipe.book</span>
          <div className="stack">
            <h2 id="book-title" className="display turn">
              Recipe book
            </h2>
            {pages ? (
              <span className="slices__count">
                {found.length}{" "}
                <span>
                  of {pages.length} found by everyone
                  {account ? `, ${yours} brewed by you` : ""}
                </span>
              </span>
            ) : null}
          </div>

          {pages === undefined ? (
            <p className="hint">Opening the book…</p>
          ) : null}
          {pages === null ? (
            <p className="hint">The recipe book cannot be reached right now.</p>
          ) : null}
          {pages ? (
            <ul className="book">
              {pages.map((page, i) => (
                // Pages keep their place in the book, found or not.
                // oxlint-disable-next-line no-array-index-key
                <BookPage key={i} page={page} />
              ))}
            </ul>
          ) : null}
          <p className="hint">
            One book for everyone: the first to brew a potion puts their name on
            it. Every potion is a real wellness shot, tea or tonic, for fun and
            not as medical advice.
          </p>
        </section>

        <BrewDialog answer={answer} onClose={() => setAnswer(null)} />
      </main>
    </>
  );
};

export default BoosterPotion;
