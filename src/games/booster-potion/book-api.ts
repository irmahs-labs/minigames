import { book, brewAnswer, brewers } from "./api";
import type { Book, BrewAnswer, Brewer } from "./api";
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

export type BrewResult =
  | { ok: true; answer: BrewAnswer }
  | { ok: false; message: string };

/** Sends what is in the cauldron to be brewed, and what came of it. */
export const postBrew = async (selection: Selection): Promise<BrewResult> => {
  try {
    const response = await fetch("/api/potions/brew", {
      body: JSON.stringify({ ingredients: selection }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      // The server says why in a sentence: sign in, slow down, and the like.
      const message = await response.text();

      return { message: message || "The brew didn't go through.", ok: false };
    }

    const parsed = brewAnswer.safeParse(await response.json());

    return parsed.success
      ? { answer: parsed.data, ok: true }
      : { message: "The cauldron's answer made no sense.", ok: false };
  } catch {
    return { message: "The cauldron can't be reached right now.", ok: false };
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
