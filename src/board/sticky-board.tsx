import { useEffect, useLayoutEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { createPortal } from "react-dom";

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
import { sidesFit } from "./sides";

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
      <textarea
        id="sticky-body"
        aria-label="Your note"
        className={`field composer__body sticky--${colour}`}
        value={body}
        maxLength={MAX_LENGTH * 2}
        rows={2}
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
          {count}/{MAX_LENGTH} · {left > 0 ? leftToday : "no notes left today"}
        </span>
        <button type="submit" className="btn btn--primary" disabled={!ready}>
          {sending ? "Sticking…" : "Stick it up"}
        </button>
      </div>
      {problem ? <output className="hint">{problem}</output> : null}
    </form>
  );
};

/**
 * How wide `element` is, kept up to date: 0 until it is there and measured.
 * A ResizeObserver reports the size as soon as it starts watching.
 */
const useWidth = (element: HTMLElement | null) => {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!(element && "ResizeObserver" in window)) {
      return;
    }

    const observer = new ResizeObserver(() => setWidth(element.clientWidth));

    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return width;
};

/** Sticking a note up: the form, or why there is none. */
const Postbox = ({
  board,
  onStuck,
}: {
  board: Board | null | undefined;
  onStuck: (board: Board) => void;
}) => {
  if (board === null) {
    return <p className="hint">The board can&apos;t be reached right now.</p>;
  }

  if (!board) {
    return null;
  }

  return board.left === null ? (
    <a href={signInUrl()} className="btn btn--primary stickies__sign-in">
      Sign in to stick a note
    </a>
  ) : (
    <Composer left={board.left} onStuck={onStuck} />
  );
};

interface StickyBoardProps {
  /** The layer as wide as the page, for the notes to hang in its margins. */
  sides: HTMLElement | null;
}

/**
 * The sticky board on the hub: notes anyone signed in can stick up, with no
 * name on them, each coming down a day after it went up. On a wide screen
 * the notes hang down the page's sides; otherwise in the box.
 */
export const StickyBoard = ({ sides }: StickyBoardProps) => {
  const [board, setBoard] = useState<Board | null | undefined>();
  const pageWidth = useWidth(sides);
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

  // On a page with margins wide enough for a note, the notes hang there.
  const onTheSides = sides !== null && sidesFit(pageWidth);

  // Notes whose day ran out since the last fetch are already down.
  const notes = board?.notes.filter(
    (note) => Date.parse(note.postedAt) + LIFETIME_MS > now
  );

  const pinned =
    notes && notes.length > 0 ? (
      <Corkboard
        sides={onTheSides}
        notes={notes}
        now={now}
        armed={armed}
        onVote={board?.left === null ? null : vote}
        onTakeDown={board?.admin ? (id) => press(id, () => takeDown(id)) : null}
      />
    ) : null;

  return (
    <>
      {pinned && onTheSides && sides ? createPortal(pinned, sides) : null}
      <section
        className="panel panel--stickies"
        aria-labelledby="stickies-title"
      >
        <span className="legend">sticky-notes.txt</span>
        <div className="stickies__head">
          <h2 id="stickies-title" className="display stickies__title">
            The sticky board
          </h2>
          <p className="page__sub">
            Leave a note for whoever comes by: no names, gone in a day.
          </p>
        </div>

        <Postbox board={board} onStuck={setBoard} />

        {notes && notes.length === 0 ? (
          <p className="hint">The board is bare. Stick the first note!</p>
        ) : null}

        {pinned && onTheSides ? (
          <p className="hint">The notes hang on both sides of the page.</p>
        ) : null}

        {pinned && !onTheSides ? pinned : null}
      </section>
    </>
  );
};
