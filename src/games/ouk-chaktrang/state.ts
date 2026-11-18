import * as z from "zod/mini";
// zod's catch(): a schema that falls back to a value, named so it does not
// read as a Promise.
import { catch as withFallback } from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import { replay } from "./rules";
import type { Move } from "./rules";

/**
 * What Ouk Chaktrang keeps in this browser's localStorage, and nothing more:
 * the visitor's choices, and the game in progress against the bot and on one
 * screen, as the moves played. Nothing leaves the browser; online games live
 * on the server.
 */
export const SETTINGS_KEY = "minigames:ouk-chaktrang:settings:v1";

const GAME_KEYS = {
  bot: "minigames:ouk-chaktrang:bot:v1",
  local: "minigames:ouk-chaktrang:local:v1",
} as const;

export const settingsSchema = z.object({
  level: withFallback(z.enum(["easy", "medium", "hard"]), "medium"),
  mode: withFallback(z.enum(["bot", "local", "online"]), "bot"),
  /** The side the visitor plays against the bot */
  side: withFallback(z.enum(["white", "black"]), "white"),
  sound: withFallback(z.boolean(), true),
  theme: withFallback(z.enum(["matcha", "yeak-tevada"]), "matcha"),
});

export type Settings = z.infer<typeof settingsSchema>;

export type Mode = Settings["mode"];

const DEFAULTS: Settings = {
  level: "medium",
  mode: "bot",
  side: "white",
  sound: true,
  theme: "matcha",
};

export const loadSettings = (): Settings =>
  readStored(SETTINGS_KEY, settingsSchema, () => DEFAULTS);

export const saveSettings = (settings: Settings) =>
  writeStored(SETTINGS_KEY, settings);

const square = z.int().check(z.gte(0), z.lte(63));

/** A game long enough for any real one, short enough to keep storage small */
const MAX_MOVES = 1000;

const savedGame = z.object({
  moves: withFallback(
    z
      .array(z.object({ from: square, to: square }))
      .check(z.maxLength(MAX_MOVES)),
    []
  ),
});

/** The saved moves, or none when they do not make a game that can be played */
export const loadMoves = (mode: keyof typeof GAME_KEYS): Move[] => {
  const { moves } = readStored(GAME_KEYS[mode], savedGame, () => ({
    moves: [],
  }));

  return replay(moves) ? moves : [];
};

export const saveMoves = (
  mode: keyof typeof GAME_KEYS,
  moves: readonly Move[]
) => writeStored(GAME_KEYS[mode], { moves });
