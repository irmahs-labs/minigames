import { useEffect, useRef } from "react";

import { LOCALES } from "../../lib/language";
import type { Language } from "../../lib/language";
import type { BrewAnswer, FoundPage, Mystery, SoloBrewAnswer } from "./api";
import { countedKind, partLabel } from "./words";

/** "Apple, Lime, Fresh ginger and Cayenne"; "Garlic and Honey" ("Ail et Miel"). */
export const listed = (names: readonly string[], language: Language = "en") =>
  names.length < 2
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} ${language === "fr" ? "et" : "and"} ${names.at(-1) ?? ""}`;

/** The ingredients the server lists, in the page's language: "Gingembre frais". */
const ingredientsOf = (labels: readonly string[], language: Language) =>
  listed(
    labels.map((label) => partLabel(label, language)),
    language
  );

/** Ends text with a full stop, unless it ends with one: "Irma H.". */
const sentence = (text: string) => (text.endsWith(".") ? text : `${text}.`);

/** "28 Oct 2026", or "28 oct. 2026" in French, whatever the browser's language. */
export const brewDay = (iso: string, language: Language = "en"): string =>
  new Date(iso).toLocaleDateString(LOCALES[language], {
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
export const bylinesOf = (
  { at, by, last, others }: FoundPage,
  language: Language = "en"
): Bylines =>
  language === "fr"
    ? {
        first: `Préparée d’abord par ${by} le ${brewDay(at, language)}${
          others > 0 ? `, et ${others} ${others > 1 ? "autres" : "autre"}` : ""
        }`,
        last: last
          ? `Préparée en dernier par ${last.name} le ${brewDay(last.at, language)}`
          : "Personne d’autre ne l’a préparée",
      }
    : {
        first: `First brewed by ${by} on ${brewDay(at)}${
          others > 0 ? `, and ${others} more` : ""
        }`,
        last: last
          ? `Last brewed by ${last.name} on ${brewDay(last.at)}`
          : "Last brewed by no one",
      };

const WORDS = ["none", "one", "two", "three", "four"] as const;

/**
 * The kinds a potion still needs, counted: ["fruit", "fruit", "dried spice"]
 * → "two fruits and a dried spice" ("deux fruits et une épice séchée").
 */
export const neededOf = (
  kinds: readonly string[],
  language: Language = "en"
): string => {
  const counts = new Map<string, number>();

  for (const kind of kinds) {
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }

  return listed(
    [...counts].map(([kind, count]) => {
      if (language === "fr") {
        return countedKind(kind, count);
      }

      return count === 1 ? `a ${kind}` : `${WORDS[count] ?? count} ${kind}s`;
    }),
    language
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
const hintFor = (
  { closest, size, wrongForm }: Mystery,
  unfound: string,
  language: Language
) => {
  const french = language === "fr";

  if (wrongForm) {
    const wanted = listed(
      wrongForm.wanted.map((part) => partLabel(part, language).toLowerCase()),
      language
    );

    return french
      ? `Tous les bons ingrédients pour ${wrongForm.name}, mais il lui faut ${wanted}.`
      : `All the right ingredients for ${wrongForm.name}, but it wants ${wanted}.`;
  }

  if (!closest) {
    return french
      ? `Aucun de ces ${size} ingrédients n’est dans une potion ${unfound}.`
      : `None of these ${WORDS[size] ?? size} is in a potion ${unfound}.`;
  }

  const { missing, name, needs, shared } = closest;

  if (shared === needs) {
    return french
      ? `Tout ce qu’il faut pour ${name} est là, et plus encore.`
      : `Everything in ${name} is in there, and more besides.`;
  }

  const close = shared === needs - 1;

  if (french) {
    const count =
      shared === 1 ? `1 de ces ${size} est` : `${shared} de ces ${size} sont`;

    return `${close ? "Presque ! " : ""}${count} dans ${name}. Il lui faut encore ${neededOf(missing, language)}.`;
  }

  const count =
    shared === 1 ? `1 of these ${size} is` : `${shared} of these ${size} are`;

  return `${close ? "So close! " : ""}${count} in ${name}. It still needs ${neededOf(missing)}.`;
};

const VIEW_WORDS = {
  en: {
    again: "Try again",
    another: "Brew another",
    bubbles: "The cauldron bubbles",
    first: "First in the world to brew it!",
    mystery: "Mystery Potion",
    newPotion: "New potion for your grimoire!",
    newToYou: "New to you",
    nobodyYet: "nobody has found yet",
    stillToFind: "you have still to find",
    youBrewed: "You brewed",
    yourName: "Your name is on its page in the grimoire, for everyone to see.",
  },
  fr: {
    again: "Réessayer",
    another: "En préparer une autre",
    bubbles: "Le chaudron bouillonne",
    first: "Premier au monde à la préparer !",
    mystery: "Potion mystère",
    newPotion: "Nouvelle potion pour votre grimoire !",
    newToYou: "Nouvelle pour vous",
    nobodyYet: "que personne n’a encore trouvée",
    stillToFind: "que vous n’avez pas encore trouvée",
    youBrewed: "Vous avez préparé",
    yourName: "Votre nom est sur sa page du grimoire, à la vue de tous.",
  },
};

const mysteryView = (
  answer: Mystery,
  unfound: string,
  language: Language
): DialogView => ({
  again: VIEW_WORDS[language].again,
  kicker: VIEW_WORDS[language].bubbles,
  lines: [hintFor(answer, unfound, language)],
  title: VIEW_WORDS[language].mystery,
});

/** A found potion's ingredients and note, in the page's language. */
const recipeLine = (
  page: { ingredients: string[]; note: string; noteFr: string },
  language: Language
) =>
  `${ingredientsOf(page.ingredients, language)}. ${language === "fr" ? page.noteFr : page.note}`;

/** A brew for the shared book: who was first, and whether it was you. */
export const sharedView = (
  answer: BrewAnswer,
  language: Language = "en"
): DialogView => {
  const words = VIEW_WORDS[language];

  if (answer.type === "mystery") {
    return mysteryView(answer, words.nobodyYet, language);
  }

  const { first, isNew, page } = answer;

  let kicker = words.youBrewed;

  if (first) {
    kicker = words.first;
  } else if (isNew) {
    kicker = words.newToYou;
  }

  return {
    again: words.another,
    kicker,
    lines: [
      recipeLine(page, language),
      first ? words.yourName : sentence(bylinesOf(page, language).first),
    ],
    title: `🔮 ${page.name}`,
  };
};

/** A brew for the player's own book. */
export const soloView = (
  answer: SoloBrewAnswer,
  language: Language = "en"
): DialogView => {
  const words = VIEW_WORDS[language];

  if (answer.type === "mystery") {
    return mysteryView(answer, words.stillToFind, language);
  }

  const { isNew, page } = answer;

  return {
    again: words.another,
    kicker: isNew ? words.newPotion : words.youBrewed,
    lines: [recipeLine(page, language)],
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
