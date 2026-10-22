import type { Pool } from "pg";

import type { Brewer, LatestBrew } from "../src/games/booster-potion/api";
import type { Brewers } from "../src/games/booster-potion/brewing";
import type { SessionAccount } from "./session";

/** Who brewed what, as the shared recipe book shows it. */
export type BrewLog = ReadonlyMap<string, Brewers>;

export interface Recorded {
  /** Nobody had brewed it before this. */
  first: boolean;
  /** This player had not brewed it before. */
  isNew: boolean;
  brewers: Brewers;
}

interface BrewersRow {
  potion: string;
  by: string;
  count: number;
  yours: boolean;
}

// The first brewer is the earliest; two at the same instant go by id, so the
// name on a page never changes.
const BREWERS = `
  select potion,
         (array_agg(name order by brewed_at, user_id))[1] as by,
         count(*)::integer as count,
         coalesce(bool_or(user_id = $1::uuid), false) as yours
  from booster_potion_brews`;

const brewersOf = ({ by, count, yours }: BrewersRow): Brewers => ({
  by,
  count,
  yours,
});

/** Every potion someone has brewed, and whether `userId` is among them. */
export const readBrews = async (
  pool: Pool,
  userId: string | null
): Promise<BrewLog> => {
  const { rows } = await pool.query<BrewersRow>(`${BREWERS} group by potion`, [
    userId,
  ]);

  return new Map(rows.map((row) => [row.potion, brewersOf(row)]));
};

/**
 * Notes that `account` brewed `potion`. Brewing it again changes nothing:
 * the first brew is the one that counts.
 */
export const recordBrew = async (
  pool: Pool,
  potion: string,
  account: SessionAccount
): Promise<Recorded> => {
  // A repeat brew only moves last_brewed_at. xmax is 0 on a row this
  // statement inserted, and set on one it updated.
  const saved = await pool.query<{ inserted: boolean }>(
    `insert into booster_potion_brews (potion, user_id, name)
     values ($1, $2, $3)
     on conflict (potion, user_id) do update set last_brewed_at = now()
     returning (xmax = 0) as inserted`,
    [potion, account.id, account.name]
  );

  // The same as BREWERS for one potion, plus whether this player is first.
  const { rows } = await pool.query<BrewersRow & { first: boolean }>(
    `select potion,
            (array_agg(name order by brewed_at, user_id))[1] as by,
            count(*)::integer as count,
            bool_or(user_id = $1::uuid) as yours,
            (array_agg(user_id order by brewed_at, user_id))[1] = $1::uuid
              as first
     from booster_potion_brews
     where potion = $2
     group by potion`,
    [account.id, potion]
  );

  const [row] = rows;

  if (!row) {
    throw new Error(`The brew of ${potion} was not saved`);
  }

  const isNew = saved.rows[0]?.inserted ?? false;

  return { brewers: brewersOf(row), first: isNew && row.first, isNew };
};

/** The most recent brew by anyone, a repeat included, or null for none. */
export const readLatest = async (pool: Pool): Promise<LatestBrew | null> => {
  const { rows } = await pool.query<{ name: string; potion: string; at: Date }>(
    `select name, potion, last_brewed_at as at
     from booster_potion_brews
     order by last_brewed_at desc
     limit 1`
  );

  const [row] = rows;

  return row
    ? { at: row.at.toISOString(), name: row.name, potion: row.potion }
    : null;
};

/** Everyone who has brewed `potion`, first first. */
export const readBrewers = async (
  pool: Pool,
  potion: string
): Promise<Brewer[]> => {
  const { rows } = await pool.query<{ name: string; at: Date }>(
    `select name, brewed_at as at
     from booster_potion_brews
     where potion = $1
     order by brewed_at, user_id`,
    [potion]
  );

  return rows.map((row) => ({ at: row.at.toISOString(), name: row.name }));
};

/** When the player found each potion in their own book, by name. */
export const readSoloFinds = async (
  pool: Pool,
  userId: string
): Promise<ReadonlyMap<string, string>> => {
  const { rows } = await pool.query<{ potion: string; found_at: Date }>(
    `select potion, found_at
     from booster_potion_solo_brews
     where user_id = $1`,
    [userId]
  );

  return new Map(rows.map((row) => [row.potion, row.found_at.toISOString()]));
};

/**
 * Puts `potion` in the player's own book. Brewing it again changes nothing:
 * the page keeps the day it was first found.
 */
export const recordSoloBrew = async (
  pool: Pool,
  userId: string,
  potion: string
): Promise<{ isNew: boolean; foundAt: string }> => {
  const { rows } = await pool.query<{ found_at: Date; inserted: boolean }>(
    `insert into booster_potion_solo_brews (user_id, potion)
     values ($1, $2)
     on conflict (user_id, potion) do update set found_at = booster_potion_solo_brews.found_at
     returning found_at, (xmax = 0) as inserted`,
    [userId, potion]
  );

  const [row] = rows;

  if (!row) {
    throw new Error(`The solo brew of ${potion} was not saved`);
  }

  return { foundAt: row.found_at.toISOString(), isNew: row.inserted };
};

/** Empties the player's own book, to start over. */
export const resetSolo = async (pool: Pool, userId: string) => {
  await pool.query("delete from booster_potion_solo_brews where user_id = $1", [
    userId,
  ]);
};
