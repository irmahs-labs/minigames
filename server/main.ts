import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { WebSocketServer } from "ws";

import { createApp } from "./app";
import { connect } from "./db";
import { env } from "./env";
import { oukChaktrang, superTicTacToe } from "./games";
import { createLobby } from "./lobby";
import type { FinishedGame } from "./lobby";
import {
  countNotes,
  postNote,
  readNotes,
  removeNote,
  sweepNotes,
  voteNote,
} from "./notes";
import { readResult, removeResult, saveResult } from "./quiz-results";
import {
  OUK_CHAKTRANG,
  SUPER_TIC_TAC_TOE,
  readLeaderboard,
  recordGame,
} from "./scores";
import type { Board } from "./scores";
import { askAccountService, askAdminAccess } from "./session";

const pool = connect(env.databaseUrl);

/**
 * Saves a finished game. One that cannot be saved still ended for its
 * players; the error is logged and the leaderboard misses that one game.
 */
const saveGame = async <P extends string>(
  board: Board<P>,
  game: FinishedGame<unknown, P, string>
) => {
  try {
    await recordGame(pool, board, game);
  } catch (error) {
    console.error("Could not save a finished game", error);
  }
};

/**
 * Deletes the notes whose day is up. The board never shows them anyway; this
 * removes them, and who stuck them, for good. A failed sweep is tried again
 * at the next.
 */
const sweep = async () => {
  try {
    await sweepNotes(pool);
  } catch (error) {
    console.error("Could not sweep the sticky board", error);
  }
};

const SWEEP_MS = 60 * 60 * 1000;

void sweep();

setInterval(sweep, SWEEP_MS);

const lobbies = {
  oukChaktrang: createLobby({
    onFinish: (game) => {
      void saveGame(OUK_CHAKTRANG, game);
    },
    rules: oukChaktrang,
  }),
  superTicTacToe: createLobby({
    onFinish: (game) => {
      void saveGame(SUPER_TIC_TAC_TOE, game);
    },
    rules: superTicTacToe,
  }),
};

const { app } = createApp({
  appOrigin: env.appOrigin,
  isAdmin: askAdminAccess(env.authUrl),
  lobbies,
  notes: {
    countNotes: (userId) => countNotes(pool, userId),
    postNote: (userId, note, limit) => postNote(pool, userId, note, limit),
    readNotes: (userId) => readNotes(pool, userId),
    removeNote: (id) => removeNote(pool, id),
    voteNote: (userId, id, vote) => voteNote(pool, userId, id, vote),
  },
  quizResults: {
    read: (userId, quiz) => readResult(pool, userId, quiz),
    remove: (userId, quiz) => removeResult(pool, userId, quiz),
    save: (userId, quiz, result) => saveResult(pool, userId, quiz, result),
  },
  readLeaderboard: (game, userId) =>
    readLeaderboard(
      pool,
      game === "ouk-chaktrang" ? OUK_CHAKTRANG : SUPER_TIC_TAC_TOE,
      userId
    ),
  whoIs: askAccountService(env.authUrl),
});

// Production: the built site from the same origin as /api and /ws, so the
// session cookie and every request stay first-party. Any path that is not a
// file is a page of the app, which routes it itself.
if (env.staticDir) {
  const root = env.staticDir;

  app.use("/assets/*", (c, next) => {
    // Vite names every built asset after its contents, so a cached copy is never stale.
    c.header("cache-control", "public, max-age=31536000, immutable");

    return next();
  });
  app.use("*", (c, next) => {
    // The page itself is always checked, so a deploy shows at once.
    if (!c.req.path.startsWith("/assets/")) {
      c.header("cache-control", "no-cache");
    }

    return next();
  });
  app.use("*", serveStatic({ root }));
  app.get("*", serveStatic({ path: "index.html", root }));
}

// The Node server upgrades /ws itself, given a WebSocket server to hand to
serve(
  {
    fetch: app.fetch,
    port: env.port,
    websocket: { server: new WebSocketServer({ noServer: true }) },
  },
  (info) => {
    console.log(`minigames listening on :${info.port}`);
  }
);
