import { useEffect, useState } from "react";
import * as z from "zod/mini";

import { BoosterPotionIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { currentAccount, signInUrl } from "../../lib/account";
import type { Account } from "../../lib/account";
import { Icon } from "../../lib/icon";
import { useCopy, useLanguage } from "../../lib/language";
import type { Language } from "../../lib/language";
import { Link } from "../../lib/router";
import { serverWords } from "../../lib/server-words";
import { readStored, writeStored } from "../../lib/storage";
import { useConfirm } from "../../lib/use-confirm";
import type { Book, Brewer, LatestBrew, Page, SoloPage } from "./api";
import {
  fetchBook,
  fetchBrewers,
  fetchSoloBook,
  postBrew,
  postSoloBrew,
  resetSoloBook,
} from "./book-api";
import {
  BrewDialog,
  brewDay,
  bylinesOf,
  listed,
  sharedView,
  soloView,
} from "./brew-dialog";
import type { DialogView } from "./brew-dialog";
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
import {
  clueLabel,
  ingredientName,
  kindLabel,
  partLabel,
  tipOf,
} from "./words";

const COPY = {
  en: {
    allGames: "all games",
    bases: "Bases",
    basesHint: "Juices, fruit, vegetables and teas.",
    brew: "🔮 Brew",
    brewing: "Brewing…",
    empty: "Empty it",
    emptySlots: [
      "an ingredient",
      "an ingredient",
      "a third, if the recipe takes one",
      "a fourth, if the recipe takes one",
    ],
    forms: {
      dried: "Dried",
      fresh: "Fresh",
      powder: "Powder",
    } satisfies Record<Form, string>,
    found: (iso: string) => `Found ${iso}`,
    foundByEveryone: (n: number) => `of ${n} found by everyone`,
    foundOf: (n: number) => `of ${n} found`,
    grimoire: "Grimoire",
    how: "How to play",
    howGoesIn: (name: string) => `${name}: how it goes in`,
    howTo: [
      "Pick two to four ingredients from any shelves, like lemon, ginger and honey.",
      "Some come fresh, dried or as a powder: pick which in the cauldron. A ginger shot takes fresh ginger; a ginger tea, dried.",
      "Brew. The right ones make a potion, each a real wellness shot, tea or tonic.",
    ],
    howToLast: {
      shared:
        "The first to brew a potion puts their name on its page, for everyone.",
      solo: "Each one goes in your own grimoire, kept on your account.",
    },
    inCauldron: "In the cauldron",
    ingredients: "Ingredients",
    lastBrew: "Last brew",
    lookingUp: "Looking them up…",
    modes: { shared: "Everyone's grimoire", solo: "My own grimoire" },
    myGrimoire: "My grimoire",
    mysteryElse: "Anything else is a Mystery Potion, with a hint.",
    noList: "The list cannot be had right now.",
    notice: {
      shared: "Brews go in the shared grimoire under your irmahs.dev name.",
      solo: "Your own grimoire is kept on your irmahs.dev account.",
    },
    opening: "Opening the grimoire…",
    openingYours: "Opening your grimoire…",
    pick: "Pick your ingredients",
    pickMore: (n: number) => `Pick ${n} more, from any shelf.`,
    ready: "Ready to brew",
    realRecipe: "The real recipe ↗",
    sharedHint:
      "One grimoire for everyone: the first to brew a potion puts their name on it. Every potion is a real wellness shot, tea or tonic, for fun and not as medical advice.",
    signIn: "Sign in",
    signInBrew: "Sign in to brew",
    soloHint:
      "Your own grimoire, apart from the shared one: what you brew here never goes in it. Every potion is a real wellness shot, tea or tonic, for fun and not as medical advice.",
    soloPitch:
      "Play on your own: every potion you find goes in a grimoire of your own, kept on your irmahs.dev account, on every device.",
    startOver: "Start over",
    status: [
      "Two in. Brew now, or add more.",
      "Three in. Brew now, or add a fourth.",
      "Four in. Give it a stir!",
    ],
    sub: "brew real wellness shots and teas, and put your name in the grimoire",
    sureStartOver: "Sure? Start over",
    toppings: "Toppings",
    toppingsHint: "The kick, the colour and the sweetness.",
    unreachable: "The grimoire cannot be reached right now.",
    unreachableYours: "Your grimoire cannot be reached right now.",
    whichGrimoire: "Which grimoire",
    yoursBrewed: (n: number) => `, ${n} brewed by you`,
  },
  fr: {
    allGames: "tous les jeux",
    bases: "Bases",
    basesHint: "Jus, fruits, légumes et thés.",
    brew: "🔮 Préparer",
    brewing: "Préparation…",
    empty: "Vider",
    emptySlots: [
      "un ingrédient",
      "un ingrédient",
      "un troisième, si la recette en prend un",
      "un quatrième, si la recette en prend un",
    ],
    forms: {
      dried: "Séché",
      fresh: "Frais",
      powder: "Poudre",
    } satisfies Record<Form, string>,
    found: (day: string) => `Trouvée le ${day}`,
    foundByEveryone: (n: number) => `sur ${n} trouvées par tous`,
    foundOf: (n: number) => `sur ${n} trouvées`,
    grimoire: "Grimoire",
    how: "Comment jouer",
    howGoesIn: (name: string) => `${name} : sous quelle forme`,
    howTo: [
      "Choisissez deux à quatre ingrédients sur n’importe quelles étagères, comme citron, gingembre et miel.",
      "Certains existent frais, séchés ou en poudre : choisissez dans le chaudron. Un shot de gingembre prend du gingembre frais ; un thé au gingembre, du séché.",
      "Préparez. Les bons ingrédients font une potion, chacune un vrai shot, thé ou tonique bien-être.",
    ],
    howToLast: {
      shared:
        "Le premier à préparer une potion met son nom sur sa page, pour tout le monde.",
      solo: "Chacune va dans votre propre grimoire, gardé sur votre compte.",
    },
    inCauldron: "Dans le chaudron",
    ingredients: "Ingrédients",
    lastBrew: "Dernière potion",
    lookingUp: "Recherche…",
    modes: { shared: "Le grimoire de tous", solo: "Mon propre grimoire" },
    myGrimoire: "Mon grimoire",
    mysteryElse: "Tout le reste est une Potion mystère, avec un indice.",
    noList: "La liste n’est pas disponible pour le moment.",
    notice: {
      shared:
        "Les potions vont dans le grimoire commun sous votre nom irmahs.dev.",
      solo: "Votre propre grimoire est gardé sur votre compte irmahs.dev.",
    },
    opening: "Ouverture du grimoire…",
    openingYours: "Ouverture de votre grimoire…",
    pick: "Choisissez vos ingrédients",
    pickMore: (n: number) => `Encore ${n}, sur n’importe quelle étagère.`,
    ready: "Prêt à préparer",
    realRecipe: "La vraie recette ↗",
    sharedHint:
      "Un grimoire pour tout le monde : le premier à préparer une potion y met son nom. Chaque potion est un vrai shot, thé ou tonique bien-être, pour le plaisir et pas comme conseil médical.",
    signIn: "Se connecter",
    signInBrew: "Connectez-vous pour préparer",
    soloHint:
      "Votre propre grimoire, à part du grimoire commun : ce que vous préparez ici n’y va jamais. Chaque potion est un vrai shot, thé ou tonique bien-être, pour le plaisir et pas comme conseil médical.",
    soloPitch:
      "Jouez en solo : chaque potion trouvée va dans votre propre grimoire, gardé sur votre compte irmahs.dev, sur tous vos appareils.",
    startOver: "Recommencer",
    status: [
      "Deux dedans. Préparez maintenant, ou ajoutez-en.",
      "Trois dedans. Préparez maintenant, ou ajoutez un quatrième.",
      "Quatre dedans. Un petit coup de cuillère !",
    ],
    sub: "préparez de vrais shots et thés bien-être, et inscrivez votre nom dans le grimoire",
    sureStartOver: "Sûr ? Recommencer",
    toppings: "Garnitures",
    toppingsHint: "Le piquant, la couleur et la douceur.",
    unreachable: "Le grimoire est injoignable pour le moment.",
    unreachableYours: "Votre grimoire est injoignable pour le moment.",
    whichGrimoire: "Quel grimoire",
    yoursBrewed: (n: number) =>
      `, ${n} ${n > 1 ? "préparées" : "préparée"} par vous`,
  },
};

/** A shelf's name, capitalised: "Dried spice"'s "Spice", or "Épice" in French. */
const title = (kind: Kind, language: Language) => {
  const name = kindLabel(kind, language);

  return `${name[0]?.toUpperCase()}${name.slice(1)}`;
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
}) => {
  const language = useLanguage();

  return (
    <fieldset className="shelf">
      <legend className="field-label">
        {KIND_EMOJI[kind]} {title(kind, language)}
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
              {ingredientName(name, language)}
            </button>
            <span role="tooltip" id={tipId(name)} className="tip">
              {tipOf(name, language)}
            </span>
          </span>
        ))}
      </div>
    </fieldset>
  );
};

/** How an ingredient that comes more than one way goes in. */
const FormPicker = ({
  part,
  onForm,
}: {
  part: Part;
  onForm: (form: Form) => void;
}) => {
  const language = useLanguage();
  const t = COPY[language];

  return (
    <fieldset
      className="forms"
      aria-label={t.howGoesIn(ingredientName(part.name, language))}
    >
      {formsOf(part.name).map((form) => (
        <button
          key={form}
          type="button"
          className="forms__option"
          aria-pressed={form === part.form}
          onClick={() => onForm(form)}
        >
          {t.forms[form]}
        </button>
      ))}
    </fieldset>
  );
};

/** The four places in the cauldron, filled in the order they were picked. */
const Cauldron = ({
  selection,
  onForm,
}: {
  selection: Selection;
  onForm: (name: string, form: Form) => void;
}) => {
  const language = useLanguage();

  return (
    <ul className="cauldron">
      {/* What an empty place says: the last two are up to you. */}
      {COPY[language].emptySlots.map((empty, i) => {
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
              {part ? partLabel(labelOf(part), language) : empty}
              {name && TIPS.has(name) ? (
                <span className="cauldron__tip">{tipOf(name, language)}</span>
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
};

/** The book is fetched again this often, so the last brew stays current. */
const REFRESH_MS = 30_000;

/** "just now", "5 min ago", "3 h ago", "2 days ago"; "il y a 5 min" in French. */
const ago = (iso: string, now: number, language: Language) => {
  const minutes = Math.floor((now - Date.parse(iso)) / 60_000);
  const french = language === "fr";

  if (minutes < 1) {
    return french ? "à l’instant" : "just now";
  }

  if (minutes < 60) {
    return french ? `il y a ${minutes} min` : `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return french ? `il y a ${hours} h` : `${hours} h ago`;
  }

  const days = Math.floor(hours / 24);

  if (french) {
    return days === 1 ? "il y a 1 jour" : `il y a ${days} jours`;
  }

  return days === 1 ? "1 day ago" : `${days} days ago`;
};

/**
 * Who brewed a page's potion: the byline, which opens the full list, first
 * first, fetched the first time it is opened.
 */
const Brewers = ({ page }: { page: Extract<Page, { state: "found" }> }) => {
  const [open, setOpen] = useState(false);
  // undefined until fetched, null when it cannot be had.
  const [brewers, setBrewers] = useState<Brewer[] | null | undefined>();
  const language = useLanguage();
  const t = COPY[language];

  const bylines = bylinesOf(page, language);
  const last = <p className="recipe-card__by">{bylines.last}</p>;

  if (page.others === 0) {
    return (
      <div className="stack">
        <p className="recipe-card__by">{bylines.first}</p>
        {last}
      </div>
    );
  }

  const toggle = async () => {
    setOpen(!open);

    if (brewers === undefined) {
      setBrewers(await fetchBrewers(page.name));
    }
  };

  return (
    <div className="stack">
      <button
        type="button"
        className="recipe-card__by recipe-card__by--open"
        aria-expanded={open}
        onClick={toggle}
      >
        {bylines.first} {open ? "▴" : "▾"}
      </button>
      {last}
      {open && brewers === undefined ? (
        <p className="recipe-card__note">{t.lookingUp}</p>
      ) : null}
      {open && brewers === null ? (
        <p className="recipe-card__note">{t.noList}</p>
      ) : null}
      {open && brewers ? (
        <ol className="brewers">
          {brewers.map((brewer, i) => (
            // Two people may share a name; their place in the list is theirs.
            // oxlint-disable-next-line no-array-index-key
            <li key={i}>
              {brewer.name} <span>{brewDay(brewer.at, language)}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
};

/** The last brew by anyone, in the book's corner: who, what and when. */
const LastBrew = ({ latest, now }: { latest: LatestBrew; now: number }) => {
  const language = useLanguage();

  return (
    <p className="book__latest" aria-live="polite">
      <span aria-hidden="true">🔮 </span>
      {COPY[language].lastBrew}
      {language === "fr" ? " : " : ": "}
      {latest.name}, {latest.potion}, {ago(latest.at, now, language)}
    </p>
  );
};

/** A page of the shared book: the recipe and who found it, or its clue. */
const BookPage = ({ page }: { page: Page }) => {
  const language = useLanguage();
  const t = COPY[language];

  if (page.state === "locked") {
    return (
      <li className="recipe-card">
        <h3 className="display recipe-card__name">🔒 ???</h3>
        <p className="recipe-card__recipe">{clueLabel(page.clue, language)}</p>
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
      <h3 className="display recipe-card__name">🔮 {page.name}</h3>
      <p className="recipe-card__recipe">
        {listed(
          page.ingredients.map((label) => partLabel(label, language)),
          language
        )}
      </p>
      <p className="recipe-card__note">
        {language === "fr" ? page.noteFr : page.note}
      </p>
      <Brewers page={page} />
      <a
        className="recipe-card__source"
        href={page.source}
        target="_blank"
        rel="noreferrer"
      >
        {t.realRecipe}
      </a>
    </li>
  );
};

const MODE_KEY = "minigames:booster-potion:mode:v1";

const modeSchema = z.enum(["shared", "solo"]);

type Mode = z.infer<typeof modeSchema>;

/** A page of the player's own book: the recipe once they found it. */
const SoloBookPage = ({ page }: { page: SoloPage }) => {
  const language = useLanguage();
  const t = COPY[language];

  if (page.state === "locked") {
    return (
      <li className="recipe-card">
        <h3 className="display recipe-card__name">🔒 ???</h3>
        <p className="recipe-card__recipe">{clueLabel(page.clue, language)}</p>
      </li>
    );
  }

  return (
    <li className="recipe-card recipe-card--found">
      <h3 className="display recipe-card__name">🔮 {page.name}</h3>
      <p className="recipe-card__recipe">
        {listed(
          page.ingredients.map((label) => partLabel(label, language)),
          language
        )}
      </p>
      <p className="recipe-card__note">
        {language === "fr" ? page.noteFr : page.note}
      </p>
      <p className="recipe-card__by">
        {t.found(brewDay(page.foundAt, language))}
      </p>
      <a
        className="recipe-card__source"
        href={page.source}
        target="_blank"
        rel="noreferrer"
      >
        {t.realRecipe}
      </a>
    </li>
  );
};

/** The player's own book, kept on their account, with a way to start over. */
const SoloBook = ({
  account,
  pages: soloPages,
  onStartOver,
}: {
  account: Account | null | undefined;
  pages: SoloPage[] | null | undefined;
  onStartOver: () => Promise<void>;
}) => {
  const confirm = useConfirm();
  const t = useCopy(COPY);

  const soloFound =
    soloPages?.filter((page) => page.state === "found").length ?? 0;

  return (
    <section aria-labelledby="solo-title" className="panel panel--board">
      <span className="legend">my-grimoire.epub</span>
      <div className="slices__head">
        <div className="stack">
          <h2 id="solo-title" className="display turn">
            {t.myGrimoire}
          </h2>
          {soloPages ? (
            <span className="slices__count">
              {soloFound} <span>{t.foundOf(soloPages.length)}</span>
            </span>
          ) : null}
        </div>
        {soloPages ? (
          <button
            type="button"
            className="btn btn--quiet"
            disabled={soloFound === 0}
            onClick={() => confirm.press("reset", onStartOver)}
          >
            {confirm.armed === "reset" ? t.sureStartOver : t.startOver}
          </button>
        ) : null}
      </div>

      {account === null ? (
        <div className="stack">
          <p className="turn__note">{t.soloPitch}</p>
          <div>
            <a href={signInUrl()} className="btn btn--primary">
              {t.signIn}
            </a>
          </div>
        </div>
      ) : null}
      {account && soloPages === undefined ? (
        <p className="hint">{t.openingYours}</p>
      ) : null}
      {account && soloPages === null ? (
        <p className="hint">{t.unreachableYours}</p>
      ) : null}
      {soloPages ? (
        <ul className="book">
          {soloPages.map((page, i) => (
            // Pages keep their place in the book, found or not.
            // oxlint-disable-next-line no-array-index-key
            <SoloBookPage key={i} page={page} />
          ))}
        </ul>
      ) : null}
      <p className="hint">{t.soloHint}</p>
    </section>
  );
};

/** The book everyone shares: who found what, and the last brew. */
const SharedBook = ({
  account,
  book,
  now,
}: {
  account: Account | null | undefined;
  book: Book | null | undefined;
  now: number;
}) => {
  const pages = book?.pages;
  const found = pages?.filter((page) => page.state === "found") ?? [];
  const yours = found.filter((page) => page.yours).length;
  const t = useCopy(COPY);

  return (
    <section aria-labelledby="book-title" className="panel panel--board">
      <span className="legend">grimoire.epub</span>
      {book?.latest ? <LastBrew latest={book.latest} now={now} /> : null}
      <div className="stack">
        <h2 id="book-title" className="display turn">
          {t.grimoire}
        </h2>
        {pages ? (
          <span className="slices__count">
            {found.length}{" "}
            <span>
              {t.foundByEveryone(pages.length)}
              {account ? t.yoursBrewed(yours) : ""}
            </span>
          </span>
        ) : null}
      </div>

      {book === undefined ? <p className="hint">{t.opening}</p> : null}
      {book === null ? <p className="hint">{t.unreachable}</p> : null}
      {pages ? (
        <ul className="book">
          {pages.map((page, i) => (
            // Pages keep their place in the book, found or not.
            // oxlint-disable-next-line no-array-index-key
            <BookPage key={i} page={page} />
          ))}
        </ul>
      ) : null}
      <p className="hint">{t.sharedHint}</p>
    </section>
  );
};

const BoosterPotion = ({ name }: GameProps) => {
  const language = useLanguage();
  const t = COPY[language];
  const [selection, setSelection] = useState<Selection>(EMPTY);
  // undefined until the server answers, or when it cannot be reached.
  const [account, setAccount] = useState<Account | null | undefined>();
  // undefined while loading, null when the book cannot be had.
  const [book, setBook] = useState<Book | null | undefined>();
  const [now, setNow] = useState(Date.now);

  // The book picked last, so a reload comes back to it.
  const [mode, setMode] = useState<Mode>(() =>
    readStored(MODE_KEY, modeSchema, () => "shared")
  );

  // The player's own book: undefined while loading, null when it cannot be had.
  const [soloPages, setSoloPages] = useState<SoloPage[] | null | undefined>();
  const [view, setView] = useState<DialogView | null>(null);
  const [brewing, setBrewing] = useState(false);
  const [trouble, setTrouble] = useState<string | null>(null);

  const ready = isReady(selection);

  useEffect(() => writeStored(MODE_KEY, mode), [mode]);

  useEffect(() => {
    let current = true;

    const load = async () => {
      const [who, first] = await Promise.all([currentAccount(), fetchBook()]);

      if (current) {
        setAccount(who);
        setBook(first);
        setNow(Date.now());
      }

      // Only someone signed in has a book of their own.
      if (who) {
        const own = await fetchSoloBook();

        if (current) {
          setSoloPages(own);
        }
      }
    };

    // Others brew too: the book is fetched again now and then, while the
    // page is in view, so their finds and the last brew show up.
    const refresh = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const fresh = await fetchBook();

      if (current && fresh) {
        setBook(fresh);
        setNow(Date.now());
      }
    };

    void load();
    const timer = window.setInterval(refresh, REFRESH_MS);

    return () => {
      current = false;
      window.clearInterval(timer);
    };
  }, []);

  const brewShared = async () => {
    const result = await postBrew(selection);

    if (!result.ok) {
      return result.message;
    }

    if (result.answer.type === "potion") {
      // A potion is done with; a mystery stays in to be changed one by one.
      setSelection(EMPTY);
      // Others may have found potions too: the whole book comes back fresh.
      const fresh = await fetchBook();

      if (fresh) {
        setBook(fresh);
        setNow(Date.now());
      }
    }

    setView(sharedView(result.answer, language));

    return null;
  };

  const brewSolo = async () => {
    const result = await postSoloBrew(selection);

    if (!result.ok) {
      return result.message;
    }

    if (result.answer.type === "potion") {
      setSelection(EMPTY);
      setSoloPages((await fetchSoloBook()) ?? soloPages);
    }

    setView(soloView(result.answer, language));

    return null;
  };

  const brewIt = async () => {
    if (!ready || brewing) {
      return;
    }

    setBrewing(true);
    setTrouble(null);
    const problem = mode === "solo" ? await brewSolo() : await brewShared();

    setBrewing(false);
    setTrouble(problem);
  };

  const startOver = async () => {
    if (await resetSoloBook()) {
      setSoloPages(await fetchSoloBook());
    } else {
      setTrouble("Your grimoire could not be started over. Try again.");
    }
  };

  const status = () => {
    if (!ready) {
      const more = MIN_INGREDIENTS - selection.length;

      return t.pickMore(more);
    }

    return t.status[selection.length - MIN_INGREDIENTS];
  };

  const notice = () => {
    if (trouble) {
      return serverWords(trouble, language);
    }

    if (account === null) {
      return t.notice[mode];
    }

    return account === undefined && book !== undefined
      ? serverWords("The cauldron can't be reached right now.", language)
      : "";
  };

  const chosen = selection.map((part) => part.name);

  return (
    <>
      <Header icon={<BoosterPotionIcon />} name={name} href="/booster-potion">
        <Link href="/" className="btn">
          <Icon name="back" size={16} />
          {t.allGames}
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub">{t.sub}</p>

        <nav aria-label={t.whichGrimoire} className="picker">
          {modeSchema.options.map((option) => (
            <button
              key={option}
              type="button"
              className="picker__option"
              aria-pressed={option === mode}
              onClick={() => {
                setMode(option);
                setTrouble(null);
              }}
            >
              {t.modes[option]}
            </button>
          ))}
        </nav>

        <div className="layout">
          <section aria-label={t.ingredients} className="panel panel--pantry">
            <span className="legend">pantry.csv</span>

            <div className="stack">
              <h2 className="display turn">{t.bases}</h2>
              <p className="hint">{t.basesHint}</p>
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
              <h2 className="display turn">{t.toppings}</h2>
              <p className="hint">{t.toppingsHint}</p>
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
            <span className="legend">cauldron.bat</span>

            <div className="stack">
              <p className="kicker">{t.inCauldron}</p>
              <h2 id="cauldron-title" className="display turn">
                {ready ? t.ready : t.pick}
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
                  {t.signInBrew}
                </a>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary btn--spin"
                  disabled={!ready || brewing || account === undefined}
                  onClick={brewIt}
                >
                  {brewing ? t.brewing : t.brew}
                </button>
              )}
              <button
                type="button"
                className="btn btn--quiet"
                disabled={selection.length === 0}
                onClick={() => setSelection(EMPTY)}
              >
                {t.empty}
              </button>
            </div>
            <p className="hint" aria-live="polite">
              {notice()}
            </p>

            <div className="stack">
              <h3 className="field-label">{t.how}</h3>
              <ol className="how-to">
                {t.howTo.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>
                  {t.howToLast[mode]} {t.mysteryElse}
                </li>
              </ol>
            </div>
          </section>
        </div>

        {mode === "solo" ? (
          <SoloBook
            account={account}
            pages={soloPages}
            onStartOver={startOver}
          />
        ) : (
          <SharedBook account={account} book={book} now={now} />
        )}

        <BrewDialog view={view} onClose={() => setView(null)} />
      </main>
    </>
  );
};

export default BoosterPotion;
