-- migrate:up
-- Booster Potion's shared recipe book: who has brewed each potion. The first
-- to brew one has their name on its page for everyone; everyone after is
-- counted.
--
-- potion is the recipe's name in src/games/booster-potion/recipes.ts, so a
-- renamed recipe starts again with nobody having brewed it. user_id is the
-- account's id from the irmahs.dev account service, as in Super Tic-Tac-Toe's
-- tables.
create table booster_potion_brews (
  potion text not null,
  user_id uuid not null,
  -- As shown to everyone, "Irma H.", as it was when they brewed it.
  name text not null,
  -- The first time they brewed it, which decides who was first.
  brewed_at timestamptz not null default now(),
  -- The latest time they brewed it, for the book's "last brew".
  last_brewed_at timestamptz not null default now(),
  primary key (potion, user_id)
);

create index booster_potion_brews_by_last on booster_potion_brews (last_brewed_at desc);

-- migrate:down
drop table booster_potion_brews;
