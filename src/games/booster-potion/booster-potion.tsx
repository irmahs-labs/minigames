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
  TOPPING_KINDS,
} from "./pantry";
import type { Kind, Recipe } from "./pantry";
import { EMPTY, brew, choose, ingredientsOf, isReady, kindOf } from "./rules";
import type { Brewed, Selection } from "./rules";
import { loadFound, saveFound } from "./state";

const title = (kind: Kind) => `${kind[0]?.toUpperCase()}${kind.slice(1)}`;

const kindsOf = (names: readonly string[]) =>
  names.map((name) => kindOf(name) ?? "fruit");

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
        <button
          key={name}
          type="button"
          className="chip"
          aria-pressed={chosen.includes(name)}
          onClick={() => onChoose(name)}
        >
          {name}
        </button>
      ))}
    </div>
  </fieldset>
);

/** The four places in the cauldron, filled in the order they were picked. */
const Cauldron = ({ selection }: { selection: Selection }) => {
  const slots = [
    ...[0, 1].map((i) => ({ group: "base", name: selection.bases[i] })),
    ...[0, 1].map((i) => ({ group: "topping", name: selection.toppings[i] })),
  ];

  return (
    <ul className="cauldron">
      {slots.map(({ group, name }, i) => {
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
            {name ?? `a ${group}`}
          </li>
        );
      })}
    </ul>
  );
};

/** A page of the recipe book: the whole recipe once found, its kinds before. */
const Page = ({ recipe, found }: { recipe: Recipe; found: boolean }) => {
  const kinds = kindsOf(ingredientsOf(recipe));

  return (
    <li className={found ? "recipe-card recipe-card--found" : "recipe-card"}>
      <h3 className="display recipe-card__name">
        {found ? `🧪 ${recipe.name}` : "🔒 ???"}
      </h3>
      <p className="recipe-card__recipe">
        {found
          ? listed(ingredientsOf(recipe))
          : `${kinds.slice(0, 2).join(" + ")} · ${kinds.slice(2).join(" + ")}`}
      </p>
    </li>
  );
};

const BoosterPotion = ({ name }: GameProps) => {
  const [selection, setSelection] = useState<Selection>(EMPTY);
  const [found, setFound] = useState(loadFound);
  const [brewed, setBrewed] = useState<Brewed | null>(null);
  const confirm = useConfirm();

  const ready = isReady(selection);
  const chosen = [...selection.bases, ...selection.toppings];

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

  const needed = () => {
    const bases = 2 - selection.bases.length;
    const toppings = 2 - selection.toppings.length;

    const parts = [
      bases > 0 ? `${bases} more base${bases === 1 ? "" : "s"}` : "",
      toppings > 0
        ? `${toppings} more topping${toppings === 1 ? "" : "s"}`
        : "",
    ].filter(Boolean);

    return `Pick ${parts.join(" and ")}.`;
  };

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
          mix four ingredients, find all {RECIPES.length} potions
        </p>

        <div className="layout">
          <section aria-label="Ingredients" className="panel panel--pantry">
            <span className="legend">pantry</span>

            <div className="stack">
              <h2 className="display turn">Bases</h2>
              <p className="hint">Two, of different kinds.</p>
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
              <p className="hint">Two, of different kinds.</p>
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
            <Cauldron selection={selection} />
            <p className="turn__note" aria-live="polite">
              {ready ? "Two bases and two toppings. Give it a stir!" : needed()}
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
                disabled={chosen.length === 0}
                onClick={() => setSelection(EMPTY)}
              >
                Empty it
              </button>
            </div>

            <div className="stack">
              <h3 className="field-label">How to play</h3>
              <ol className="how-to">
                <li>
                  Pick two bases of different kinds, like a fruit and a liquid.
                </li>
                <li>
                  Pick two toppings of different kinds, like a herb and a seed.
                </li>
                <li>
                  Brew. The right four make one of the {RECIPES.length} potions.
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
          <p className="hint">Saved in this browser only.</p>
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
