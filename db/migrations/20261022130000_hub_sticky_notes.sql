-- migrate:up
-- The sticky board on the hub page. Notes are anonymous to everyone who
-- reads them: user_id is kept only to hold each person to their notes a
-- day, and is never sent to the page. A note comes down a day after
-- posted_at; the server deletes it, user_id and all, within the hour after.
--
-- The hub is not a game, so its tables are named hub_*.
create table hub_sticky_notes (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  body text not null,
  -- One of COLOURS in src/board/rules.ts.
  colour text not null,
  posted_at timestamptz not null default now()
);

-- The board reads the last day's notes, and the sweep deletes older ones.
create index hub_sticky_notes_by_time on hub_sticky_notes (posted_at);

-- Counting one person's notes today.
create index hub_sticky_notes_by_poster on hub_sticky_notes (user_id, posted_at);

-- migrate:down
drop table hub_sticky_notes;
