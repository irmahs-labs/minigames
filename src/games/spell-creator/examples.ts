import type { Tier } from "./spell";

/** A spell for each tier, to try from the tier list; the tests cast them all. */
export const EXAMPLES: Readonly<Record<Tier, string>> = {
  A: "Make it easy, make it quick. Open up without a kick.\nSpeak no words will cause a fright, what’s a bark without a bite!",
  B: "Prick the finger, prick it deep. Send my enemy off to sleep.\nMagic spindle, do not linger. Make my victim prick a finger.",
  C: "I believe I can fly, I believe that pigs can fly.",
  D: "Silver candle, shining bright, guide me on my midnight ride.",
  E: "Silver candle, shining bright, guide me home and keep me safe on my long midnight ride.",
  F: "Silver candle, shining bright, guide me safely home to bed.",
  S: "Double, double, toil and trouble, cauldron burst with brilliant bubbles.\nThe strength of evil is good as none, when stands before four hearts of one.",
};
