import type { ZodMiniType } from "zod/mini";

import { book, brewAnswer, brewers, soloBook, soloBrewAnswer } from "./api";
import type { Book, Brewer, SoloPage } from "./api";
import type { Selection } from "./rules";

/** The shared recipe book, or null when the server cannot be reached. */
export const fetchBook = async (): Promise<Book | null> => {
  try {
    const response = await fetch("/api/potions");

    if (!response.ok) {
      return null;
    }

    const parsed = book.safeParse(await response.json());

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export type Sent<T> = { ok: true; answer: T } | { ok: false; message: string };

/** Sends what is in the cauldron to `path` to be brewed, and what came of it. */
const sendBrew = async <T>(
  path: string,
  selection: Selection,
  schema: ZodMiniType<T>
): Promise<Sent<T>> => {
  try {
    const response = await fetch(path, {
      body: JSON.stringify({ ingredients: selection }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      // The server says why in a sentence: sign in, slow down, and the like.
      const message = await response.text();

      return { message: message || "The brew didn't go through.", ok: false };
    }

    const parsed = schema.safeParse(await response.json());

    return parsed.success
      ? { answer: parsed.data, ok: true }
      : { message: "The cauldron's answer made no sense.", ok: false };
  } catch {
    return { message: "The cauldron can't be reached right now.", ok: false };
  }
};

/** Brews for the shared book. */
export const postBrew = (selection: Selection) =>
  sendBrew("/api/potions/brew", selection, brewAnswer);

/** Brews for the player's own book. */
export const postSoloBrew = (selection: Selection) =>
  sendBrew("/api/potions/solo/brew", selection, soloBrewAnswer);

/** The player's own book, or null when it cannot be had. */
export const fetchSoloBook = async (): Promise<SoloPage[] | null> => {
  try {
    const response = await fetch("/api/potions/solo");

    if (!response.ok) {
      return null;
    }

    const parsed = soloBook.safeParse(await response.json());

    return parsed.success ? parsed.data.pages : null;
  } catch {
    return null;
  }
};

/** Empties the player's own book; false when it did not happen. */
export const resetSoloBook = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/potions/solo", { method: "DELETE" });

    return response.ok;
  } catch {
    return false;
  }
};

/** Everyone who brewed a potion, first first; null when it cannot be had. */
export const fetchBrewers = async (
  potion: string
): Promise<Brewer[] | null> => {
  try {
    const query = new URLSearchParams({ potion });
    const response = await fetch(`/api/potions/brewers?${query}`);

    if (!response.ok) {
      return null;
    }

    const parsed = brewers.safeParse(await response.json());

    return parsed.success ? parsed.data.brewers : null;
  } catch {
    return null;
  }
};
