import { currentLanguage } from "../../../lib/language";
import { BUDDHIST_CALENDAR } from "./french/buddhist-calendar";
import { MOON } from "./french/moon";

/**
 * The Moon and the Buddhist calendar in French: their data is written in
 * English, as in the Book of Shadows they came from (now in Realms), and
 * each English line has its French here, one file per topic in french/. A
 * line shown on the page goes through `say`, which gives it in the page's
 * language; a line with no French shows in English.
 */
const FRENCH = new Map<string, string>([...MOON, ...BUDDHIST_CALENDAR]);

/** A line of the calendar's data in the page's language. */
export const say = (text: string): string =>
  currentLanguage() === "fr" ? (FRENCH.get(text) ?? text) : text;

/** Whether the page is in French, for the few lines built from parts. */
export const inFrench = () => currentLanguage() === "fr";

/** One of the page's own words, given in both languages where it is used. */
export const tr = (english: string, french: string): string =>
  inFrench() ? french : english;

/** A pair of words, English then French, in the page's language. */
export const pick = ([english, french]: readonly [string, string]): string =>
  tr(english, french);
