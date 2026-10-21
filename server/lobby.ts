import type { ServerMessage } from "../src/games/super-tic-tac-toe/online/protocol";
import { newGame, other, play } from "../src/games/super-tic-tac-toe/rules";
import type { Game, Move, Player } from "../src/games/super-tic-tac-toe/rules";
import { gamePoints } from "../src/games/super-tic-tac-toe/scoring";
import type { Ending } from "../src/games/super-tic-tac-toe/scoring";

/** A room closes after this long with no move; whoever's turn it was loses. */
export const ROOM_IDLE_MS = 5 * 60_000;

/** Nobody to play after this long in the queue: stop looking. */
export const QUEUE_MS = 5 * 60_000;

/** How long a finished game's result waits for a player who reconnects. */
const RESULT_MS = 5 * 60_000;

const COLOURS: readonly Player[] = ["pink", "purple"];

/** A signed-in player, as the account service named them. */
export interface Account {
  id: string;
  name: string;
}

/** One open socket. An account may have several, one per tab. */
export interface Client {
  send: (message: ServerMessage) => void;
}

export interface FinishedGame {
  players: Record<Player, Account>;
  moves: Move[];
  winner: Player | null;
  ending: Ending;
  points: Record<Player, number>;
}

type Timer = ReturnType<typeof setTimeout>;

interface Room {
  players: Record<Player, Account>;
  moves: Move[];
  game: Game;
  deadline: number;
  timer?: Timer;
}

interface Waiting {
  account: Account;
  deadline: number;
  timer: Timer;
}

interface LobbyOptions {
  /** Called once per finished game, to put its points on the leaderboard. */
  onFinish: (game: FinishedGame) => void;
  /** Picks who plays Pink, who moves first. */
  random?: () => number;
  now?: () => number;
}

/**
 * The online queue and the games being played, kept in memory: a deploy
 * restarts the server and ends them. The first two people in the queue play
 * each other in a room of their own; the room's clock restarts on every move,
 * and when it runs out the player whose turn it was loses. The server checks
 * every move with the same rules as the board in the browser.
 */
export const createLobby = ({
  onFinish,
  random = Math.random,
  now = Date.now,
}: LobbyOptions) => {
  const clients = new Map<string, Set<Client>>();
  const queue: Waiting[] = [];
  const rooms = new Map<string, Room>();
  const results = new Map<string, { message: ServerMessage; timer: Timer }>();

  const tell = (accountId: string, message: ServerMessage) => {
    for (const client of clients.get(accountId) ?? []) {
      client.send(message);
    }
  };

  const colourOf = (room: Room, accountId: string): Player =>
    room.players.pink.id === accountId ? "pink" : "purple";

  const seatOf = (room: Room, colour: Player) => ({
    moves: room.moves,
    opponent: room.players[other(colour)].name,
    you: colour,
  });

  const roomMessage = (room: Room, colour: Player): ServerMessage => ({
    ...seatOf(room, colour),
    remainingMs: Math.max(0, room.deadline - now()),
    type: "room",
  });

  const tellRoom = (room: Room) => {
    for (const colour of COLOURS) {
      tell(room.players[colour].id, roomMessage(room, colour));
    }
  };

  const queuedMessage = (waiting: Waiting): ServerMessage => ({
    remainingMs: Math.max(0, waiting.deadline - now()),
    type: "queued",
    waiting: queue.length,
  });

  const tellQueue = () => {
    for (const waiting of queue) {
      tell(waiting.account.id, queuedMessage(waiting));
    }
  };

  const forget = (accountId: string) => {
    clearTimeout(results.get(accountId)?.timer);
    results.delete(accountId);
  };

  const remember = (accountId: string, message: ServerMessage) => {
    forget(accountId);
    results.set(accountId, {
      message,
      timer: setTimeout(() => results.delete(accountId), RESULT_MS),
    });
  };

  /** Where an account stands now: what a newly opened socket is told. */
  const status = (accountId: string): ServerMessage => {
    const room = rooms.get(accountId);

    if (room) {
      return roomMessage(room, colourOf(room, accountId));
    }

    const waiting = queue.find((entry) => entry.account.id === accountId);

    if (waiting) {
      return queuedMessage(waiting);
    }

    return results.get(accountId)?.message ?? { type: "idle" };
  };

  const finish = (room: Room, winner: Player | null, ending: Ending) => {
    clearTimeout(room.timer);

    const points = gamePoints(room.game, winner);

    for (const colour of COLOURS) {
      const { id } = room.players[colour];

      const message: ServerMessage = {
        ...seatOf(room, colour),
        ending,
        points: points[colour],
        type: "over",
        winner,
      };

      rooms.delete(id);
      remember(id, message);
      tell(id, message);
    }

    onFinish({
      ending,
      moves: room.moves,
      players: room.players,
      points,
      winner,
    });
  };

  const startClock = (room: Room) => {
    clearTimeout(room.timer);
    room.deadline = now() + ROOM_IDLE_MS;
    room.timer = setTimeout(
      () => finish(room, other(room.game.turn), "timeout"),
      ROOM_IDLE_MS
    );
  };

  /** Pairs the queue off from the front, two by two, into rooms. */
  const match = () => {
    while (queue.length >= 2) {
      const [first, second] = queue.splice(0, 2);

      if (!(first && second)) {
        break;
      }

      clearTimeout(first.timer);
      clearTimeout(second.timer);

      const [pink, purple] =
        random() < 0.5
          ? [first.account, second.account]
          : [second.account, first.account];

      const room: Room = {
        deadline: 0,
        game: newGame(),
        moves: [],
        players: { pink, purple },
      };

      for (const account of [pink, purple]) {
        forget(account.id);
        rooms.set(account.id, room);
      }

      startClock(room);
      tellRoom(room);
    }

    tellQueue();
  };

  const removeFromQueue = (accountId: string): boolean => {
    const index = queue.findIndex((entry) => entry.account.id === accountId);
    const [waiting] = index === -1 ? [] : queue.splice(index, 1);

    clearTimeout(waiting?.timer);

    return waiting !== undefined;
  };

  const expire = (accountId: string) => {
    if (removeFromQueue(accountId)) {
      tell(accountId, { type: "expired" });
      tellQueue();
    }
  };

  return {
    /** Stops every clock: for tests, and for shutting down. */
    close: () => {
      for (const room of new Set(rooms.values())) {
        clearTimeout(room.timer);
      }

      for (const waiting of queue) {
        clearTimeout(waiting.timer);
      }

      for (const { timer } of results.values()) {
        clearTimeout(timer);
      }
    },

    /** A socket opened: it hears where its account stands. */
    connect: (account: Account, client: Client) => {
      const open = clients.get(account.id) ?? new Set<Client>();

      open.add(client);
      clients.set(account.id, open);
      client.send(status(account.id));
    },

    /**
     * A socket closed. An account with no socket left gives up its place in
     * the queue; a game goes on, and its clock decides if they do not return.
     */
    disconnect: (account: Account, client: Client) => {
      const open = clients.get(account.id);

      open?.delete(client);

      if (open && open.size > 0) {
        return;
      }

      clients.delete(account.id);

      if (removeFromQueue(account.id)) {
        tellQueue();
      }
    },

    /** Look for a game. One place per account, however many tabs ask. */
    join: (account: Account) => {
      const busy =
        rooms.has(account.id) ||
        queue.some((entry) => entry.account.id === account.id);

      if (busy) {
        tell(account.id, status(account.id));

        return;
      }

      forget(account.id);
      queue.push({
        account,
        deadline: now() + QUEUE_MS,
        timer: setTimeout(() => expire(account.id), QUEUE_MS),
      });
      match();
    },

    /** Stop looking for a game. */
    leave: (account: Account) => {
      if (removeFromQueue(account.id)) {
        tell(account.id, { type: "idle" });
        tellQueue();
      }
    },

    /** A square played; refused unless it is this account's legal move. */
    move: (account: Account, move: Move) => {
      const room = rooms.get(account.id);

      if (!room) {
        tell(account.id, { message: "You are not in a game.", type: "error" });

        return;
      }

      if (room.game.turn !== colourOf(room, account.id)) {
        tell(account.id, { message: "It is not your turn.", type: "error" });

        return;
      }

      const game = play(room.game, move);

      if (game === room.game) {
        tell(account.id, {
          message: "That square cannot be played.",
          type: "error",
        });

        return;
      }

      room.game = game;
      room.moves = [...room.moves, move];

      if (game.over) {
        finish(room, game.winner, game.winner ? "line" : "full");

        return;
      }

      startClock(room);
      tellRoom(room);
    },
  };
};

export type Lobby = ReturnType<typeof createLobby>;
