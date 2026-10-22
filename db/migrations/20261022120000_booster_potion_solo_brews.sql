-- migrate:up
-- Booster Potion played solo: each player's own recipe book, kept on their
-- account rather than in one browser. A player's solo finds are theirs
-- alone; the shared book is booster_potion_brews. Starting over deletes a
-- player's rows.
--
-- potion is the recipe's name in src/games/booster-potion/recipes.ts, and
-- user_id the account's id from the irmahs.dev account service, as in
-- booster_potion_brews.
create table booster_potion_solo_brews (
  user_id uuid not null,
  potion text not null,
  -- When they first brewed it, shown on the page.
  found_at timestamptz not null default now(),
  primary key (user_id, potion)
);

-- migrate:down
drop table booster_potion_solo_brews;
