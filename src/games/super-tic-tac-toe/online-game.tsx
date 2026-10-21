import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { signInUrl } from "../../lib/account";
import type { Account } from "../../lib/account";
import { BoardView } from "./board-view";
import { EndDialog } from "./end-dialog";
import { HowToPlay } from "./how-to-play";
import { clock } from "./online/state";
import type { Online } from "./online/state";
import { useOnline } from "./online/use-online";
import { PlanetScore } from "./planet-score";
import { describe, newGame, playerLabel, replay } from "./rules";
import type { Game, Player } from "./rules";

/** The clock is shown once this little time is left to move. */
const WARN_MS = 60_000;

type Over = Extract<Online, { phase: "over" }>;

/** The time now, ticking every second while `running`. */
const useNow = (running: boolean) => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!running) {
      return;
    }

    const tick = () => setNow(Date.now());
    // Catch up at once: `now` may be from long before the clock started.
    const first = window.setTimeout(tick, 0);
    const every = window.setInterval(tick, 1000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
    };
  }, [running]);

  return now;
};

const pointsText = (points: number) => {
  const size = Math.abs(points);
  const unit = size === 1 ? "point" : "points";

  return points < 0 ? `−${size} ${unit}` : `+${size} ${unit}`;
};

const resultHeadline = ({ seat, winner }: Over) => {
  if (winner === null) {
    return "Draw";
  }

  return winner === seat.you ? "You win! 🎉🎉" : "You lose";
};

const resultNote = ({ ending, points, seat, winner }: Over) => {
  const reasons = {
    full: "Every planet is conquered or full, with no three in a row.",
    line: "Three planets in a row.",
    timeout:
      winner === seat.you
        ? `${seat.opponent} ran out of time.`
        : "You ran out of time.",
  };

  return `${reasons[ending]} ${pointsText(points)} on the leaderboard.`;
};

const namesFor = (you: Player, opponent: string): Record<Player, string> =>
  you === "pink"
    ? { pink: "You", purple: opponent }
    : { pink: opponent, purple: "You" };

interface Log {
  kicker: string;
  headline: string;
  note: string;
  action?: ReactNode;
}

/** A panel for when online play cannot start: the reason, and what to do. */
const Notice = ({ children }: { children: ReactNode }) => (
  <section className="panel panel--notice">
    <span className="legend">online.log</span>
    {children}
  </section>
);

/** Online play, with the socket open: queue, game, and result. */
const OnlinePlay = ({ onFinished }: { onFinished: () => void }) => {
  const { connection, error, join, leave, move, state } = useOnline();
  const [dismissed, setDismissed] = useState<Online | null>(null);
  const now = useNow(state.phase === "queued" || state.phase === "playing");

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

  const log = ((): Log => {
    switch (state.phase) {
      case "queued": {
        return {
          action: (
            <button type="button" className="btn" onClick={leave}>
              Cancel
            </button>
          ),
          headline: "Looking for a player…",
          kicker: "Online",
          note: `${
            state.waiting > 1
              ? `${state.waiting} people looking.`
              : "Nobody else is looking yet."
          } Stops looking in ${clock(state.deadline, now)}.`,
        };
      }

      case "expired": {
        return {
          action: playButton("Try again"),
          headline: "No one turned up",
          kicker: "Online",
          note: "Nobody else looked for a game in five minutes.",
        };
      }

      case "lost": {
        return {
          action: playButton("Play online"),
          headline: "The game was lost",
          kicker: "Online",
          note: "The server restarted, and the game ended without a result.",
        };
      }

      case "playing": {
        const { opponent, you } = state.seat;
        const left = state.deadline - now;

        const hurry = myTurn
          ? `Move within ${clock(state.deadline, now)} or you lose.`
          : `${opponent} has ${clock(state.deadline, now)} to move.`;

        return {
          headline: myTurn ? "Your turn" : `${opponent}'s turn`,
          kicker: `You are ${playerLabel(you)}`,
          note: `${describe(game)}${left <= WARN_MS ? ` ${hurry}` : ""}`,
        };
      }

      case "over": {
        return {
          action: playButton("Play again"),
          headline: resultHeadline(state),
          kicker: "Game over",
          note: resultNote(state),
        };
      }

      default: {
        return {
          action: playButton("Play online"),
          headline: "Play someone online",
          kicker: "Online",
          note: "The first two people looking play each other. Every game counts on the leaderboard.",
        };
      }
    }
  })();

  return (
    <>
      <div className="layout">
        <section aria-label="The planets" className="panel panel--system">
          <span className="legend">solar.system</span>
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
              names={namesFor(seat.you, seat.opponent)}
            />
          ) : null}

          {log.action ? <div>{log.action}</div> : null}

          <p className="hint" aria-live="polite">
            {connection === "closed" ? "Connection lost. Reconnecting…" : ""}
            {connection === "connecting" ? "Connecting…" : ""}
            {connection === "open" && error ? error : ""}
          </p>

          <HowToPlay />
        </section>
      </div>

      {state.phase === "over" ? (
        <EndDialog
          open={dismissed !== state}
          headline={resultHeadline(state)}
          note={resultNote(state)}
          again="Play again"
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

/**
 * Super Tic-Tac-Toe against someone else online. Only for people signed in
 * to their irmahs.dev account, which is how the leaderboard knows them.
 */
export const OnlineGame = ({ account, onFinished }: OnlineGameProps) => {
  if (account === undefined) {
    return (
      <Notice>
        <h2 className="display turn">Online play is not available</h2>
        <p className="turn__note">
          The game server cannot be reached right now. The same-screen game
          still works.
        </p>
      </Notice>
    );
  }

  if (account === null) {
    return (
      <Notice>
        <h2 className="display turn">Sign in to play online</h2>
        <p className="turn__note">
          Online games are played with your irmahs.dev account, so the
          leaderboard knows who won. Sign in once with Google; every irmahs.dev
          app shares it.
        </p>
        <div>
          <a href={signInUrl()} className="btn btn--primary">
            Sign in
          </a>
        </div>
      </Notice>
    );
  }

  return <OnlinePlay onFinished={onFinished} />;
};
