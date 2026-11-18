/**
 * Where a player stands in an online game, whatever the game: the moves, the
 * sides and the endings are its own (M, P, E).
 */

/** What the server says, as every game's socket sends it */
export type ServerMessage<M, P extends string, E extends string> =
  | { type: "idle" }
  | { type: "queued"; remainingMs: number; waiting: number }
  | { type: "expired" }
  | { type: "room"; moves: M[]; opponent: string; you: P; remainingMs: number }
  | {
      type: "over";
      moves: M[];
      opponent: string;
      you: P;
      ending: E;
      points: number;
      winner: P | null;
    }
  | { type: "error"; message: string };

/** This player's place in an online game. */
export interface Seat<M, P extends string> {
  you: P;
  opponent: string;
  moves: M[];
}

/**
 * Where this player stands online, as the server last said. Deadlines are
 * in this browser's clock: the server sends how long is left, not when, so
 * the two clocks never need to agree.
 */
export type Online<M, P extends string, E extends string> =
  | { phase: "idle" }
  | { phase: "queued"; waiting: number; deadline: number }
  | { phase: "expired" }
  | { phase: "playing"; seat: Seat<M, P>; deadline: number }
  | {
      phase: "over";
      seat: Seat<M, P>;
      winner: P | null;
      ending: E;
      points: number;
    }
  // The server no longer knows the game this page was playing: it restarted.
  | { phase: "lost" };

export const IDLE = { phase: "idle" } as const;

/** The state after a message from the server, received at `now`. */
export const receive = <M, P extends string, E extends string>(
  state: Online<M, P, E>,
  message: ServerMessage<M, P, E>,
  now: number
): Online<M, P, E> => {
  switch (message.type) {
    case "idle": {
      if (state.phase === "playing") {
        return { phase: "lost" };
      }

      // A result stays on screen until the player moves on.
      return state.phase === "over" ? state : IDLE;
    }

    case "queued": {
      return {
        deadline: now + message.remainingMs,
        phase: "queued",
        waiting: message.waiting,
      };
    }

    case "expired": {
      return { phase: "expired" };
    }

    case "room": {
      const { moves, opponent, remainingMs, you } = message;

      return {
        deadline: now + remainingMs,
        phase: "playing",
        seat: { moves, opponent, you },
      };
    }

    case "over": {
      const { ending, moves, opponent, points, winner, you } = message;

      return {
        ending,
        phase: "over",
        points,
        seat: { moves, opponent, you },
        winner,
      };
    }

    default: {
      return state;
    }
  }
};

/** Minutes and seconds left, "4:05", never below 0:00. */
export const clock = (deadline: number, now: number): string => {
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
