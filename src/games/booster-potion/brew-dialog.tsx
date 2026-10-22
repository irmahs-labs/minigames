import { useEffect, useRef } from "react";

import { RECIPES } from "./pantry";
import { labelOf, partsOf } from "./rules";
import type { Brewed } from "./rules";

/** "Apple, Lime, Fresh ginger and Cayenne"; "Garlic and Honey". */
export const listed = (names: readonly string[]) =>
  names.length < 2
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1) ?? ""}`;

const WORDS = ["none", "one", "two", "three", "four"] as const;

const hintFor = ({
  closest,
  size,
  wrongForm,
}: Extract<Brewed, { type: "mystery" }>) => {
  if (wrongForm) {
    const wanted = listed(
      wrongForm.wanted.map((part) => labelOf(part).toLowerCase())
    );

    return `All the right ingredients for ${wrongForm.recipe.name}, but it wants ${wanted}.`;
  }

  if (!closest) {
    return `None of these ${WORDS[size] ?? size} is in a potion you have still to find.`;
  }

  const { recipe, shared } = closest;
  const needs = recipe.ingredients.length;

  if (shared === needs) {
    return `Everything in ${recipe.name} is in there, and more besides.`;
  }

  const count =
    shared === 1 ? `1 of these ${size} is` : `${shared} of these ${size} are`;

  const takes = needs === size ? "" : `, which takes ${WORDS[needs] ?? needs}`;

  return `${shared === needs - 1 ? "So close! " : ""}${count} in ${recipe.name}${takes}.`;
};

interface BrewDialogProps {
  /** What came out of the cauldron; the dialog is open while it is set. */
  brewed: Brewed | null;
  found: number;
  onClose: () => void;
}

/** The popup that names the potion, or hints at the one nearly made. */
export const BrewDialog = ({ brewed, found, onClose }: BrewDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    if (brewed && !dialog.open) {
      dialog.showModal();
    } else if (!brewed && dialog.open) {
      dialog.close();
    }
  }, [brewed]);

  const potion = brewed?.type === "potion" ? brewed : null;
  const mystery = brewed?.type === "mystery" ? brewed : null;

  const kicker = potion?.isNew ? "New potion found!" : "You brewed";

  const progress =
    found === RECIPES.length
      ? `That's all ${RECIPES.length}: the recipe book is full! 🎉`
      : `${found} of ${RECIPES.length} found.`;

  // The browser centres and layers the bare dialog; the panel look sits inside.
  return (
    <dialog
      ref={ref}
      className="result"
      aria-labelledby="brew-title"
      onClose={onClose}
    >
      <div className="panel result__panel">
        <span className="legend">potion.log</span>
        <p className="kicker">{mystery ? "The cauldron bubbles" : kicker}</p>
        <h2 id="brew-title" className="result__winner display">
          {potion ? `🧪 ${potion.recipe.name}` : "Mystery Potion"}
        </h2>
        <p className="result__note">
          {potion
            ? [
                `${listed(partsOf(potion.recipe).map(labelOf))}.`,
                potion.recipe.note,
                potion.isNew ? progress : "",
              ]
                .filter(Boolean)
                .join(" ")
            : null}
          {mystery ? hintFor(mystery) : null}
        </p>
        <div className="result__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            {potion ? "Brew another" : "Try again"}
          </button>
        </div>
      </div>
    </dialog>
  );
};
