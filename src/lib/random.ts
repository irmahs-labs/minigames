/**
 * A fair 0 ≤ n < 1 from the browser's crypto, for anything drawn by chance:
 * a tarot card, an 8 Ball answer, a spin. Shaped like Math.random, so the
 * rules that take it can be tested with fixed numbers.
 */
export const cryptoRandom = (): number =>
  (crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) / 2 ** 32;
