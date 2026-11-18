import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { signInUrl } from "../lib/account";
import type { Account } from "../lib/account";
import { useCopy, useLanguage } from "../lib/language";
import { clock } from "../lib/online/state";
import type { Online } from "../lib/online/state";
import type { Connection } from "../lib/online/use-online";
import { serverWords } from "../lib/server-words";

/**
 * What every online game shows around its board: the sign-in gate, the
 * queue, the clock, the connection and how many points a game was worth.
 * Each game adds its own board, turn and endings.
 */
export const ONLINE_COPY = {
  en: {
    cancel: "Cancel",
    connecting: "Connecting…",
    draw: "Draw",
    expired: "Nobody else looked for a game in five minutes.",
    gameOver: "Game over",
    hasToMove: (who: string, time: string) => `${who} has ${time} to move.`,
    looking: "Looking for a player…",
    lost: "The game was lost",
    lostNote: "The server restarted, and the game ended without a result.",
    moveWithin: (time: string) => `Move within ${time} or you lose.`,
    noOne: "No one turned up",
    nobodyElse: "Nobody else is looking yet.",
    onLeaderboard: (points: string) => `${points} on the leaderboard.`,
    online: "Online",
    peopleLooking: (n: number) => `${n} people looking.`,
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
      "The game server cannot be reached right now. Playing on this screen still works.",
    you: "You",
    youAre: (side: string) => `You are ${side}`,
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
    gameOver: "Partie terminée",
    hasToMove: (who: string, time: string) => `${who} a ${time} pour jouer.`,
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
      "Le serveur de jeu est injoignable pour le moment. Jouer sur cet écran marche toujours.",
    you: "Vous",
    youAre: (side: string) => `Vous êtes ${side}`,
    youLose: "Vous perdez",
    youWin: "Vous gagnez ! 🎉🎉",
    yourTime: "Vous avez dépassé votre temps.",
    yourTurn: "À vous de jouer",
  },
};

export type OnlineCopy = (typeof ONLINE_COPY)["en"];

/** The clock is shown once this little time is left to move. */
export const WARN_MS = 60_000;

/** The time now, ticking every second while `running`. */
export const useNow = (running: boolean) => {
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

/** "+31 points", "−22 points" */
export const pointsText = (points: number, t: OnlineCopy) => {
  const size = Math.abs(points);
  const unit = t.points(size);

  return points < 0 ? `−${size} ${unit}` : `+${size} ${unit}`;
};

/** "You win!", "You lose" or "Draw", for the player in `you` */
export const resultHeadline = <P extends string>(
  winner: P | null,
  you: P,
  t: OnlineCopy
) => {
  if (winner === null) {
    return t.draw;
  }

  return winner === you ? t.youWin : t.youLose;
};

/** What the log says while not playing: idle, queued, expired, lost */
export interface Log {
  kicker: string;
  headline: string;
  note: string;
  action?: ReactNode;
}

/**
 * The log for the phases every online game shares, or null while a game is
 * on or over, which the game words itself.
 */
export const queueLog = <M, P extends string, E extends string>(
  state: Online<M, P, E>,
  now: number,
  t: OnlineCopy,
  play: (label: string) => ReactNode,
  leave: () => void
): Log | null => {
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
        action: play(t.tryAgain),
        headline: t.noOne,
        kicker: t.online,
        note: t.expired,
      };
    }

    case "lost": {
      return {
        action: play(t.playOnline),
        headline: t.lost,
        kicker: t.online,
        note: t.lostNote,
      };
    }

    case "idle": {
      return {
        action: play(t.playOnline),
        headline: t.playSomeone,
        kicker: t.online,
        note: t.playSomeoneNote,
      };
    }

    default: {
      return null;
    }
  }
};

/** Whose turn it is and how long is left, while a game is on */
export const turnNote = (
  myTurn: boolean,
  opponent: string,
  deadline: number,
  now: number,
  t: OnlineCopy
) => {
  if (deadline - now > WARN_MS) {
    return "";
  }

  return myTurn
    ? t.moveWithin(clock(deadline, now))
    : t.hasToMove(opponent, clock(deadline, now));
};

/** Reconnecting, connecting, or the server's last refusal */
export const ConnectionHint = ({
  connection,
  error,
}: {
  connection: Connection;
  error: string | null;
}) => {
  const language = useLanguage();
  const t = ONLINE_COPY[language];

  return (
    <p className="hint" aria-live="polite">
      {connection === "closed" ? t.reconnecting : ""}
      {connection === "connecting" ? t.connecting : ""}
      {connection === "open" && error ? serverWords(error, language) : ""}
    </p>
  );
};

/** A panel for when online play cannot start: the reason, and what to do. */
const Notice = ({ children }: { children: ReactNode }) => (
  <section className="panel panel--notice">
    <span className="legend">online.log</span>
    {children}
  </section>
);

/**
 * Online play only for people signed in to their irmahs.dev account, which
 * is how the leaderboard knows them; the game itself once they are.
 */
export const OnlineGate = ({
  account,
  children,
}: {
  /** Who is signed in; null for nobody, undefined when unknown. */
  account: Account | null | undefined;
  children: ReactNode;
}) => {
  const t = useCopy(ONLINE_COPY);

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

  return children;
};
