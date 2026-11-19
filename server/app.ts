import { upgradeWebSocket } from "@hono/node-server";
import { Hono } from "hono";
import { WebSocket } from "ws";
import type * as z from "zod/mini";

import { noteRequest, voteRequest } from "../src/board/api";
import type { Board, Note, NoteRequest } from "../src/board/api";
import { NOTES_PER_DAY, isValidBody, tidy } from "../src/board/rules";
import type { Vote } from "../src/board/rules";
import { clientMessage as oukMessage } from "../src/games/ouk-chaktrang/online/protocol";
import type * as ouk from "../src/games/ouk-chaktrang/rules";
import {
  accountResultOf,
  keepable,
  resultRequest,
} from "../src/games/quizzes/account-result";
import { QUIZZES } from "../src/games/quizzes/all-quizzes";
import type { Quiz } from "../src/games/quizzes/quiz";
import { clientMessage as stttMessage } from "../src/games/super-tic-tac-toe/online/protocol";
import type * as sttt from "../src/games/super-tic-tac-toe/rules";
import type { Ending as StttEnding } from "../src/games/super-tic-tac-toe/scoring";
import { parseMessage } from "../src/lib/parse-message";
import { createLimiter } from "./limiter";
import type { Client, Lobby } from "./lobby";
import type { KeptResult } from "./quiz-results";
import type { Leaderboard } from "./scores";
import { shortName } from "./session";
import type { IsAdmin, SessionAccount, WhoIs } from "./session";

/** Pings an open socket this often, so idle connections are not dropped. */
const HEARTBEAT_MS = 30_000;

/**
 * A request's JSON body as `schema` reads it, or null when it is not JSON or
 * not of that shape.
 */
const readBody = async <T>(
  request: Request,
  schema: z.ZodMiniType<T>
): Promise<T | null> =>
  parseMessage(schema, await request.text().catch(() => ""));

/**
 * The note a request asks to stick up, tidied, or null when it is not JSON,
 * not a note, or a note that cannot go up: empty or too long.
 */
const readNote = async (request: Request): Promise<NoteRequest | null> => {
  const parsed = await readBody(request, noteRequest);

  if (!parsed) {
    return null;
  }

  const body = tidy(parsed.body);

  return isValidBody(body) ? { body, colour: parsed.colour } : null;
};

/** The vote a request gives, or null when it is not one. */
const readVote = async (request: Request): Promise<Vote | null> => {
  const parsed = await readBody(request, voteRequest);

  return parsed ? parsed.vote : null;
};

/** Plenty for anyone reading the board; too few to stuff a count. */
const VOTES_PER_MINUTE = 60;

/** Plenty for anyone finishing a quiz; too few to hammer the database. */
const RESULTS_PER_MINUTE = 20;

/** The quiz at /quizzes/`slug`, if its result shows on a profile; null otherwise. */
const profileQuiz = (slug: string): Quiz | null =>
  QUIZZES.find((quiz) => quiz.slug === slug && quiz.profile) ?? null;

/** The result a request asks to keep, or null when it is not JSON or not one. */
const readResultRequest = async (request: Request, quiz: Quiz) => {
  const parsed = await readBody(request, resultRequest);

  return parsed ? keepable(quiz, parsed) : null;
};

/** A note's id as the database has it: a bigint, so at most 18 digits. */
const NOTE_ID = /^\d{1,18}$/u;

/** The games played online, each with its own socket and leaderboard */
export type OnlineGame = "super-tic-tac-toe" | "ouk-chaktrang";

interface AppOptions {
  lobbies: {
    superTicTacToe: Lobby<sttt.Move, sttt.Player, StttEnding>;
    oukChaktrang: Lobby<ouk.Move, ouk.Side, ouk.Ending>;
  };
  whoIs: WhoIs;
  readLeaderboard: (
    game: OnlineGame,
    userId: string | null
  ) => Promise<Leaderboard>;
  /** The hub's sticky board. */
  notes: {
    /** The notes up now, with the votes `userId` gave them. */
    readNotes: (userId: string | null) => Promise<Note[]>;
    countNotes: (userId: string) => Promise<number>;
    postNote: (
      userId: string,
      note: NoteRequest,
      limit: number
    ) => Promise<Note | null>;
    removeNote: (id: string) => Promise<boolean>;
    /** False when there is no such note up. */
    voteNote: (userId: string, id: string, vote: Vote) => Promise<boolean>;
  };
  /** Quiz results kept on accounts, for profiles elsewhere on irmahs.dev. */
  quizResults: {
    read: (userId: string, quiz: string) => Promise<KeptResult | null>;
    save: (userId: string, quiz: string, result: KeptResult) => Promise<void>;
    remove: (userId: string, quiz: string) => Promise<void>;
  };
  /** Whether a visitor can take notes down, from their cookie. */
  isAdmin: IsAdmin;
  /** The site's own origin; sockets from any other are refused. */
  appOrigin: string;
}

interface Variables {
  account: { id: string; name: string };
}

/**
 * The server's routes: /api for who is signed in, the leaderboard, the
 * quiz results kept on accounts and the hub's sticky board, and the sockets
 * online games are played over: /ws for Super Tic-Tac-Toe and
 * /ws/ouk-chaktrang for Ouk Chaktrang. Who a socket belongs to comes
 * from the shared irmahs.dev sign-in cookie, asked of the account service
 * when the socket opens, never from anything sent over it.
 */
export const createApp = ({
  lobbies,
  whoIs,
  readLeaderboard,
  notes,
  quizResults,
  isAdmin,
  appOrigin,
}: AppOptions) => {
  const app = new Hono<{ Variables: Variables }>();
  const votes = createLimiter({ max: VOTES_PER_MINUTE, windowMs: 60_000 });
  const results = createLimiter({ max: RESULTS_PER_MINUTE, windowMs: 60_000 });

  app.get("/healthz", (c) => c.text("ok"));

  // Answers carry account data or change with every game.
  app.use("/api/*", (c, next) => {
    c.header("cache-control", "no-store");

    return next();
  });

  app.get("/api/me", async (c) => {
    const { account, setCookies } = await whoIs(c.req.header("cookie"));

    for (const cookie of setCookies) {
      c.header("set-cookie", cookie, { append: true });
    }

    return c.json({
      account: account ? { name: shortName(account.name) } : null,
    });
  });

  // Super Tic-Tac-Toe's at /api/leaderboard, as it always was
  for (const [path, game] of [
    ["/api/leaderboard", "super-tic-tac-toe"],
    ["/api/ouk-chaktrang/leaderboard", "ouk-chaktrang"],
  ] as const) {
    app.get(path, async (c) => {
      const { account } = await whoIs(c.req.header("cookie"));

      return c.json(await readLeaderboard(game, account?.id ?? null));
    });
  }

  // A quiz result on the visitor's account, for a quiz shown on a profile
  // elsewhere: Realms' server asks for the witch quiz's with the visitor's
  // cookie, for their Book of Shadows. Signed out, there is none to read.
  app.get("/api/quizzes/:slug/result", async (c) => {
    const quiz = profileQuiz(c.req.param("slug"));

    if (!quiz) {
      return c.text("That quiz's results stay in the browser.", 404);
    }

    const { account } = await whoIs(c.req.header("cookie"));

    if (!account) {
      return c.json({ result: null, signedIn: false });
    }

    const kept = await quizResults.read(account.id, quiz.slug);
    const result = kept ? accountResultOf(quiz, kept) : null;

    return c.json({
      result: result && result.ranked.length > 0 ? result : null,
      signedIn: true,
    });
  });

  // Keeps a finished quiz's result on the visitor's account, over the last:
  // from the site itself only, since the cookie reaches here from any
  // irmahs.dev page, and only results the quiz could give.
  app.put("/api/quizzes/:slug/result", async (c) => {
    if (c.req.header("origin") !== appOrigin) {
      return c.text("Results are only kept from the site itself.", 403);
    }

    const quiz = profileQuiz(c.req.param("slug"));

    if (!quiz) {
      return c.text("That quiz's results stay in the browser.", 404);
    }

    const { account } = await whoIs(c.req.header("cookie"));

    if (!account) {
      return c.text("Sign in to keep your result.", 401);
    }

    if (!results.allow(account.id)) {
      return c.text("That's a lot of results. Try again in a minute.", 429);
    }

    const kept = await readResultRequest(c.req.raw, quiz);

    if (!kept) {
      return c.text("That result can't be kept.", 400);
    }

    await quizResults.save(account.id, quiz.slug, kept);

    return c.json({ result: accountResultOf(quiz, kept), signedIn: true });
  });

  // Takes the visitor's result off their account; the browser keeps its own.
  app.delete("/api/quizzes/:slug/result", async (c) => {
    if (c.req.header("origin") !== appOrigin) {
      return c.text("Results are only taken off from the site itself.", 403);
    }

    const quiz = profileQuiz(c.req.param("slug"));

    if (!quiz) {
      return c.text("That quiz's results stay in the browser.", 404);
    }

    const { account } = await whoIs(c.req.header("cookie"));

    if (!account) {
      return c.text("Sign in to take your result off.", 401);
    }

    await quizResults.remove(account.id, quiz.slug);

    return c.json({ result: null, signedIn: true });
  });

  /**
   * The board as a visitor sees it, from their cookie: never who stuck a
   * note or who voted. An admin is asked of the account service only when
   * signed in.
   */
  const boardFor = async (
    account: SessionAccount | null,
    cookie: string | undefined
  ): Promise<Board> => {
    const [up, mine, admin] = await Promise.all([
      notes.readNotes(account?.id ?? null),
      account ? notes.countNotes(account.id) : null,
      account ? isAdmin(cookie) : false,
    ]);

    return {
      admin,
      left: mine === null ? null : Math.max(0, NOTES_PER_DAY - mine),
      notes: up,
    };
  };

  app.get("/api/board", async (c) => {
    const cookie = c.req.header("cookie");
    const { account } = await whoIs(cookie);

    return c.json(await boardFor(account, cookie));
  });

  // Notes go up only from the site itself, since the sign-in cookie reaches
  // here from any irmahs.dev page, and only from someone signed in: the
  // board never shows who, but holds each person to their notes a day.
  app.post("/api/board/notes", async (c) => {
    if (c.req.header("origin") !== appOrigin) {
      return c.text("Notes are only taken from the site itself.", 403);
    }

    const { account } = await whoIs(c.req.header("cookie"));

    if (!account) {
      return c.text("Sign in to stick a note.", 401);
    }

    const note = await readNote(c.req.raw);

    if (!note) {
      return c.text("That note can't go up.", 400);
    }

    const posted = await notes.postNote(account.id, note, NOTES_PER_DAY);

    if (!posted) {
      return c.text(
        `That's your ${NOTES_PER_DAY} notes for today. More once one comes down.`,
        429
      );
    }

    return c.json(await boardFor(account, c.req.header("cookie")));
  });

  // A thumbs up or down from someone signed in, on the site itself: one
  // each per note, which they can change or take back (0).
  app.put("/api/board/notes/:id/vote", async (c) => {
    if (c.req.header("origin") !== appOrigin) {
      return c.text("Votes are only taken from the site itself.", 403);
    }

    const cookie = c.req.header("cookie");
    const { account } = await whoIs(cookie);

    if (!account) {
      return c.text("Sign in to vote.", 401);
    }

    if (!votes.allow(account.id)) {
      return c.text("That's a lot of votes. Try again in a minute.", 429);
    }

    const vote = await readVote(c.req.raw);

    if (vote === null) {
      return c.text("That vote was not understood.", 400);
    }

    const id = c.req.param("id");

    if (!(NOTE_ID.test(id) && (await notes.voteNote(account.id, id, vote)))) {
      return c.text("There is no such note.", 404);
    }

    return c.json(await boardFor(account, cookie));
  });

  // Takes a note down before its day is up: admins only, listed for
  // ADMIN_APP in the account service's APP_ACCESS.
  app.delete("/api/board/notes/:id", async (c) => {
    if (c.req.header("origin") !== appOrigin) {
      return c.text("Notes are only taken down from the site itself.", 403);
    }

    const { account } = await whoIs(c.req.header("cookie"));

    if (!account) {
      return c.text("Sign in to take a note down.", 401);
    }

    if (!(await isAdmin(c.req.header("cookie")))) {
      return c.text("Only an admin can take a note down.", 403);
    }

    const id = c.req.param("id");

    if (!(NOTE_ID.test(id) && (await notes.removeNote(id)))) {
      return c.text("There is no such note.", 404);
    }

    return c.body(null, 204);
  });

  /**
   * A game's socket: signed in, from the site itself, and every message
   * parsed before it reaches the lobby. `moveOf` reads a move message's move.
   */
  const gameSocket = <
    M,
    P extends string,
    E extends string,
    C extends { type: string },
  >(
    path: string,
    lobby: Lobby<M, P, E>,
    schema: z.ZodMiniType<C>,
    moveOf: (message: C) => M | null
  ) =>
    app.get(
      path,
      async (c, next) => {
        // Browsers always send Origin on a socket; the shared cookie would
        // otherwise vouch for a page on any irmahs.dev subdomain.
        if (c.req.header("origin") !== appOrigin) {
          return c.text("Sockets are only accepted from the site itself.", 403);
        }

        const { account } = await whoIs(c.req.header("cookie"));

        if (!account) {
          return c.text("Sign in to play online.", 401);
        }

        c.set("account", { id: account.id, name: shortName(account.name) });

        return await next();
      },
      upgradeWebSocket((c) => {
        const account = c.get("account");
        let heartbeat: ReturnType<typeof setInterval> | undefined;
        // Replaced once the socket is open; nothing is sent before that.
        const client: Client<M, P, E> = { send: () => null };

        return {
          onClose: () => {
            clearInterval(heartbeat);
            lobby.disconnect(account, client);
          },
          onMessage: (event) => {
            const message = parseMessage(schema, String(event.data));

            if (!message) {
              client.send({
                message: "That message was not understood.",
                type: "error",
              });

              return;
            }

            if (message.type === "join") {
              lobby.join(account);
            } else if (message.type === "leave") {
              lobby.leave(account);
            } else {
              const move = moveOf(message);

              if (move) {
                lobby.move(account, move);
              }
            }
          },
          onOpen: (_event, socket) => {
            client.send = (message) => socket.send(JSON.stringify(message));
            // The ping is ws's own, so only a ws socket is asked for one
            const { raw } = socket;
            heartbeat = setInterval(() => {
              if (raw instanceof WebSocket) {
                raw.ping();
              }
            }, HEARTBEAT_MS);
            lobby.connect(account, client);
          },
        };
      })
    );

  gameSocket("/ws", lobbies.superTicTacToe, stttMessage, (message) =>
    message.type === "move"
      ? { board: message.board, cell: message.cell }
      : null
  );
  gameSocket(
    "/ws/ouk-chaktrang",
    lobbies.oukChaktrang,
    oukMessage,
    (message) =>
      message.type === "move" ? { from: message.from, to: message.to } : null
  );

  return { app };
};
