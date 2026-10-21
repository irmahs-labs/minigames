import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

import {
  clientMessage,
  parseMessage,
} from "../src/games/super-tic-tac-toe/online/protocol";
import type { Client, Lobby } from "./lobby";
import type { Leaderboard } from "./scores";
import { shortName } from "./session";
import type { WhoIs } from "./session";

/** Pings an open socket this often, so idle connections are not dropped. */
const HEARTBEAT_MS = 30_000;

interface AppOptions {
  lobby: Lobby;
  whoIs: WhoIs;
  readLeaderboard: (userId: string | null) => Promise<Leaderboard>;
  /** The site's own origin; sockets from any other are refused. */
  appOrigin: string;
}

interface Variables {
  account: { id: string; name: string };
}

/**
 * The server's routes: /api for who is signed in and the leaderboard, and
 * /ws, the socket online games are played over. Who a socket belongs to comes
 * from the shared irmahs.dev sign-in cookie, asked of the account service
 * when the socket opens, never from anything sent over it.
 */
export const createApp = ({
  lobby,
  whoIs,
  readLeaderboard,
  appOrigin,
}: AppOptions) => {
  const app = new Hono<{ Variables: Variables }>();
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
