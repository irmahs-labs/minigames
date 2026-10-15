import * as z from "zod/mini";
// zod's catch(): a schema that falls back to a value, named so it does not read
// as a Promise.
import { catch as withFallback } from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import { EXAMPLES } from "./examples";
import type { ExampleId } from "./examples";

export const STORAGE_KEY = "minigames:wheel-of-fortune:v1";

export const MIN_SLOTS = 2;
export const MAX_SLOTS = 16;
export const MAX_LABEL = 40;
export const MAX_WHEELS = 8;
export const MAX_NAME = 24;
const BLANK_SLOTS = 4;

const clip = (max: number) =>
  z.pipe(
    z.string(),
    z.transform((text: string) => text.slice(0, max))
  );

const blankSlots = () => Array.from({ length: BLANK_SLOTS }, () => "");

const wheelSchema = z.object({
  id: z.string().check(z.minLength(1)),
  name: withFallback(clip(MAX_NAME), "Wheel"),
  // A damaged slot list empties that one wheel, never the others.
  slots: withFallback(
    z
      .array(clip(MAX_LABEL))
      .check(z.minLength(MIN_SLOTS), z.maxLength(MAX_SLOTS)),
    blankSlots
  ),
});

/** One of the visitor's wheels: a tab with its own name and slots. */
export type Wheel = z.infer<typeof wheelSchema>;

const firstWheel = (): Wheel => ({
  id: crypto.randomUUID(),
  name: "Wheel 1",
  slots: blankSlots(),
});

/**
 * Everything the Wheel of Fortune remembers, kept in this browser's
 * localStorage: the visitor's wheels, which one is open, and whether the
 * landing beep plays. Nothing leaves the browser.
 */
export const wheelStateSchema = z.object({
  selected: withFallback(z.string(), ""),
  sound: withFallback(z.boolean(), true),
  wheels: withFallback(
    z.array(wheelSchema).check(z.minLength(1), z.maxLength(MAX_WHEELS)),
    () => [firstWheel()]
  ),
});

export type WheelState = z.infer<typeof wheelStateSchema>;

export const defaultState = (): WheelState => {
  const wheel = firstWheel();

  return { selected: wheel.id, sound: true, wheels: [wheel] };
};

export const loadState = (): WheelState =>
  readStored(STORAGE_KEY, wheelStateSchema, defaultState);

export const saveState = (state: WheelState) => writeStored(STORAGE_KEY, state);

/** The open wheel; an unknown selection opens the first one. */
export const currentWheel = (state: WheelState): Wheel =>
  state.wheels.find((wheel) => wheel.id === state.selected) ??
  state.wheels[0] ??
  firstWheel();

/** The slots that have a name, trimmed, in wheel order: what gets spun. */
export const namedSlices = (slots: readonly string[]): string[] =>
  slots.flatMap((slot) => {
    const name = slot.trim();

    return name.length > 0 ? [name] : [];
  });

/**
 * Each slot's place among the named slots, or -1 for an empty one: maps a
 * slot to its slice on the wheel, and the slice that won back to its slot.
 */
export const namedPositions = (slots: readonly string[]): number[] => {
  const positions: number[] = [];
  let next = 0;

  for (const slot of slots) {
    const named = slot.trim().length > 0;

    positions.push(named ? next : -1);
    next += named ? 1 : 0;
  }

  return positions;
};

/** "Wheel N" with the smallest N no wheel is called yet. */
const nextWheelName = (wheels: readonly Wheel[]): string => {
  const taken = new Set(wheels.map((wheel) => wheel.name));
  let n = 1;

  while (taken.has(`Wheel ${n}`)) {
    n += 1;
  }

  return `Wheel ${n}`;
};

export type WheelAction =
  | { type: "select"; id: string }
  | { type: "create"; id: string }
  | { type: "renameWheel"; name: string }
  | { type: "deleteWheel" }
  | { type: "rename"; index: number; label: string }
  | { type: "add" }
  | { type: "remove"; index: number }
  | { type: "fill"; example: ExampleId }
  | { type: "reset" }
  | { type: "sound"; on: boolean };

/** Takes a slot out, or empties it when the wheel is down to its minimum. */
const withoutSlot = (slots: string[], index: number): string[] =>
  slots.length > MIN_SLOTS
    ? slots.toSpliced(index, 1)
    : slots.map((slot, i) => (i === index ? "" : slot));

const editWheel = (
  state: WheelState,
  edit: (wheel: Wheel) => Wheel
): WheelState => {
  const { id } = currentWheel(state);

  return {
    ...state,
    wheels: state.wheels.map((wheel) =>
      wheel.id === id ? edit(wheel) : wheel
    ),
  };
};

const editSlots = (
  state: WheelState,
  edit: (slots: string[]) => string[]
): WheelState =>
  editWheel(state, (wheel) => ({ ...wheel, slots: edit(wheel.slots) }));

export const reducer = (state: WheelState, action: WheelAction): WheelState => {
  switch (action.type) {
    case "select": {
      return { ...state, selected: action.id };
    }

    case "create": {
      if (state.wheels.length >= MAX_WHEELS) {
        return state;
      }

      const wheel = {
        id: action.id,
        name: nextWheelName(state.wheels),
        slots: blankSlots(),
      };

      return { ...state, selected: wheel.id, wheels: [...state.wheels, wheel] };
    }

    case "renameWheel": {
      return editWheel(state, (wheel) => ({
        ...wheel,
        name: action.name.slice(0, MAX_NAME),
      }));
    }

    case "deleteWheel": {
      if (state.wheels.length <= 1) {
        return state;
      }

      // The tab before the deleted one opens, or the next if it was first.
      const index = state.wheels.indexOf(currentWheel(state));
      const wheels = state.wheels.toSpliced(index, 1);
      const open = wheels[Math.max(0, index - 1)] ?? wheels[0];

      return { ...state, selected: open?.id ?? "", wheels };
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

    case "fill": {
      return editSlots(state, () => [...EXAMPLES[action.example].slices]);
    }

    case "reset": {
      return editSlots(state, blankSlots);
    }

    case "sound": {
      return { ...state, sound: action.on };
    }

    default: {
      return state;
    }
  }
};
