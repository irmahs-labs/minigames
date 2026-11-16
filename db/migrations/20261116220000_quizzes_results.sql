-- migrate:up
-- A signed-in visitor's last result of a quiz that shows on a profile
-- elsewhere on irmahs.dev: the witch quiz's on their Book of Shadows on
-- Realms. One row per person and quiz; a retake replaces it, and they can
-- take it off. Quizzes without a profile never come here: their results
-- stay in the browser. Named after the Quizzes game's slug.
create table quizzes_results (
  user_id uuid not null,
  -- The quiz's slug, as at /quizzes/<slug>.
  quiz text not null,
  -- Points per result id, as the quiz's answers added them up.
  scores jsonb not null,
  taken_at timestamptz not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, quiz)
);

-- migrate:down
drop table quizzes_results;
