import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";

import { signInUrl } from "../lib/account";
import { useConfirm } from "../lib/use-confirm";
import type { Board } from "./api";
import { fetchBoard, stickNote, takeDownNote, voteOnNote } from "./board-api";
import { Corkboard } from "./corkboard";
import {
  COLOURS,
  LIFETIME_MS,
  MAX_LENGTH,
  isValidBody,
  lengthOf,
  tidy,
} from "./rules";
import type { Colour, Vote } from "./rules";

/** Others stick notes too: the board is fetched again this often while in view. */
const REFRESH_MS = 30_000;

const COLOUR_NAMES = {
  blue: "Blue",
  lemon: "Lemon",
  matcha: "Matcha",
  strawberry: "Strawberry",
  taro: "Taro",
  white: "White",
} satisfies Record<Colour, string>;

interface ComposerProps {
  left: number;
  onStuck: (board: Board) => void;
}

/** Writing a note: its words, its colour, and sticking it up. */
const Composer = ({ left, onStuck }: ComposerProps) => {
  const [body, setBody] = useState("");
  const [colour, setColour] = useState<Colour>("lemon");
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState("");

  const ready = isValidBody(tidy(body)) && left > 0 && !sending;

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ready) {
      return;
    }

    setSending(true);
    const result = await stickNote({ body: tidy(body), colour });

    setSending(false);

    if (!result.ok) {
      setProblem(result.message);

      return;
    }

    setBody("");
    setProblem("");
    onStuck(result.board);
  };

  const count = lengthOf(body);

  const leftToday =
    left === 1 ? "1 note left today" : `${left} notes left today`;

  return (
    <form className="composer" onSubmit={submit}>
      <label className="field-label" htmlFor="sticky-body">
        Your note
      </label>
      <textarea
        id="sticky-body"
        className={`field composer__body sticky--${colour}`}
        value={body}
        maxLength={MAX_LENGTH * 2}
        rows={3}
        placeholder="Say something nice to whoever comes by"
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="composer__row">
        <fieldset className="swatches">
          <legend className="field-label">Colour</legend>
          {COLOURS.map((option) => (
            <button
              key={option}
              type="button"
              className={`swatch sticky--${option}`}
              aria-label={COLOUR_NAMES[option]}
              aria-pressed={colour === option}
              onClick={() => setColour(option)}
            />
          ))}
        </fieldset>
        <span
          className={`composer__count${count > MAX_LENGTH ? " composer__count--over" : ""}`}
        >
          {count}/{MAX_LENGTH}
        </span>
      </div>
      <div className="composer__row">
        <button type="submit" className="btn btn--primary" disabled={!ready}>
          {sending ? "Sticking…" : "Stick it up"}
        </button>
        <span className="hint">
          {left > 0 ? leftToday : "That's your notes for today."}
        </span>
      </div>
      <output className="hint">{problem}</output>
    </form>
  );
};

/**
 * The sticky board on the hub: notes anyone signed in can stick up, with no
 * name on them, each coming down a day after it went up.
 */
export const StickyBoard = () => {
  const [board, setBoard] = useState<Board | null | undefined>();
  const [now, setNow] = useState(Date.now);
  const { armed, press } = useConfirm();

  useEffect(() => {
    let current = true;

    const load = async () => {
      const fresh = await fetchBoard();

      if (current) {
        setBoard(fresh);
        setNow(Date.now());
      }
    };

    // Others stick notes too: fetched again now and then, while in view.
    const refresh = async () => {
      if (document.visibilityState === "visible") {
        await load();
      }
    };

    void load();
    const timer = window.setInterval(refresh, REFRESH_MS);

    return () => {
      current = false;
      window.clearInterval(timer);
    };
  }, []);

  const vote = async (id: string, value: Vote) => {
    const fresh = await voteOnNote(id, value);

    if (fresh) {
      setBoard(fresh);
    }
  };

  const takeDown = async (id: string) => {
    if ((await takeDownNote(id)) && board) {
      setBoard({
        ...board,
        notes: board.notes.filter((note) => note.id !== id),
      });
    }
  };

  // Notes whose day ran out since the last fetch are already down.
  const notes = board?.notes.filter(
    (note) => Date.parse(note.postedAt) + LIFETIME_MS > now
  );

  return (
    <section className="panel panel--stickies" aria-labelledby="stickies-title">
      <span className="legend">sticky-notes.txt</span>
      <div className="stickies__head">
        <h2 id="stickies-title" className="display stickies__title">
          The sticky board
        </h2>
        <p className="page__sub">
          Leave a note for whoever comes by. No names, and every note comes down
          after a day. Drag the notes wherever you like: only you see where you
          put them.
        </p>
      </div>

      {board === null ? (
        <p className="hint">The board can&apos;t be reached right now.</p>
      ) : null}

      {board && board.left === null ? (
        <a href={signInUrl()} className="btn btn--primary stickies__sign-in">
          Sign in to stick a note
        </a>
      ) : null}

      {board && board.left !== null ? (
        <Composer left={board.left} onStuck={setBoard} />
      ) : null}

      {notes && notes.length === 0 ? (
        <p className="hint">The board is bare. Stick the first note!</p>
      ) : null}

      {notes && notes.length > 0 ? (
        <Corkboard
          notes={notes}
          now={now}
          armed={armed}
          onVote={board?.left === null ? null : vote}
          onTakeDown={
            board?.admin ? (id) => press(id, () => takeDown(id)) : null
          }
        />
      ) : null}
    </section>
  );
};
