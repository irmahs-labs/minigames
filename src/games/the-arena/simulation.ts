import { DAY, NIGHT, OPENING, isDeadly, victimsOf } from "./events";
import type { Template } from "./events";

/**
 * The games, played out from the cast to the victor. Day 1, Night 1, Day 2,
 * Night 2…: in each, everyone still standing does one thing, alone or with
 * one or two others, and some don't live through it. Every day takes at
 * least one life, so the games always end: with one victor, or, when
 * district-mates may win together, with the last ones standing all from one
 * district.
 */

export interface Contestant {
  id: string;
  name: string;
  /** From 1 to 12. */
  district: number;
}

export interface Rules {
  /** The last ones standing win together when they all come from one district. */
  together: boolean;
}

/** One thing that happened: a template and who filled its places, by id. */
export interface Happening {
  template: Template;
  who: readonly string[];
}

export interface Phase {
  kind: "day" | "night";
  /** Day 1, Night 1, Day 2… */
  number: number;
  happenings: Happening[];
  /** Who died in it, by id, in the order they fell. */
  fallen: string[];
}

export interface Games {
  phases: Phase[];
  /** Who won, by id: one, or district-mates who won together. */
  victors: string[];
  /** Each contestant's kills, by id. */
  kills: Record<string, number>;
  /** Everyone who fell, by id, first to fall first. */
  fallen: string[];
}

/** A number from 0 to 1, 1 left out, like Math.random. */
export type Random = () => number;

/** A whole number from 0 to `below`, `below` left out. */
const pick = (random: Random, below: number) =>
  Math.min(below - 1, Math.floor(random() * below));

/** The items in a random order: each drawn a random number, then sorted by it. */
const shuffle = <T>(items: readonly T[], random: Random): T[] =>
  items
    .map((item) => ({ item, key: random() }))
    .toSorted((a, b) => a.key - b.key)
    .map(({ item }) => item);

/** Whether the games are over: one left, or the last ones all district-mates. */
export const isOver = (alive: readonly Contestant[], rules: Rules) =>
  alive.length <= 1 ||
  (rules.together && new Set(alive.map((one) => one.district)).size === 1);

/**
 * How many die in a phase: on the first day, up to a third; on a later day
 * at least one, up to a quarter; at night none to a fifth. The longer the
 * games go on, the deadlier they get, and someone is always left standing.
 */
const deathsFor = (
  kind: Phase["kind"],
  number: number,
  standing: number,
  random: Random
) => {
  const most = standing - 1;
  const urgency = Math.max(0, number - 6);
  let deaths = 0;

  if (kind === "day" && number === 1) {
    deaths = 1 + pick(random, Math.max(1, Math.ceil(standing / 3)));
  } else if (kind === "day") {
    deaths = 1 + pick(random, Math.max(1, Math.ceil(standing / 4))) + urgency;
  } else {
    deaths = pick(random, Math.ceil(standing / 5) + 1) + urgency;
  }

  return Math.max(0, Math.min(most, deaths));
};

/**
 * The next one to fill a place: for a victim, someone not from the
 * killers' district when there is anyone, so allies turn on each other last.
 */
const takeFrom = (
  waiting: Contestant[],
  avoid: ReadonlySet<number>
): Contestant | undefined => {
  const index = waiting.findIndex((one) => !avoid.has(one.district));
  const at = index === -1 ? 0 : index;
  const [taken] = waiting.splice(at, 1);

  return taken;
};

/** Fills a template's places from those waiting: killers first, then their victims. */
const fill = (template: Template, waiting: Contestant[]): Contestant[] => {
  const victims = new Set(victimsOf(template));
  const killers = new Set(template.kills.map(([killer]) => killer));

  const places: (Contestant | undefined)[] = Array.from({
    length: template.size,
  });

  const districts = new Set<number>();

  // Those who aren't victims first, so a victim can be chosen to suit them.
  const order = Array.from({ length: template.size }, (_, i) => i).toSorted(
    (a, b) => Number(victims.has(a)) - Number(victims.has(b))
  );

  for (const place of order) {
    const one = takeFrom(waiting, victims.has(place) ? districts : new Set());

    places[place] = one;

    if (one && killers.has(place)) {
      districts.add(one.district);
    }
  }

  return places.filter((one): one is Contestant => one !== undefined);
};

/** A template from `pool` that fits: deadly or not, at most `room` places, killing at most `deaths`. */
const templateFor = (
  pool: readonly Template[],
  deadly: boolean,
  room: number,
  deaths: number,
  random: Random
): Template | undefined => {
  const fitting = pool.filter(
    (template) =>
      isDeadly(template) === deadly &&
      template.size <= room &&
      victimsOf(template).length <= deaths
  );

  // Alone more often than in company.
  const weighted = fitting.flatMap((template) =>
    Array.from({ length: 4 - template.size }, () => template)
  );

  return weighted[pick(random, weighted.length)];
};

/** A phase: who is standing, what each of them does, and who falls. */
export const playPhase = (
  kind: Phase["kind"],
  number: number,
  standing: readonly Contestant[],
  random: Random
): Phase => {
  let pool = NIGHT;

  if (kind === "day") {
    pool = number === 1 ? OPENING : DAY;
  }

  const waiting = shuffle(standing, random);
  let deaths = deathsFor(kind, number, standing.length, random);
  const happenings: Happening[] = [];
  const fallen: string[] = [];

  while (waiting.length > 0) {
    // Spread the deaths over the phase rather than all at its start, and
    // while one is still due keep someone back for it, so none is skipped.
    const deadlyNow =
      deaths > 0 &&
      (waiting.length === 1 || pick(random, waiting.length) < deaths * 2);

    const room = deaths > 0 ? waiting.length - 1 : waiting.length;

    const template =
      (deadlyNow && templateFor(pool, true, waiting.length, deaths, random)) ||
      templateFor(pool, false, room, 0, random) ||
      templateFor(pool, true, waiting.length, deaths, random);

    if (!template) {
      break;
    }

    const who = fill(template, waiting);

    for (const place of victimsOf(template)) {
      const victim = who[place];

      if (victim) {
        fallen.push(victim.id);
      }
    }

    deaths -= victimsOf(template).length;
    happenings.push({ template, who: who.map((one) => one.id) });
  }

  return { fallen, happenings, kind, number };
};

/** The most phases the games can take: a safeguard, never reached in play. */
const MOST_PHASES = 400;

/** The games from start to finish, with `random` for every draw. */
export const simulate = (
  cast: readonly Contestant[],
  rules: Rules,
  random: Random
): Games => {
  let standing = [...cast];
  const phases: Phase[] = [];
  const kills: Record<string, number> = {};
  const fallen: string[] = [];

  while (!isOver(standing, rules) && phases.length < MOST_PHASES) {
    const kind = phases.length % 2 === 0 ? "day" : "night";
    const number = Math.floor(phases.length / 2) + 1;
    const phase = playPhase(kind, number, standing, random);

    for (const { template, who } of phase.happenings) {
      for (const [killer] of template.kills) {
        const id = who[killer];

        if (id) {
          kills[id] = (kills[id] ?? 0) + 1;
        }
      }
    }

    const dead = new Set(phase.fallen);

    fallen.push(...phase.fallen);
    standing = standing.filter((one) => !dead.has(one.id));
    phases.push(phase);
  }

  return { fallen, kills, phases, victors: standing.map((one) => one.id) };
};
