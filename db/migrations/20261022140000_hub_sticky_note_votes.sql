-- migrate:up
-- Thumbs up and down on the hub's sticky notes: one vote per person per
-- note, +1 or -1; taking a vote back deletes its row. Votes are anonymous
-- like the notes: the page gets only the counts and the reader's own vote.
-- A vote goes when its note does, swept a day after it went up or taken
-- down by an admin.
create table hub_sticky_note_votes (
  note_id bigint not null references hub_sticky_notes (id) on delete cascade,
  user_id uuid not null,
  vote smallint not null check (vote in (-1, 1)),
  primary key (note_id, user_id)
);

-- migrate:down
drop table hub_sticky_note_votes;
