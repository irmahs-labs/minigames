import { currentLanguage } from "../../lib/language";
import { BUDDHIST_CALENDAR } from "./french/buddhist-calendar";
import { COMPAT } from "./french/compat";
import { EIGHT_BALL } from "./french/eight-ball";
import { LUNAR_ZODIAC } from "./french/lunar-zodiac";
import { MOON } from "./french/moon";
import { NUMEROLOGY } from "./french/numerology";
import { PROFILE } from "./french/profile";
import { RETROGRADE_LORE } from "./french/retrograde-lore";
import { SABBATS } from "./french/sabbats";
import { SKY } from "./french/sky";
import { TAROT } from "./french/tarot";
import { ZODIAC } from "./french/zodiac";

/**
 * The book in French. The book's data is written in English (the tarot, the
 * signs, the sabbats, the lore), and each English line has its French here,
 * one file per topic in french/. A line shown on the page goes through
 * `say`, which gives it in the page's language; a line with no French
 * shows in English.
 */
const FRENCH = new Map<string, string>([
  ...TAROT,
  ...LUNAR_ZODIAC,
  ...COMPAT,
  ...PROFILE,
  ...EIGHT_BALL,
  ...SKY,
  ...SABBATS,
  ...MOON,
  ...ZODIAC,
  ...NUMEROLOGY,
  ...RETROGRADE_LORE,
  ...BUDDHIST_CALENDAR,
]);

/** A line of the book in the page's language. */
export const say = (text: string): string =>
  currentLanguage() === "fr" ? (FRENCH.get(text) ?? text) : text;

/** Whether the page is in French, for the few lines built from parts. */
export const inFrench = () => currentLanguage() === "fr";
