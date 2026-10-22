import type { Pool } from "pg";

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
  from potion_brews`;

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
  const inserted = await pool.query(
    `insert into potion_brews (potion, user_id, name)
     values ($1, $2, $3)
     on conflict (potion, user_id) do nothing`,
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
     from potion_brews
     where potion = $2
     group by potion`,
    [account.id, potion]
  );

  const [row] = rows;

  if (!row) {
    throw new Error(`The brew of ${potion} was not saved`);
  }

  const isNew = inserted.rowCount === 1;

  return { brewers: brewersOf(row), first: isNew && row.first, isNew };
};
