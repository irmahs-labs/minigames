import * as z from "zod/mini";
// zod's catch(): a schema that falls back to a value, named so it does not read
// as a Promise.
import { catch as withFallback } from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import { RECIPES } from "./pantry";

export const STORAGE_KEY = "minigames:booster-potion:v1";

/**
 * The potions found so far, kept in this browser's localStorage by name, in
 * the order they were found. Nothing leaves the browser.
 */
export const savedSchema = z.object({
  found: withFallback(z.array(z.string()), []),
});

/** The saved potions that are still in the recipe book, each once. */
export const loadFound = (): string[] => {
  const { found } = readStored(STORAGE_KEY, savedSchema, () => ({
    found: [],
  }));

  return [...new Set(found)].filter((name) =>
    RECIPES.some((recipe) => recipe.name === name)
  );
};

export const saveFound = (found: readonly string[]) =>
  writeStored(STORAGE_KEY, { found });
