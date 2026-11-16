import { useEffect } from "react";
import * as z from "zod/mini";

import { MiniGamesIcon } from "./components/app-icons";
import { Header } from "./components/header";
import { APP_NAME } from "./lib/brand";
import { useCopy } from "./lib/language";

/**
 * The Book of Shadows, Booster Potion (now Potion Brewing) and Spell
 * Creator moved to Realms on 2026-11-16, and the Festival Calendar to the
 * landing page, beside the apps, the same day. Their old addresses here
 * send visitors on to where each is now.
 */
export const REALMS = "https://realms.irmahs.dev";

export const HOME = "https://irmahs.dev";

const MOVED = new Map([
  ["/book-of-shadows", `${REALMS}/book-of-shadows`],
  ["/booster-potion", `${REALMS}/book-of-shadows/potion-brewing`],
  ["/spell-creator", `${REALMS}/book-of-shadows/spell-creator`],
  ["/festival-calendar", `${HOME}/`],
]);

/** A saved book is a JSON object; Realms checks its fields itself. */
const savedBookSchema = z.looseObject({});

/** Where the Book of Shadows kept a visitor's book on this site. */
export const BOOK_KEY = "minigames:book-of-shadows:v1";

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCodePoint(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    // Base64 only ever uses "=" as padding at the end.
    .replaceAll("=", "");

/**
 * A book saved here, as the fragment Realms reads it from (its
 * carry-over.ts): "#book=" and the book's JSON, UTF-8, in base64url. A
 * fragment never reaches a server. Nothing saved, or nothing readable as an
 * object, carries nothing; Realms checks the rest against its own schema.
 */
export const bookFragment = (saved: string | null): string => {
  if (!saved) {
    return "";
  }

  try {
    if (!savedBookSchema.safeParse(JSON.parse(saved)).success) {
      return "";
    }
  } catch {
    return "";
  }

  return `#book=${toBase64Url(new TextEncoder().encode(saved))}`;
};

const savedBook = (): string | null => {
  try {
    return window.localStorage.getItem(BOOK_KEY);
  } catch {
    return null;
  }
};

/**
 * Where a page that moved is now, its book carried along for the Book of
 * Shadows, or null when `path` didn't move.
 */
export const movedTo = (
  path: string,
  saved: string | null = savedBook()
): string | null => {
  const there = MOVED.get(path);

  if (!there) {
    return null;
  }

  return path === "/book-of-shadows" ? `${there}${bookFragment(saved)}` : there;
};

const COPY = {
  en: {
    home: {
      go: "go to irmahs.dev",
      sub: "The Festival Calendar sits beside the apps on irmahs.dev now. Taking you there…",
      title: "This moved to irmahs.dev",
    },
    realms: {
      go: "go to Realms",
      sub: "It lives in the Book of Shadows on Realms now. Taking you there…",
      title: "This moved to Realms",
    },
  },
  fr: {
    home: {
      go: "aller sur irmahs.dev",
      sub: "Le calendrier des fêtes est désormais à côté des apps, sur irmahs.dev. On vous y emmène…",
      title: "Ce jeu a déménagé sur irmahs.dev",
    },
    realms: {
      go: "aller sur Realms",
      sub: "Il vit désormais dans le Livre des ombres, sur Realms. On vous y emmène…",
      title: "Ce jeu a déménagé sur Realms",
    },
  },
};

/** Sends the visitor on to `to` at once, with a link in case that fails. */
export const Moved = ({ to }: { to: string }) => {
  const words = useCopy(COPY);
  const t = to.startsWith(REALMS) ? words.realms : words.home;

  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <>
      <Header icon={<MiniGamesIcon />} name={APP_NAME} href="/" />
      <main className="page">
        <section className="panel empty">
          <span className="legend">moved.txt</span>
          <h2 className="display page__title">{t.title}</h2>
          <p className="page__sub">{t.sub}</p>
          <a href={to} className="btn btn--primary">
            {t.go}
          </a>
        </section>
      </main>
    </>
  );
};
