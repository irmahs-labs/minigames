import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { signInUrl } from "../../lib/account";
import type { Account } from "../../lib/account";
import { useCopy, useLanguage } from "../../lib/language";
import { serverWords } from "../../lib/server-words";
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

const COPY = {
  en: {
    cancel: "Cancel",
    connecting: "Connecting…",
    draw: "Draw",
    expired: "Nobody else looked for a game in five minutes.",
    full: "Every planet is conquered or full, with no three in a row.",
    gameOver: "Game over",
    hasToMove: (who: string, time: string) => `${who} has ${time} to move.`,
    line: "Three planets in a row.",
    looking: "Looking for a player…",
    lost: "The game was lost",
    lostNote: "The server restarted, and the game ended without a result.",
    moveWithin: (time: string) => `Move within ${time} or you lose.`,
    noOne: "No one turned up",
    nobodyElse: "Nobody else is looking yet.",
    onLeaderboard: (points: string) => `${points} on the leaderboard.`,
    online: "Online",
    peopleLooking: (n: number) => `${n} people looking.`,
    planets: "The planets",
    playAgain: "Play again",
    playOnline: "Play online",
    playSomeone: "Play someone online",
    playSomeoneNote:
      "The first two people looking play each other. Every game counts on the leaderboard.",
    points: (n: number) => (n === 1 ? "point" : "points"),
    reconnecting: "Connection lost. Reconnecting…",
    signIn: "Sign in",
    signInNote:
      "Online games are played with your irmahs.dev account, so the leaderboard knows who won. Sign in once with Google; every irmahs.dev app shares it.",
    signInTitle: "Sign in to play online",
    stopsIn: (time: string) => `Stops looking in ${time}.`,
    theirTime: (who: string) => `${who} ran out of time.`,
    theirTurn: (who: string) => `${who}'s turn`,
    tryAgain: "Try again",
    unavailable: "Online play is not available",
    unavailableNote:
      "The game server cannot be reached right now. The same-screen game still works.",
    you: "You",
    youAre: (player: string) => `You are ${player}`,
    youLose: "You lose",
    youWin: "You win! 🎉🎉",
    yourTime: "You ran out of time.",
    yourTurn: "Your turn",
  },
  fr: {
    cancel: "Annuler",
    connecting: "Connexion…",
    draw: "Match nul",
    expired: "Personne d’autre n’a cherché de partie en cinq minutes.",
    full: "Toutes les planètes sont conquises ou pleines, sans trois alignées.",
    gameOver: "Partie terminée",
    hasToMove: (who: string, time: string) => `${who} a ${time} pour jouer.`,
    line: "Trois planètes alignées.",
    looking: "Recherche d’un joueur…",
    lost: "La partie a été perdue",
    lostNote:
      "Le serveur a redémarré, et la partie s’est terminée sans résultat.",
    moveWithin: (time: string) => `Jouez dans les ${time} ou vous perdez.`,
    noOne: "Personne n’est venu",
    nobodyElse: "Personne d’autre ne cherche pour l’instant.",
    onLeaderboard: (points: string) => `${points} au classement.`,
    online: "En ligne",
    peopleLooking: (n: number) => `${n} personnes cherchent.`,
    planets: "Les planètes",
    playAgain: "Rejouer",
    playOnline: "Jouer en ligne",
    playSomeone: "Affrontez quelqu’un en ligne",
    playSomeoneNote:
      "Les deux premières personnes qui cherchent jouent ensemble. Chaque partie compte au classement.",
    points: (n: number) => (n <= 1 ? "point" : "points"),
    reconnecting: "Connexion perdue. Reconnexion…",
    signIn: "Se connecter",
    signInNote:
      "Les parties en ligne se jouent avec votre compte irmahs.dev, pour que le classement sache qui a gagné. Connectez-vous une fois avec Google ; toutes les apps irmahs.dev le partagent.",
    signInTitle: "Connectez-vous pour jouer en ligne",
    stopsIn: (time: string) => `Fin de la recherche dans ${time}.`,
    theirTime: (who: string) => `${who} a dépassé son temps.`,
    theirTurn: (who: string) => `Au tour de ${who}`,
    tryAgain: "Réessayer",
    unavailable: "Le jeu en ligne n’est pas disponible",
    unavailableNote:
      "Le serveur de jeu est injoignable pour le moment. Le jeu sur le même écran marche toujours.",
    you: "Vous",
    youAre: (player: string) => `Vous êtes ${player}`,
    youLose: "Vous perdez",
    youWin: "Vous gagnez ! 🎉🎉",
    yourTime: "Vous avez dépassé votre temps.",
    yourTurn: "À vous de jouer",
  },
};

type Copy = (typeof COPY)["en"];

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

const pointsText = (points: number, t: Copy) => {
  const size = Math.abs(points);
  const unit = t.points(size);

  return points < 0 ? `−${size} ${unit}` : `+${size} ${unit}`;
};

const resultHeadline = ({ seat, winner }: Over, t: Copy) => {
  if (winner === null) {
    return t.draw;
  }

  return winner === seat.you ? t.youWin : t.youLose;
};

const resultNote = ({ ending, points, seat, winner }: Over, t: Copy) => {
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
  t: Copy
): Record<Player, string> =>
  you === "pink"
    ? { pink: t.you, purple: opponent }
    : { pink: opponent, purple: t.you };

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
  const language = useLanguage();
  const t = COPY[language];

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
              {t.cancel}
            </button>
          ),
          headline: t.looking,
          kicker: t.online,
          note: `${
            state.waiting > 1 ? t.peopleLooking(state.waiting) : t.nobodyElse
          } ${t.stopsIn(clock(state.deadline, now))}`,
        };
      }

      case "expired": {
        return {
          action: playButton(t.tryAgain),
          headline: t.noOne,
          kicker: t.online,
          note: t.expired,
        };
      }

      case "lost": {
        return {
          action: playButton(t.playOnline),
          headline: t.lost,
          kicker: t.online,
          note: t.lostNote,
        };
      }

      case "playing": {
        const { opponent, you } = state.seat;
        const left = state.deadline - now;

        const hurry = myTurn
          ? t.moveWithin(clock(state.deadline, now))
          : t.hasToMove(opponent, clock(state.deadline, now));

        return {
          headline: myTurn ? t.yourTurn : t.theirTurn(opponent),
          kicker: t.youAre(playerLabel(you, language)),
          note: `${describe(game, language)}${left <= WARN_MS ? ` ${hurry}` : ""}`,
        };
      }

      case "over": {
        return {
          action: playButton(t.playAgain),
          headline: resultHeadline(state, t),
          kicker: t.gameOver,
          note: resultNote(state, t),
        };
      }

      default: {
        return {
          action: playButton(t.playOnline),
          headline: t.playSomeone,
          kicker: t.online,
          note: t.playSomeoneNote,
        };
      }
    }
  })();

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
              names={namesFor(seat.you, seat.opponent, t)}
            />
          ) : null}

          {log.action ? <div>{log.action}</div> : null}

          <p className="hint" aria-live="polite">
            {connection === "closed" ? t.reconnecting : ""}
            {connection === "connecting" ? t.connecting : ""}
            {connection === "open" && error ? serverWords(error, language) : ""}
          </p>

          <HowToPlay />
        </section>
      </div>

      {state.phase === "over" ? (
        <EndDialog
          open={dismissed !== state}
          headline={resultHeadline(state, t)}
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

/**
 * Super Tic-Tac-Toe against someone else online. Only for people signed in
 * to their irmahs.dev account, which is how the leaderboard knows them.
 */
export const OnlineGame = ({ account, onFinished }: OnlineGameProps) => {
  const t = useCopy(COPY);

  if (account === undefined) {
    return (
      <Notice>
        <h2 className="display turn">{t.unavailable}</h2>
        <p className="turn__note">{t.unavailableNote}</p>
      </Notice>
    );
  }

  if (account === null) {
    return (
      <Notice>
        <h2 className="display turn">{t.signInTitle}</h2>
        <p className="turn__note">{t.signInNote}</p>
        <div>
          <a href={signInUrl()} className="btn btn--primary">
            {t.signIn}
          </a>
        </div>
      </Notice>
    );
  }

  return <OnlinePlay onFinished={onFinished} />;
};
