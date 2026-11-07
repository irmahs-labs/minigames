import { unpackPronunciations } from "./pronunciations";

/**
 * The dictionary, fetched and unpacked: only Spell Creator asks, so only it
 * loads it. Apart from pronunciations.ts, which vite.config.ts imports to pack
 * it and so must not import the module it makes.
 */
export const loadPronunciations = async () => {
  const { default: packed } = await import("virtual:pronunciations");

  return unpackPronunciations(packed);
};
