import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

import { brewRequest } from "../src/games/booster-potion/api";
import type { Book, BrewAnswer } from "../src/games/booster-potion/api";
import { bookOf, brew, foundPageOf } from "../src/games/booster-potion/brewing";
import { isValidSelection } from "../src/games/booster-potion/rules";
import type { Selection } from "../src/games/booster-potion/rules";
import {
  clientMessage,
  parseMessage,
} from "../src/games/super-tic-tac-toe/online/protocol";
import { createLimiter } from "./limiter";
import type { Client, Lobby } from "./lobby";
import type { BrewLog, Recorded } from "./potions";
import type { Leaderboard } from "./scores";
import { shortName } from "./session";
import type { SessionAccount, WhoIs } from "./session";

/** Pings an open socket this often, so idle connections are not dropped. */
const HEARTBEAT_MS = 30_000;

/** Enough for anyone mixing by hand; too few to try every mix in a night. */
const BREWS_PER_MINUTE = 30;

/**
 * What a brew request put in the cauldron, or null when it is not JSON, not
 * a cauldron, or a cauldron that cannot be: an ingredient that is not in the
 * pantry, a form it does not come in, too few or too many.
 */
const readCauldron = async (request: Request): Promise<Selection | null> => {
  try {
    const parsed = brewRequest.safeParse(await request.json());

    return parsed.success && isValidSelection(parsed.data.ingredients)
      ? parsed.data.ingredients
      : null;
  } catch {
    return null;
  }
};

interface AppOptions {
  lobby: Lobby;
  whoIs: WhoIs;
  readLeaderboard: (userId: string | null) => Promise<Leaderboard>;
  /** Booster Potion's shared recipe book. */
  potions: {
    readBrews: (userId: string | null) => Promise<BrewLog>;
    recordBrew: (potion: string, account: SessionAccount) => Promise<Recorded>;
  };
  /** The site's own origin; sockets from any other are refused. */
  appOrigin: string;
}

interface Variables {
  account: { id: string; name: string };
}

/**
 * The server's routes: /api for who is signed in, the leaderboard and
 * Booster Potion's recipe book, and /ws, the socket online games are played
 * over. Who a socket belongs to comes
 * from the shared irmahs.dev sign-in cookie, asked of the account service
 * when the socket opens, never from anything sent over it.
 */
export const createApp = ({
  lobby,
  whoIs,
  readLeaderboard,
  potions,
  appOrigin,
}: AppOptions) => {
  const app = new Hono<{ Variables: Variables }>();
  const brews = createLimiter({ max: BREWS_PER_MINUTE, windowMs: 60_000 });
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

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

  app.get("/api/leaderboard", async (c) => {
    const { account } = await whoIs(c.req.header("cookie"));

    return c.json(await readLeaderboard(account?.id ?? null));
  });

  app.get("/api/potions", async (c) => {
    const { account } = await whoIs(c.req.header("cookie"));
    const log = await potions.readBrews(account?.id ?? null);

    return c.json({ pages: bookOf(log) } satisfies Book);
  });

  // The server brews, so the page never needs the recipes: it sends what is
  // in the cauldron and hears back a potion or a hint.
  app.post("/api/potions/brew", async (c) => {
    // The sign-in cookie reaches here from any irmahs.dev page.
    if (c.req.header("origin") !== appOrigin) {
      return c.text("Brews are only taken from the site itself.", 403);
    }

    const { account } = await whoIs(c.req.header("cookie"));

    if (!account) {
      return c.text("Sign in to brew.", 401);
    }

    if (!brews.allow(account.id)) {
      return c.text("The cauldron needs a moment. Try again in a minute.", 429);
    }

    const cauldron = await readCauldron(c.req.raw);

    if (!cauldron) {
      return c.text("That brew was not understood.", 400);
    }

    const log = await potions.readBrews(account.id);
    const result = brew(cauldron, new Set(log.keys()));

    if (result.type === "mystery") {
      return c.json(result satisfies BrewAnswer);
    }

    const { brewers, first, isNew } = await potions.recordBrew(
      result.recipe.name,
      { id: account.id, name: shortName(account.name) }
    );

    return c.json({
      first,
      isNew,
      page: foundPageOf(result.recipe, brewers),
      type: "potion",
    } satisfies BrewAnswer);
  });

  app.get(
    "/ws",
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
      const client: Client = { send: () => null };

      return {
        onClose: () => {
          clearInterval(heartbeat);
          lobby.disconnect(account, client);
        },
        onMessage: (event) => {
          const message = parseMessage(clientMessage, String(event.data));

          if (!message) {
            client.send({
              message: "That message was not understood.",
              type: "error",
            });

            return;
          }

          switch (message.type) {
            case "join": {
              lobby.join(account);
              break;
            }

            case "leave": {
              lobby.leave(account);
              break;
            }

            case "move": {
              lobby.move(account, { board: message.board, cell: message.cell });
              break;
            }

            default: {
              break;
            }
          }
        },
        onOpen: (_event, socket) => {
          client.send = (message) => socket.send(JSON.stringify(message));
          heartbeat = setInterval(() => socket.raw?.ping(), HEARTBEAT_MS);
          lobby.connect(account, client);
        },
      };
    })
  );

  return { app, injectWebSocket };
};
