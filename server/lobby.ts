/** A room closes after this long with no move; whoever's turn it was loses. */
export const ROOM_IDLE_MS = 5 * 60_000;

/** Nobody to play after this long in the queue: stop looking. */
export const QUEUE_MS = 5 * 60_000;

/** How long a finished game's result waits for a player who reconnects. */
const RESULT_MS = 5 * 60_000;

/**
 * What a lobby needs to know about the game it runs: two sides, how a game
 * starts and moves on, whose turn it is, when and how it ends, and what it is
 * worth. Each online game gives its own (server/games.ts); the queue, the
 * rooms and the clocks are the same for all of them.
 */
export interface Rules<G, M, P extends string, E extends string> {
  /** The two sides; a new room seats its players in them at random. */
  sides: readonly [P, P];
  other: (side: P) => P;
  newGame: () => G;
  /** The game after a move: the very same game when the move is refused. */
  play: (game: G, move: M) => G;
  turn: (game: G) => P;
  /** Whether it is over, who won, and how it ended. */
  result: (game: G) => { over: boolean; winner: P | null; ending: E };
  /** How a game ends when the player to move lets the clock run out. */
  timeout: E;
  /** What a refused move is told, in English (src/lib/server-words.ts has its French). */
  refused: string;
  points: (game: G, moves: readonly M[], winner: P | null) => Record<P, number>;
}

/** What a lobby tells a socket: where its account stands, whenever that changes. */
export type LobbyMessage<M, P extends string, E extends string> =
  // Neither looking for a game nor in one.
  | { type: "idle" }
  // In the queue; `waiting` counts everyone in it, this player included.
  | { type: "queued"; remainingMs: number; waiting: number }
  // Five minutes in the queue and nobody came.
  | { type: "expired" }
  // In a game: sent when it starts, after every move, and on reconnecting.
  | { type: "room"; moves: M[]; opponent: string; you: P; remainingMs: number }
  // The game is over; `points` is what it was worth to this player.
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

/** A signed-in player, as the account service named them. */
export interface Account {
  id: string;
  name: string;
}

/** One open socket. An account may have several, one per tab. */
export interface Client<M, P extends string, E extends string> {
  send: (message: LobbyMessage<M, P, E>) => void;
}

export interface FinishedGame<M, P extends string, E extends string> {
  players: Record<P, Account>;
  moves: M[];
  winner: P | null;
  ending: E;
  points: Record<P, number>;
}

type Timer = ReturnType<typeof setTimeout>;

interface Room<G, M, P extends string> {
  players: Record<P, Account>;
  moves: M[];
  game: G;
  deadline: number;
  timer?: Timer;
}

interface Waiting {
  account: Account;
  deadline: number;
  timer: Timer;
}

interface LobbyOptions<G, M, P extends string, E extends string> {
  rules: Rules<G, M, P, E>;
  /** Called once per finished game, to put its points on the leaderboard. */
  onFinish: (game: FinishedGame<M, P, E>) => void;
  /** Picks who plays which side. */
  random?: () => number;
  now?: () => number;
}

/** A lobby, whatever its game: what the socket route and main.ts hold */
export interface Lobby<M, P extends string, E extends string> {
  /** Stops every clock: for tests, and for shutting down. */
  close: () => void;
  /** A socket opened: it hears where its account stands. */
  connect: (account: Account, client: Client<M, P, E>) => void;
  /**
   * A socket closed. An account with no socket left gives up its place in
   * the queue; a game goes on, and its clock decides if they do not return.
   */
  disconnect: (account: Account, client: Client<M, P, E>) => void;
  /** Look for a game. One place per account, however many tabs ask. */
  join: (account: Account) => void;
  /** Stop looking for a game. */
  leave: (account: Account) => void;
  /** A move; refused unless it is this account's legal move. */
  move: (account: Account, move: M) => void;
}

/**
 * The online queue and the games being played, kept in memory: a deploy
 * restarts the server and ends them. The first two people in the queue play
 * each other in a room of their own; the room's clock restarts on every move,
 * and when it runs out the player whose turn it was loses. The server checks
 * every move with the same rules as the board in the browser.
 */
export const createLobby = <G, M, P extends string, E extends string>({
  rules,
  onFinish,
  random = Math.random,
  now = Date.now,
}: LobbyOptions<G, M, P, E>): Lobby<M, P, E> => {
  type Message = LobbyMessage<M, P, E>;

  type GameRoom = Room<G, M, P>;

  const [first, second] = rules.sides;
  const clients = new Map<string, Set<Client<M, P, E>>>();
  const queue: Waiting[] = [];
  const rooms = new Map<string, GameRoom>();
  const results = new Map<string, { message: Message; timer: Timer }>();

  const tell = (accountId: string, message: Message) => {
    for (const client of clients.get(accountId) ?? []) {
      client.send(message);
    }
  };

  const sideOf = (room: GameRoom, accountId: string): P =>
    room.players[first].id === accountId ? first : second;

  const seatOf = (room: GameRoom, side: P) => ({
    moves: room.moves,
    opponent: room.players[rules.other(side)].name,
    you: side,
  });

  const roomMessage = (room: GameRoom, side: P): Message => ({
    ...seatOf(room, side),
    remainingMs: Math.max(0, room.deadline - now()),
    type: "room",
  });

  const tellRoom = (room: GameRoom) => {
    for (const side of rules.sides) {
      tell(room.players[side].id, roomMessage(room, side));
    }
  };

  const queuedMessage = (waiting: Waiting): Message => ({
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

  const remember = (accountId: string, message: Message) => {
    forget(accountId);
    results.set(accountId, {
      message,
      timer: setTimeout(() => results.delete(accountId), RESULT_MS),
    });
  };

  /** Where an account stands now: what a newly opened socket is told. */
  const status = (accountId: string): Message => {
    const room = rooms.get(accountId);

    if (room) {
      return roomMessage(room, sideOf(room, accountId));
    }

    const waiting = queue.find((entry) => entry.account.id === accountId);

    if (waiting) {
      return queuedMessage(waiting);
    }

    return results.get(accountId)?.message ?? { type: "idle" };
  };

  const finish = (room: GameRoom, winner: P | null, ending: E) => {
    clearTimeout(room.timer);

    const points = rules.points(room.game, room.moves, winner);

    for (const side of rules.sides) {
      const { id } = room.players[side];

      const message: Message = {
        ...seatOf(room, side),
        ending,
        points: points[side],
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

  const startClock = (room: GameRoom) => {
    clearTimeout(room.timer);
    room.deadline = now() + ROOM_IDLE_MS;
    room.timer = setTimeout(
      () => finish(room, rules.other(rules.turn(room.game)), rules.timeout),
      ROOM_IDLE_MS
    );
  };

  /** Pairs the queue off from the front, two by two, into rooms. */
  const match = () => {
    while (queue.length >= 2) {
      const [one, two] = queue.splice(0, 2);

      if (!(one && two)) {
        break;
      }

      clearTimeout(one.timer);
      clearTimeout(two.timer);

      const [a, b] =
        random() < 0.5
          ? [one.account, two.account]
          : [two.account, one.account];

      // SAFETY: an object with exactly the two sides as keys
      const players = { [first]: a, [second]: b } as Record<P, Account>;

      const room: GameRoom = {
        deadline: 0,
        game: rules.newGame(),
        moves: [],
        players,
      };

      for (const account of [a, b]) {
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

    connect: (account, client) => {
      const open = clients.get(account.id) ?? new Set<Client<M, P, E>>();

      open.add(client);
      clients.set(account.id, open);
      client.send(status(account.id));
    },

    disconnect: (account, client) => {
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

    join: (account) => {
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

    leave: (account) => {
      if (removeFromQueue(account.id)) {
        tell(account.id, { type: "idle" });
        tellQueue();
      }
    },

    move: (account, move) => {
      const room = rooms.get(account.id);

      if (!room) {
        tell(account.id, { message: "You are not in a game.", type: "error" });

        return;
      }

      if (rules.turn(room.game) !== sideOf(room, account.id)) {
        tell(account.id, { message: "It is not your turn.", type: "error" });

        return;
      }

      const game = rules.play(room.game, move);

      if (game === room.game) {
        tell(account.id, { message: rules.refused, type: "error" });

        return;
      }

      room.game = game;
      room.moves = [...room.moves, move];

      const result = rules.result(game);

      if (result.over) {
        finish(room, result.winner, result.ending);

        return;
      }

      startClock(room);
      tellRoom(room);
    },
  };
};
