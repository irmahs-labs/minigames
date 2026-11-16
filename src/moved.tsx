import { useEffect } from "react";
import * as z from "zod/mini";

import { MiniGamesIcon } from "./components/app-icons";
import { Header } from "./components/header";
import { APP_NAME } from "./lib/brand";
import { useCopy } from "./lib/language";

/**
 * The Book of Shadows, Booster Potion (now Potion Brewing) and Spell
 * Creator moved to Realms on 2026-11-16. Their old addresses here send
 * visitors to the same page there.
 */
export const REALMS = "https://realms.irmahs.dev";

const MOVED = new Map([
  ["/book-of-shadows", "/book-of-shadows"],
  ["/booster-potion", "/book-of-shadows/potion-brewing"],
  ["/spell-creator", "/book-of-shadows/spell-creator"],
]);

/** A saved book is a JSON object; Realms checks its fields itself. */
const savedBookSchema = z.looseObject({});

/** Where the Book of Shadows kept a visitor's book on this site. */
export const BOOK_KEY = "minigames:book-of-shadows:v1";

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCodePoint(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/[=]+$/u, "");

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
 * Where a page that moved to Realms is now, its book carried along for the
 * Book of Shadows, or null when `path` didn't move.
 */
export const movedTo = (
  path: string,
  saved: string | null = savedBook()
): string | null => {
  const there = MOVED.get(path);

  if (!there) {
    return null;
  }

  return path === "/book-of-shadows"
    ? `${REALMS}${there}${bookFragment(saved)}`
    : `${REALMS}${there}`;
};

const COPY = {
  en: {
    go: "go to Realms",
    sub: "It lives in the Book of Shadows on Realms now. Taking you there…",
    title: "This moved to Realms",
  },
  fr: {
    go: "aller sur Realms",
    sub: "Il vit désormais dans le Livre des ombres, sur Realms. On vous y emmène…",
    title: "Ce jeu a déménagé sur Realms",
  },
};

/** Sends the visitor on to `to` at once, with a link in case that fails. */
export const Moved = ({ to }: { to: string }) => {
  const t = useCopy(COPY);

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
