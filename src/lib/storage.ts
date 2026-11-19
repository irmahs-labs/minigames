import type { ZodMiniType } from "zod/mini";

/**
 * The browser's localStorage, read and written so that a blocked or full
 * store (a private window, cleared site data) never breaks the page. What is
 * read goes through the caller's schema; anything missing or unreadable comes
 * back as the fallback, and a write that fails is dropped while the game plays
 * on from memory.
 */
export const readRaw = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const readStored = <T>(
  key: string,
  schema: ZodMiniType<T>,
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

/** Writes `value` as it is, for a key also read outside the app (index.html). */
export const writeRaw = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Nothing to do: the current session keeps its state in memory.
  }
};

export const writeStored = <T>(key: string, value: T): void =>
  writeRaw(key, JSON.stringify(value));
