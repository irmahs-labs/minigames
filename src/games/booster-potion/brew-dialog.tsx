import { useEffect, useRef } from "react";

import type { BrewAnswer, FoundPage, Mystery, SoloBrewAnswer } from "./api";

/** "Apple, Lime, Fresh ginger and Cayenne"; "Garlic and Honey". */
export const listed = (names: readonly string[]) =>
  names.length < 2
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1) ?? ""}`;

/** Ends text with a full stop, unless it ends with one: "Irma H.". */
const sentence = (text: string) => (text.endsWith(".") ? text : `${text}.`);

/** "28 Oct 2026", in English whatever the browser's language. */
export const brewDay = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

interface Bylines {
  first: string;
  last: string;
}

/**
 * Who brewed a page's potion, as two lines: "First brewed by Ana L. on 28
 * Oct 2026, and 3 more" and "Last brewed by Ben C. on 29 Oct 2026", or "Last
 * brewed by no one" while nobody has brewed it since.
 */
export const bylinesOf = ({ at, by, last, others }: FoundPage): Bylines => ({
  first: `First brewed by ${by} on ${brewDay(at)}${
    others > 0 ? `, and ${others} more` : ""
  }`,
  last: last
    ? `Last brewed by ${last.name} on ${brewDay(last.at)}`
    : "Last brewed by no one",
});

const WORDS = ["none", "one", "two", "three", "four"] as const;

/**
 * The kinds a potion still needs, counted: ["fruit", "fruit", "dried spice"]
 * → "two fruits and a dried spice".
 */
export const neededOf = (kinds: readonly string[]): string => {
  const counts = new Map<string, number>();

  for (const kind of kinds) {
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }

  return listed(
    [...counts].map(([kind, count]) =>
      count === 1 ? `a ${kind}` : `${WORDS[count] ?? count} ${kind}s`
    )
  );
};

/** What the popup says about a brew. */
export interface DialogView {
  kicker: string;
  title: string;
  lines: string[];
  /** The main button's label. */
  again: string;
}

/**
 * The hint at the potion a mystery nearly was. `unfound` says whose finding
 * counts: "nobody has found yet" for the shared book, "you have still to
 * find" for the player's own.
 */
const hintFor = ({ closest, size, wrongForm }: Mystery, unfound: string) => {
  if (wrongForm) {
    const wanted = listed(wrongForm.wanted.map((part) => part.toLowerCase()));

    return `All the right ingredients for ${wrongForm.name}, but it wants ${wanted}.`;
  }

  if (!closest) {
    return `None of these ${WORDS[size] ?? size} is in a potion ${unfound}.`;
  }

  const { missing, name, needs, shared } = closest;

  if (shared === needs) {
    return `Everything in ${name} is in there, and more besides.`;
  }

  const count =
    shared === 1 ? `1 of these ${size} is` : `${shared} of these ${size} are`;

  return `${shared === needs - 1 ? "So close! " : ""}${count} in ${name}. It still needs ${neededOf(missing)}.`;
};

const mysteryView = (answer: Mystery, unfound: string): DialogView => ({
  again: "Try again",
  kicker: "The cauldron bubbles",
  lines: [hintFor(answer, unfound)],
  title: "Mystery Potion",
});

/** A brew for the shared book: who was first, and whether it was you. */
export const sharedView = (answer: BrewAnswer): DialogView => {
  if (answer.type === "mystery") {
    return mysteryView(answer, "nobody has found yet");
  }

  const { first, isNew, page } = answer;

  let kicker = "You brewed";

  if (first) {
    kicker = "First in the world to brew it!";
  } else if (isNew) {
    kicker = "New to you";
  }

  return {
    again: "Brew another",
    kicker,
    lines: [
      `${listed(page.ingredients)}. ${page.note}`,
      first
        ? "Your name is on its page in the grimoire, for everyone to see."
        : sentence(bylinesOf(page).first),
    ],
    title: `🔮 ${page.name}`,
  };
};

/** A brew for the player's own book. */
export const soloView = (answer: SoloBrewAnswer): DialogView => {
  if (answer.type === "mystery") {
    return mysteryView(answer, "you have still to find");
  }

  const { isNew, page } = answer;

  return {
    again: "Brew another",
    kicker: isNew ? "New potion for your grimoire!" : "You brewed",
    lines: [`${listed(page.ingredients)}. ${page.note}`],
    title: `🔮 ${page.name}`,
  };
};

interface BrewDialogProps {
  /** What to say about the brew; the dialog is open while it is set. */
  view: DialogView | null;
  onClose: () => void;
}

/** The popup that names the potion, or hints at the one it nearly was. */
export const BrewDialog = ({ view, onClose }: BrewDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    if (view && !dialog.open) {
      dialog.showModal();
    } else if (!view && dialog.open) {
      dialog.close();
    }
  }, [view]);

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
        <p className="kicker">{view?.kicker}</p>
        <h2 id="brew-title" className="result__winner display">
          {view?.title}
        </h2>
        {view?.lines.map((line) => (
          <p key={line} className="result__note">
            {line}
          </p>
        ))}
        <div className="result__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            {view?.again}
          </button>
        </div>
      </div>
    </dialog>
  );
};
