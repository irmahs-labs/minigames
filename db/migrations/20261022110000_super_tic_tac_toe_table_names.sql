-- migrate:up
-- Every table is named after its game, now that the database holds more than
-- one: Super Tic-Tac-Toe's leaderboard tables take the game's name, and so do
-- their indexes. Their check constraints keep the names Postgres gave them.
alter table players rename to super_tic_tac_toe_players;
alter index players_pkey rename to super_tic_tac_toe_players_pkey;
alter index players_by_points rename to super_tic_tac_toe_players_by_points;

alter table games rename to super_tic_tac_toe_games;
alter index games_pkey rename to super_tic_tac_toe_games_pkey;

-- migrate:down
alter index super_tic_tac_toe_games_pkey rename to games_pkey;
alter table super_tic_tac_toe_games rename to games;

alter index super_tic_tac_toe_players_by_points rename to players_by_points;
alter index super_tic_tac_toe_players_pkey rename to players_pkey;
alter table super_tic_tac_toe_players rename to players;
