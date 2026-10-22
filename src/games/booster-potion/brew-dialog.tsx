import { useEffect, useRef } from "react";

import { RECIPES } from "./pantry";
import { ingredientsOf } from "./rules";
import type { Brewed } from "./rules";

/** "Apple, Celery, Cinnamon and Flax." */
export const listed = (names: readonly string[]) =>
  `${names.slice(0, -1).join(", ")} and ${names.at(-1) ?? ""}`;

const hintFor = (brewed: Extract<Brewed, { type: "mystery" }>) => {
  if (!brewed.closest) {
    return "None of these four is in a potion you have still to find.";
  }

  const { recipe, shared } = brewed.closest;
  const count = shared === 1 ? "1 of these 4 is" : `${shared} of these 4 are`;

  return `${shared === 3 ? "So close! " : ""}${count} in ${recipe.name}.`;
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
                `${listed(ingredientsOf(potion.recipe))}.`,
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
