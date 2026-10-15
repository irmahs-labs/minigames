// oxlint-disable promise/prefer-await-to-then -- zod's .catch() sets a
// schema's fallback value; nothing in this file is a Promise.
import { z } from "zod";

import { readStored, writeStored } from "../../lib/storage";
import { DEFAULT_WHEEL, PRESETS, WHEEL_IDS } from "./presets";
import type { WheelId } from "./presets";

export const STORAGE_KEY = "minigames:wheel-of-fortune:v1";

export const MIN_SLOTS = 2;
export const MAX_SLOTS = 16;
export const MAX_LABEL = 40;

const presetSlices = (id: WheelId) => [...PRESETS[id].slices];

/** One wheel's slots; a damaged list falls back to that wheel's preset. */
const slotsSchema = (id: WheelId) =>
  z
    .array(z.string().transform((slot) => slot.slice(0, MAX_LABEL)))
    .min(MIN_SLOTS)
    .max(MAX_SLOTS)
    .catch(() => presetSlices(id));

/**
 * Everything the Wheel of Fortune remembers, kept in this browser's
 * localStorage: which wheel is picked, every wheel's slots as edited, and
 * whether the landing beep plays. Nothing leaves the browser.
 *
 * Each part falls back to its default on its own, so one damaged wheel never
 * wipes the others, and parsing an empty object gives the starting state.
 */
export const wheelStateSchema = z.object({
  selected: z.enum(WHEEL_IDS).catch(DEFAULT_WHEEL),
  sound: z.boolean().catch(true),
  wheels: z
    .object({
      blank: slotsSchema("blank"),
      death: slotsSchema("death"),
      luck: slotsSchema("luck"),
      promotion: slotsSchema("promotion"),
    })
    .catch(() => ({
      blank: presetSlices("blank"),
      death: presetSlices("death"),
      luck: presetSlices("luck"),
      promotion: presetSlices("promotion"),
    })),
});

export type WheelState = z.infer<typeof wheelStateSchema>;

export const defaultState = (): WheelState => wheelStateSchema.parse({});

export const loadState = (): WheelState =>
  readStored(STORAGE_KEY, wheelStateSchema, defaultState);

export const saveState = (state: WheelState) => writeStored(STORAGE_KEY, state);

/** The slots that have a name, trimmed, in wheel order: what gets spun. */
export const namedSlices = (slots: readonly string[]): string[] =>
  slots.flatMap((slot) => {
    const name = slot.trim();

    return name.length > 0 ? [name] : [];
  });

export type WheelAction =
  | { type: "select"; wheel: WheelId }
  | { type: "rename"; index: number; label: string }
  | { type: "add" }
  | { type: "remove"; index: number }
  | { type: "removeLabel"; label: string }
  | { type: "reset" }
  | { type: "sound"; on: boolean };

/** Takes a slot out, or empties it when the wheel is down to its minimum. */
const withoutSlot = (slots: string[], index: number): string[] =>
  slots.length > MIN_SLOTS
    ? slots.filter((_, i) => i !== index)
    : slots.map((slot, i) => (i === index ? "" : slot));

const editSlots = (
  state: WheelState,
  edit: (slots: string[]) => string[]
): WheelState => ({
  ...state,
  wheels: {
    ...state.wheels,
    [state.selected]: edit(state.wheels[state.selected]),
  },
});

export const reducer = (state: WheelState, action: WheelAction): WheelState => {
  switch (action.type) {
    case "select": {
      return { ...state, selected: action.wheel };
    }

    case "rename": {
      return editSlots(state, (slots) =>
        slots.map((slot, i) =>
          i === action.index ? action.label.slice(0, MAX_LABEL) : slot
        )
      );
    }

    case "add": {
      return editSlots(state, (slots) =>
        slots.length >= MAX_SLOTS ? slots : [...slots, ""]
      );
    }

    case "remove": {
      return editSlots(state, (slots) => withoutSlot(slots, action.index));
    }

    case "removeLabel": {
      return editSlots(state, (slots) => {
        const index = slots.findIndex((slot) => slot.trim() === action.label);

        return index === -1 ? slots : withoutSlot(slots, index);
      });
    }

    case "reset": {
      return editSlots(state, () => presetSlices(state.selected));
    }

    case "sound": {
      return { ...state, sound: action.on };
    }

    default: {
      return state;
    }
  }
};
