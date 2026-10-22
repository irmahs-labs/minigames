/**
 * The sticky board on the hub: anyone signed in can stick a note on it, no
 * name is ever shown, and every note comes down a day after it went up.
 * These rules are shared by the page and the server, which checks every
 * note again before it goes up.
 */

/** The colours a note comes in, as the CSS names them (`.sticky--lemon`). */
export const COLOURS = [
  "lemon",
  "matcha",
  "strawberry",
  "taro",
  "blue",
  "white",
] as const;

export type Colour = (typeof COLOURS)[number];

/** A thumbs up, a thumbs down, or neither. */
export type Vote = -1 | 0 | 1;

/** The longest a note can be, in characters. */
export const MAX_LENGTH = 200;

/** How many notes one person can stick in a day. */
export const NOTES_PER_DAY = 5;

/** How long a note stays up. */
export const LIFETIME_MS = 24 * 60 * 60 * 1000;

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const CONTROL = /\p{Cc}/u;

/**
 * A note as it goes up: trimmed, with Windows line ends made plain, no
 * control characters, and never more than one blank line in a row.
 */
export const tidy = (body: string) =>
  [...body.replaceAll("\r\n", "\n")]
    .filter((char) => char === "\n" || !CONTROL.test(char))
    .join("")
    .replaceAll(/\n{3,}/gu, "\n\n")
    .trim();

/** How long a note is, counting an emoji as one character. */
export const lengthOf = (body: string) => [...body].length;

/** Whether a tidied note can go up: something on it, and not too much. */
export const isValidBody = (body: string) => {
  const length = lengthOf(body);

  return length > 0 && length <= MAX_LENGTH;
};

/** When a note posted at `postedAt` comes down: "gone in 5h", "gone in 40 min". */
export const goneIn = (postedAt: string, now: number) => {
  const left = Date.parse(postedAt) + LIFETIME_MS - now;

  if (left >= HOUR_MS) {
    return `gone in ${Math.floor(left / HOUR_MS)}h`;
  }

  if (left >= MINUTE_MS) {
    return `gone in ${Math.floor(left / MINUTE_MS)} min`;
  }

  return "gone in a moment";
};
