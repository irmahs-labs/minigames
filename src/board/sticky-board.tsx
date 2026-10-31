import { useEffect, useLayoutEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { createPortal } from "react-dom";

import { signInUrl } from "../lib/account";
import { useCopy, useLanguage } from "../lib/language";
import { serverWords } from "../lib/server-words";
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

const COPY = {
  en: {
    bare: "The board is bare. Stick the first note!",
    colour: "Colour",
    colours: {
      blue: "Blue",
      lemon: "Lemon",
      matcha: "Matcha",
      strawberry: "Strawberry",
      taro: "Taro",
      white: "White",
    } satisfies Record<Colour, string>,
    left: (n: number) =>
      n === 1 ? "1 note left today" : `${n} notes left today`,
    noneLeft: "no notes left today",
    placeholder: "Say something nice to whoever comes by",
    sides: "The notes hang on both sides of the page.",
    signIn: "Sign in to stick a note",
    stick: "Stick it up",
    sticking: "Sticking…",
    sub: "Leave an anonymous note for whoever comes by!",
    title: "The sticky board",
    unreachable: "The board can't be reached right now.",
    yourNote: "Your note",
  },
  fr: {
    bare: "Le tableau est vide. Collez la première note !",
    colour: "Couleur",
    colours: {
      blue: "Bleu",
      lemon: "Citron",
      matcha: "Matcha",
      strawberry: "Fraise",
      taro: "Taro",
      white: "Blanc",
    } satisfies Record<Colour, string>,
    left: (n: number) =>
      n === 1 ? "encore 1 note aujourd’hui" : `encore ${n} notes aujourd’hui`,
    noneLeft: "plus de notes aujourd’hui",
    placeholder: "Écrivez un mot gentil à qui passera par là",
    sides: "Les notes sont accrochées des deux côtés de la page.",
    signIn: "Connectez-vous pour coller une note",
    stick: "La coller",
    sticking: "Collage…",
    sub: "Laissez une note anonyme à qui passera par là !",
    title: "Le tableau de notes",
    unreachable: "Le tableau est injoignable pour le moment.",
    yourNote: "Votre note",
  },
};

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
  const language = useLanguage();
  const t = COPY[language];

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
      setProblem(serverWords(result.message, language));

      return;
    }

    setBody("");
    setProblem("");
    onStuck(result.board);
  };

  const count = lengthOf(body);

  const leftToday = t.left(left);

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        id="sticky-body"
        aria-label={t.yourNote}
        className={`field composer__body sticky--${colour}`}
        value={body}
        maxLength={MAX_LENGTH * 2}
        rows={2}
        placeholder={t.placeholder}
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="composer__row">
        <fieldset className="swatches">
          <legend className="field-label">{t.colour}</legend>
          {COLOURS.map((option) => (
            <button
              key={option}
              type="button"
              className={`swatch sticky--${option}`}
              aria-label={t.colours[option]}
              aria-pressed={colour === option}
              onClick={() => setColour(option)}
            />
          ))}
        </fieldset>
        <span
          className={`composer__count${count > MAX_LENGTH ? " composer__count--over" : ""}`}
        >
          {count}/{MAX_LENGTH} · {left > 0 ? leftToday : t.noneLeft}
        </span>
        <button type="submit" className="btn btn--primary" disabled={!ready}>
          {sending ? t.sticking : t.stick}
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
  const t = useCopy(COPY);

  if (board === null) {
    return <p className="hint">{t.unreachable}</p>;
  }

  if (!board) {
    return null;
  }

  return board.left === null ? (
    <a href={signInUrl()} className="btn btn--primary stickies__sign-in">
      {t.signIn}
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
  const t = useCopy(COPY);

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
            {t.title}
          </h2>
          <p className="page__sub">{t.sub}</p>
        </div>

        <Postbox board={board} onStuck={setBoard} />

        {notes && notes.length === 0 ? <p className="hint">{t.bare}</p> : null}

        {pinned && onTheSides ? <p className="hint">{t.sides}</p> : null}

        {pinned && !onTheSides ? pinned : null}
      </section>
    </>
  );
};
