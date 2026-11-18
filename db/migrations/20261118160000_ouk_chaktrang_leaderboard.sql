-- migrate:up
-- The Ouk Chaktrang leaderboard: every finished online game, and each
-- player's running total. Like Super Tic-Tac-Toe's: user_id is the account's
-- id from the irmahs.dev account service, taken from the signed-in session.

-- One row per player who has finished a game. points never goes below 0.
create table ouk_chaktrang_players (
  user_id uuid primary key,
  -- As shown to everyone: first name and last initial, "Irma H."
  name text not null,
  points integer not null default 0 check (points >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  draws integer not null default 0 check (draws >= 0),
  updated_at timestamptz not null default now()
);

create index ouk_chaktrang_players_by_points
  on ouk_chaktrang_players (points desc, wins desc);

-- Every finished game with what it was worth, so the totals can be
-- recomputed if the points ever change. White (the Tevada) moves first.
create table ouk_chaktrang_games (
  id uuid primary key default gen_random_uuid(),
  white_id uuid not null,
  black_id uuid not null check (black_id <> white_id),
  -- null for a draw.
  winner text check (winner in ('white', 'black')),
  -- checkmate; stalemate, the count run out or two lone Khun: draws;
  -- timeout: the player to move let the room's five-minute clock run out.
  ending text not null check (
    ending in ('checkmate', 'stalemate', 'count', 'kings', 'timeout')
  ),
  moves jsonb not null,
  white_points integer not null,
  black_points integer not null,
  finished_at timestamptz not null default now()
);

-- migrate:down
drop table ouk_chaktrang_games;
drop table ouk_chaktrang_players;
