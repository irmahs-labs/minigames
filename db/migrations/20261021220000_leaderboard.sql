-- migrate:up
-- The Super Tic-Tac-Toe leaderboard: every finished online game, and each
-- player's running total.
--
-- user_id is the account's id from the irmahs.dev account service
-- (irmahs-labs/auth), a UUID. Accounts live in that service's own database,
-- so no foreign key reaches them from here; the server takes the id from the
-- signed-in session and nowhere else.

-- One row per player who has finished a game. points never goes below 0: a
-- defeat that would take it under stops at 0.
create table players (
  user_id uuid primary key,
  -- As shown to everyone: first name and last initial, "Irma H.". Updated
  -- with every game, so a renamed account shows its new name.
  name text not null,
  points integer not null default 0 check (points >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  draws integer not null default 0 check (draws >= 0),
  updated_at timestamptz not null default now()
);

create index players_by_points on players (points desc, wins desc);

-- Every finished game with what it was worth, so the totals can be
-- recomputed if the points ever change.
create table games (
  id uuid primary key default gen_random_uuid(),
  pink_id uuid not null,
  purple_id uuid not null check (purple_id <> pink_id),
  -- null for a draw.
  winner text check (winner in ('pink', 'purple')),
  -- line: three planets in a row; full: every planet closed with no line;
  -- timeout: the player to move let the room's five-minute clock run out.
  ending text not null check (ending in ('line', 'full', 'timeout')),
  moves jsonb not null,
  pink_points integer not null,
  purple_points integer not null,
  finished_at timestamptz not null default now()
);

-- migrate:down
drop table games;
drop table players;
