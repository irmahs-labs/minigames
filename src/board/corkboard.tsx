import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

import { readStored, writeStored } from "../lib/storage";
import type { Note } from "./api";
import {
  SPOTS_KEY,
  boardHeight,
  deepestFor,
  heightOf,
  keepUp,
  leftOf,
  spotAt,
  spotsSchema,
  startingSpots,
  topLayer,
} from "./layout";
import type { Spot, Spots } from "./layout";
import { goneIn } from "./rules";
import type { Vote } from "./rules";

/** How far an arrow key moves a note; with Shift, four times as far. */
const KEY_STEP = 16;

/** The take-down button under a note, for an admin. */
const TAKE_DOWN_HEIGHT = 32;

/** A press that moves less than this is a press, not a drag. */
const DRAG_SLOP = 4;

const ARROWS = new Map(
  Object.entries({
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
  } satisfies Record<string, readonly [number, number]>)
);

/** Each note leans a little its own way, the same way every time. */
const tiltOf = (id: string) => `sticky--tilt-${Number(id.slice(-1)) % 3}`;

interface Held {
  id: string;
  pointer: number;
  /** Where the pointer went down, and the note's corner then. */
  from: { x: number; y: number; left: number; top: number };
  left: number;
  top: number;
  moved: boolean;
}

interface Thumbs {
  note: Note;
  /** Null when signed out: the counts show, the buttons don't press. */
  onVote: ((vote: Vote) => void) | null;
}

const ThumbsRow = ({ note, onVote }: Thumbs) => {
  const toggle = (vote: Vote) => onVote?.(note.mine === vote ? 0 : vote);
  const hint = onVote ? undefined : "Sign in to vote";

  return (
    <div className="sticky__votes">
      <button
        type="button"
        className="sticky__vote"
        aria-label={`Thumbs up, ${note.up}`}
        aria-pressed={note.mine === 1}
        disabled={!onVote}
        title={hint}
        onClick={() => toggle(1)}
      >
        👍 {note.up}
      </button>
      <button
        type="button"
        className="sticky__vote"
        aria-label={`Thumbs down, ${note.down}`}
        aria-pressed={note.mine === -1}
        disabled={!onVote}
        title={hint}
        onClick={() => toggle(-1)}
      >
        👎 {note.down}
      </button>
    </div>
  );
};

interface CorkboardProps {
  notes: Note[];
  now: number;
  /** Votes a note; null when signed out. */
  onVote: ((id: string, vote: Vote) => void) | null;
  /** Takes a note down; only an admin is given it. */
  onTakeDown: ((id: string) => void) | null;
  /** The note whose take-down is waiting for "Sure?". */
  armed: string | null;
}

/**
 * The notes on a corkboard: each starts in a tidy grid, newest first, and
 * can be dragged anywhere on it, by mouse, by its tape on a touch screen, or
 * with the arrow keys on its tape. Where you put a note is remembered in
 * this browser only.
 */
export const Corkboard = ({
  notes,
  now,
  onVote,
  onTakeDown,
  armed,
}: CorkboardProps) => {
  const board = useRef<HTMLUListElement>(null);
  const [width, setWidth] = useState(0);

  const [spots, setSpots] = useState<Spots>(() =>
    readStored(SPOTS_KEY, spotsSchema, () => ({}))
  );

  const [held, setHeld] = useState<Held | null>(null);

  // The board's width decides the grid and how far across a note can go.
  useLayoutEffect(() => {
    const element = board.current;

    if (!element) {
      return;
    }

    setWidth(element.clientWidth);

    if (!("ResizeObserver" in window)) {
      return;
    }

    const observer = new ResizeObserver(() => setWidth(element.clientWidth));

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Notes that came down are left out of what is saved, so the store never
  // grows past the notes up now.
  const ids = notes.map((note) => note.id).join(",");

  useEffect(
    () => writeStored(SPOTS_KEY, keepUp(spots, ids.split(","))),
    [spots, ids]
  );

  const heights = notes.map((note) =>
    heightOf(note.body, onTakeDown ? TAKE_DOWN_HEIGHT : 0)
  );

  const starts = startingSpots(heights, width);

  const placed = notes.map((note, index): [Note, Spot, number] => [
    note,
    spots[note.id] ?? starts[index] ?? { x: 0, y: 0, z: 0 },
    heights[index] ?? 0,
  ]);

  const bottomsBut = (id: string) =>
    placed.flatMap(([note, place, height]) =>
      note.id === id ? [] : [place.y + height]
    );

  /** Puts a note down at `left` and `top`, on top of the rest. */
  const drop = (id: string, left: number, top: number) => {
    const place = spotAt(
      { left, top },
      width,
      deepestFor(bottomsBut(id)),
      topLayer(placed.map(([, spot]) => spot))
    );

    setSpots((saved) => ({ ...saved, [id]: place }));
  };

  const grab = (event: PointerEvent<HTMLLIElement>, id: string, spot: Spot) => {
    const target = event.target instanceof Element ? event.target : null;
    const onTape = Boolean(target?.closest(".sticky__tape"));

    // Buttons stay buttons; on a touch screen only the tape drags, so a
    // swipe over a note still scrolls the board.
    if (
      event.button !== 0 ||
      (!onTape && target?.closest("button")) ||
      (!onTape && event.pointerType === "touch")
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    const left = leftOf(spot, width);

    setHeld({
      from: { left, top: spot.y, x: event.clientX, y: event.clientY },
      id,
      left,
      moved: false,
      pointer: event.pointerId,
      top: spot.y,
    });
  };

  const move = (event: PointerEvent<HTMLLIElement>) => {
    if (!held || held.pointer !== event.pointerId) {
      return;
    }

    const dx = event.clientX - held.from.x;
    const dy = event.clientY - held.from.y;

    setHeld({
      ...held,
      left: held.from.left + dx,
      moved: held.moved || Math.hypot(dx, dy) > DRAG_SLOP,
      top: held.from.top + dy,
    });
  };

  const release = (event: PointerEvent<HTMLLIElement>) => {
    if (!held || held.pointer !== event.pointerId) {
      return;
    }

    if (held.moved) {
      drop(held.id, held.left, held.top);
    }

    setHeld(null);
  };

  const nudge = (
    event: KeyboardEvent<HTMLButtonElement>,
    id: string,
    spot: Spot
  ) => {
    const arrow = ARROWS.get(event.key);

    if (!arrow) {
      return;
    }

    event.preventDefault();

    const step = event.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const [across, down] = arrow;

    drop(id, leftOf(spot, width) + across * step, spot.y + down * step);
  };

  const height = boardHeight(bottomsBut(""));

  return (
    <div className="corkboard-frame">
      <ul ref={board} className="corkboard" style={{ height }}>
        {width > 0
          ? placed.map(([note, spot]) => {
              const holding = held?.id === note.id ? held : null;

              return (
                <li
                  key={note.id}
                  className={`sticky sticky--${note.colour} ${holding?.moved ? "sticky--held" : tiltOf(note.id)}`}
                  style={{
                    left: holding ? holding.left : leftOf(spot, width),
                    top: holding ? holding.top : spot.y,
                    zIndex: holding ? 10_000 : spot.z,
                  }}
                  onPointerDown={(event) => grab(event, note.id, spot)}
                  onPointerMove={move}
                  onPointerUp={release}
                  onPointerCancel={release}
                >
                  <button
                    type="button"
                    className="sticky__tape"
                    aria-label="Move this note: drag it, or use the arrow keys"
                    onKeyDown={(event) => nudge(event, note.id, spot)}
                  />
                  <p className="sticky__body">{note.body}</p>
                  <p className="sticky__time">
                    <time dateTime={note.postedAt}>
                      {goneIn(note.postedAt, now)}
                    </time>
                  </p>
                  <ThumbsRow
                    note={note}
                    onVote={onVote ? (vote) => onVote(note.id, vote) : null}
                  />
                  {onTakeDown ? (
                    <button
                      type="button"
                      className="sticky__remove"
                      onClick={() => onTakeDown(note.id)}
                    >
                      {armed === note.id ? "Sure? Take down" : "Take down"}
                    </button>
                  ) : null}
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
};
