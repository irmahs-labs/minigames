import { useEffect, useRef } from "react";

import type { BrewAnswer } from "./api";

/** "Apple, Lime, Fresh ginger and Cayenne"; "Garlic and Honey". */
export const listed = (names: readonly string[]) =>
  names.length < 2
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1) ?? ""}`;

/** Ends text with a full stop, unless it ends with one: "Irma H.". */
const sentence = (text: string) => (text.endsWith(".") ? text : `${text}.`);

const WORDS = ["none", "one", "two", "three", "four"] as const;

const hintFor = ({
  closest,
  size,
  wrongForm,
}: Extract<BrewAnswer, { type: "mystery" }>) => {
  if (wrongForm) {
    const wanted = listed(wrongForm.wanted.map((part) => part.toLowerCase()));

    return `All the right ingredients for ${wrongForm.name}, but it wants ${wanted}.`;
  }

  if (!closest) {
    return `None of these ${WORDS[size] ?? size} is in a potion nobody has found yet.`;
  }

  const { name, needs, shared } = closest;

  if (shared === needs) {
    return `Everything in ${name} is in there, and more besides.`;
  }

  const count =
    shared === 1 ? `1 of these ${size} is` : `${shared} of these ${size} are`;

  const takes = needs === size ? "" : `, which takes ${WORDS[needs] ?? needs}`;

  return `${shared === needs - 1 ? "So close! " : ""}${count} in ${name}${takes}.`;
};

const kickerFor = ({
  first,
  isNew,
}: Extract<BrewAnswer, { type: "potion" }>) => {
  if (first) {
    return "First in the world to brew it!";
  }

  return isNew ? "New to you" : "You brewed";
};

interface BrewDialogProps {
  /** What came out of the cauldron; the dialog is open while it is set. */
  answer: BrewAnswer | null;
  onClose: () => void;
}

/** The popup that names the potion and who found it, or hints at one. */
export const BrewDialog = ({ answer, onClose }: BrewDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    if (answer && !dialog.open) {
      dialog.showModal();
    } else if (!answer && dialog.open) {
      dialog.close();
    }
  }, [answer]);

  const potion = answer?.type === "potion" ? answer : null;
  const mystery = answer?.type === "mystery" ? answer : null;

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
        <p className="kicker">
          {potion ? kickerFor(potion) : "The cauldron bubbles"}
        </p>
        <h2 id="brew-title" className="result__winner display">
          {potion ? `🧪 ${potion.page.name}` : "Mystery Potion"}
        </h2>
        <p className="result__note">
          {potion
            ? `${listed(potion.page.ingredients)}. ${potion.page.note}`
            : null}
          {mystery ? hintFor(mystery) : null}
        </p>
        {potion ? (
          <p className="result__note">
            {potion.first
              ? "Your name is on its page in the recipe book, for everyone to see."
              : sentence(`First brewed by ${potion.page.by}`)}
          </p>
        ) : null}
        <div className="result__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            {potion ? "Brew another" : "Try again"}
          </button>
        </div>
      </div>
    </dialog>
  );
};
