import { useEffect, useMemo, useState } from "react";

import { EndDialog } from "../../components/end-dialog";
import {
  ConnectionHint,
  ONLINE_COPY,
  OnlineGate,
  pointsText,
  queueLog,
  resultHeadline,
  turnNote,
  useNow,
} from "../../components/online-play";
import type { Log } from "../../components/online-play";
import type { Account } from "../../lib/account";
import { useLanguage } from "../../lib/language";
import { BoardView } from "./board-view";
import { HowToPlay } from "./how-to-play";
import type { Online } from "./online/state";
import { useOnline } from "./online/use-online";
import { PlanetScore } from "./planet-score";
import { describe, newGame, playerLabel, replay } from "./rules";
import type { Game, Player } from "./rules";

type Over = Extract<Online, { phase: "over" }>;

/** Super Tic-Tac-Toe's own words; the rest are every online game's */
const COPY = {
  en: {
    full: "Every planet is conquered or full, with no three in a row.",
    line: "Three planets in a row.",
    planets: "The planets",
  },
  fr: {
    full: "Toutes les planètes sont conquises ou pleines, sans trois alignées.",
    line: "Trois planètes alignées.",
    planets: "Les planètes",
  },
};

const resultNote = (
  { ending, points, seat, winner }: Over,
  t: (typeof ONLINE_COPY)["en"] & (typeof COPY)["en"]
) => {
  const reasons = {
    full: t.full,
    line: t.line,
    timeout: winner === seat.you ? t.theirTime(seat.opponent) : t.yourTime,
  };

  return `${reasons[ending]} ${t.onLeaderboard(pointsText(points, t))}`;
};

const namesFor = (
  you: Player,
  opponent: string,
  yours: string
): Record<Player, string> =>
  you === "pink"
    ? { pink: yours, purple: opponent }
    : { pink: opponent, purple: yours };

/** Online play, with the socket open: queue, game, and result. */
const OnlinePlay = ({ onFinished }: { onFinished: () => void }) => {
  const { connection, error, join, leave, move, state } = useOnline();
  const [dismissed, setDismissed] = useState<Online | null>(null);
  const now = useNow(state.phase === "queued" || state.phase === "playing");
  const language = useLanguage();
  const t = { ...ONLINE_COPY[language], ...COPY[language] };

  const seat =
    state.phase === "playing" || state.phase === "over" ? state.seat : null;

  const game: Game = useMemo(
    () => (seat && replay(seat.moves)) || newGame(),
    [seat]
  );

  const myTurn = state.phase === "playing" && game.turn === state.seat.you;
  const ready = connection === "open";

  useEffect(() => {
    if (state.phase === "over") {
      onFinished();
    }
  }, [state, onFinished]);

  const playButton = (label: string) => (
    <button
      type="button"
      className="btn btn--primary"
      disabled={!ready}
      onClick={join}
    >
      {label}
    </button>
  );

  const gameLog = (): Log => {
    if (state.phase === "playing") {
      const { opponent, you } = state.seat;
      const hurry = turnNote(myTurn, opponent, state.deadline, now, t);

      return {
        headline: myTurn ? t.yourTurn : t.theirTurn(opponent),
        kicker: t.youAre(playerLabel(you, language)),
        note: `${describe(game, language)}${hurry ? ` ${hurry}` : ""}`,
      };
    }

    if (state.phase === "over") {
      return {
        action: playButton(t.playAgain),
        headline: resultHeadline(state.winner, state.seat.you, t),
        kicker: t.gameOver,
        note: resultNote(state, t),
      };
    }

    return { headline: "", kicker: "", note: "" };
  };

  const log = queueLog(state, now, t, playButton, leave) ?? gameLog();

  return (
    <>
      <div className="layout">
        <section aria-label={t.planets} className="panel panel--system">
          <span className="legend">solar.sys</span>
          <BoardView
            game={game}
            onPlay={move}
            locked={!(myTurn && ready)}
            quiet={!seat}
          />
        </section>

        <section aria-labelledby="online-title" className="panel panel--log">
          <span className="legend">mission.log</span>

          <div className="stack">
            <p className="kicker">{log.kicker}</p>
            <h2 id="online-title" className="display turn">
              {log.headline}
            </h2>
          </div>
          <p className="turn__note" aria-live="polite">
            {log.note}
          </p>

          {seat ? (
            <PlanetScore
              game={game}
              names={namesFor(seat.you, seat.opponent, t.you)}
            />
          ) : null}

          {log.action ? <div>{log.action}</div> : null}

          <ConnectionHint connection={connection} error={error} />

          <HowToPlay />
        </section>
      </div>

      {state.phase === "over" ? (
        <EndDialog
          open={dismissed !== state}
          headline={resultHeadline(state.winner, state.seat.you, t)}
          note={resultNote(state, t)}
          again={t.playAgain}
          onNewGame={join}
          onClose={() => setDismissed(state)}
        />
      ) : null}
    </>
  );
};

interface OnlineGameProps {
  /** Who is signed in; null for nobody, undefined when unknown. */
  account: Account | null | undefined;
  /** Called when a game ends, so the leaderboard can catch up. */
  onFinished: () => void;
}

/** Super Tic-Tac-Toe against someone else online, signed in. */
export const OnlineGame = ({ account, onFinished }: OnlineGameProps) => (
  <OnlineGate account={account}>
    <OnlinePlay onFinished={onFinished} />
  </OnlineGate>
);
