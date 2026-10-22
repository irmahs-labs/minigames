import { useEffect, useState } from "react";

import { BoosterPotionIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { Link } from "../../lib/router";
import { useConfirm } from "../../lib/use-confirm";
import { BrewDialog, listed } from "./brew-dialog";
import {
  BASE_KINDS,
  KIND_EMOJI,
  PANTRY,
  RECIPES,
  TIPS,
  TOPPING_KINDS,
} from "./pantry";
import type { Form, Kind, Recipe } from "./pantry";
import {
  EMPTY,
  MIN_INGREDIENTS,
  brew,
  choose,
  formsOf,
  isReady,
  kindOf,
  labelOf,
  partsOf,
  setForm,
} from "./rules";
import type { Brewed, Part, Selection } from "./rules";
import { loadFound, saveFound } from "./state";

const title = (kind: Kind) => `${kind[0]?.toUpperCase()}${kind.slice(1)}`;

/** A locked page's clue: "fruit + dried spice + sweetener". */
const kindsOf = (parts: readonly Part[]) =>
  parts
    .map(({ form, name }) => {
      const kind = kindOf(name) ?? "fruit";

      return form ? `${form} ${kind}` : kind;
    })
    .join(" + ");

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

/** A page of the recipe book: the whole recipe once found, its kinds before. */
const Page = ({ recipe, found }: { recipe: Recipe; found: boolean }) => {
  const parts = partsOf(recipe);

  return (
    <li className={found ? "recipe-card recipe-card--found" : "recipe-card"}>
      <h3 className="display recipe-card__name">
        {found ? `🧪 ${recipe.name}` : "🔒 ???"}
      </h3>
      <p className="recipe-card__recipe">
        {found ? listed(parts.map(labelOf)) : kindsOf(parts)}
      </p>
      {found ? (
        <>
          <p className="recipe-card__note">{recipe.note}</p>
          <a
            className="recipe-card__source"
            href={recipe.source}
            target="_blank"
            rel="noreferrer"
          >
            The real recipe ↗
          </a>
        </>
      ) : null}
    </li>
  );
};

const BoosterPotion = ({ name }: GameProps) => {
  const [selection, setSelection] = useState<Selection>(EMPTY);
  const [found, setFound] = useState(loadFound);
  const [brewed, setBrewed] = useState<Brewed | null>(null);
  const confirm = useConfirm();

  const ready = isReady(selection);

  useEffect(() => saveFound(found), [found]);

  const brewIt = () => {
    if (!ready) {
      return;
    }

    const result = brew(selection, found);

    if (result.type === "potion") {
      // A potion is done with; a mystery stays in to be changed one by one.
      setSelection(EMPTY);

      if (result.isNew) {
        setFound([...found, result.recipe.name]);
      }
    }

    setBrewed(result);
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
          mix real wellness shots and teas, find all {RECIPES.length} potions
        </p>

        <div className="layout">
          <section aria-label="Ingredients" className="panel panel--pantry">
            <span className="legend">pantry</span>

            <div className="stack">
              <h2 className="display turn">Bases</h2>
              <p className="hint">Juices, fruit and vegetables.</p>
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
              <button
                type="button"
                className="btn btn--primary btn--spin"
                disabled={!ready}
                onClick={brewIt}
              >
                🧪 Brew
              </button>
              <button
                type="button"
                className="btn btn--quiet"
                disabled={selection.length === 0}
                onClick={() => setSelection(EMPTY)}
              >
                Empty it
              </button>
            </div>

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
                  Brew. The right ones make one of {RECIPES.length} potions,
                  each a real wellness shot, tea or tonic.
                </li>
                <li>
                  Anything else is a Mystery Potion, with a hint at the potion
                  it nearly was.
                </li>
              </ol>
            </div>
          </section>
        </div>

        <section aria-labelledby="book-title" className="panel panel--board">
          <span className="legend">recipe.book</span>
          <div className="slices__head">
            <div className="stack">
              <h2 id="book-title" className="display turn">
                Recipe book
              </h2>
              <span className="slices__count">
                {found.length} <span>of {RECIPES.length} found</span>
              </span>
            </div>
            <button
              type="button"
              className="btn btn--quiet"
              disabled={found.length === 0}
              onClick={() => confirm.press("forget", () => setFound([]))}
            >
              {confirm.armed === "forget" ? "Sure? Start over" : "Start over"}
            </button>
          </div>
          <ul className="book">
            {RECIPES.map((recipe) => (
              <Page
                key={recipe.name}
                recipe={recipe}
                found={found.includes(recipe.name)}
              />
            ))}
          </ul>
          <p className="hint">
            Every potion is a real wellness shot, tea or tonic, for fun and not
            as medical advice. The recipe book is saved in this browser only.
          </p>
        </section>

        <BrewDialog
          brewed={brewed}
          found={found.length}
          onClose={() => setBrewed(null)}
        />
      </main>
    </>
  );
};

export default BoosterPotion;
