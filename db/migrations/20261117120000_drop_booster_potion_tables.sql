-- migrate:up
-- Booster Potion moved to Realms as Potion Brewing on 2026-11-16, and its
-- recipe books were copied there by Realms' scripts/import-potions.sh.
-- Nothing here reads these tables any more.
drop table booster_potion_solo_brews;
drop table booster_potion_brews;

-- migrate:down
-- The tables as they were, empty: the rows went to Realms and aren't kept
-- here.
create table booster_potion_brews (
  potion text not null,
  user_id uuid not null,
  name text not null,
  brewed_at timestamptz not null default now(),
  last_brewed_at timestamptz not null default now(),
  primary key (potion, user_id)
);

create index booster_potion_brews_by_last on booster_potion_brews (last_brewed_at desc);

create table booster_potion_solo_brews (
  user_id uuid not null,
  potion text not null,
  found_at timestamptz not null default now(),
  primary key (user_id, potion)
);
