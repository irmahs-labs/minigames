import type { ZodType } from "zod";

/**
 * The browser's localStorage, read and written so that a blocked or full
 * store (a private window, cleared site data) never breaks the page. What is
 * read goes through the caller's schema; anything missing or unreadable comes
 * back as the fallback, and a write that fails is dropped while the game plays
 * on from memory.
 */
const readRaw = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const readStored = <T>(
  key: string,
  schema: ZodType<T>,
  fallback: () => T
): T => {
  const raw = readRaw(key);

  if (raw === null) {
    return fallback();
  }

  try {
    const result = schema.safeParse(JSON.parse(raw));

    return result.success ? result.data : fallback();
  } catch {
    return fallback();
  }
};

export const writeStored = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing to do: the current session keeps its state in memory.
  }
};
