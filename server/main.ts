import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import { createApp } from "./app";
import { connect } from "./db";
import { env } from "./env";
import { createLobby } from "./lobby";
import type { FinishedGame } from "./lobby";
import { readBrews, recordBrew } from "./potions";
import { readLeaderboard, recordGame } from "./scores";
import { askAccountService } from "./session";

const pool = connect(env.databaseUrl);

/**
 * Saves a finished game. One that cannot be saved still ended for its
 * players; the error is logged and the leaderboard misses that one game.
 */
const saveGame = async (game: FinishedGame) => {
  try {
    await recordGame(pool, game);
  } catch (error) {
    console.error("Could not save a finished game", error);
  }
};

const lobby = createLobby({
  onFinish: (game) => {
    void saveGame(game);
  },
});

const { app, injectWebSocket } = createApp({
  appOrigin: env.appOrigin,
  lobby,
  potions: {
    readBrews: (userId) => readBrews(pool, userId),
    recordBrew: (potion, account) => recordBrew(pool, potion, account),
  },
  readLeaderboard: (userId) => readLeaderboard(pool, userId),
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

const server = serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`minigames listening on :${info.port}`);
});

injectWebSocket(server);
