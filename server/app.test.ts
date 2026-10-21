// @vitest-environment node
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { serve } from "@hono/node-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WebSocket } from "ws";

import type { ServerMessage } from "../src/games/super-tic-tac-toe/online/protocol";
import { createApp } from "./app";
import { createLobby } from "./lobby";
import type { Leaderboard } from "./scores";
import type { WhoIs } from "./session";

const ORIGIN = "http://localhost:5173";
const ANA = { id: "00000000-0000-4000-8000-00000000000a", name: "Ana Lopez" };
const BEN = { id: "00000000-0000-4000-8000-00000000000b", name: "Ben" };

/** Stands in for the account service: a cookie per test account. */
const ACCOUNTS = new Map([
  ["session=ana", ANA],
  ["session=ben", BEN],
]);

const whoIs: WhoIs = (cookie) =>
  Promise.resolve({
    account: (cookie && ACCOUNTS.get(cookie)) || null,
    setCookies: [],
  });

const lobby = createLobby({ onFinish: () => null, random: () => 0 });
const askedFor: (string | null)[] = [];

const { app, injectWebSocket } = createApp({
  appOrigin: ORIGIN,
  lobby,
  readLeaderboard: (userId): Promise<Leaderboard> => {
    askedFor.push(userId);

    return Promise.resolve({ top: [], you: null });
  },
  whoIs,
});

const server = serve({ fetch: app.fetch, port: 0 });

injectWebSocket(server);

let base = "";

beforeAll(async () => {
  if (!server.listening) {
    await once(server, "listening");
  }

  // SAFETY: a server listening on a TCP port reports an AddressInfo, never a
  // pipe name.
  const { port } = server.address() as AddressInfo;

  base = `127.0.0.1:${port}`;
});

afterAll(() => {
  lobby.close();
  server.close();
});

/** A socket as a browser would open it, and what it hears. */
const open = (cookie: string, origin = ORIGIN) => {
  const socket = new WebSocket(`ws://${base}/ws`, {
    headers: { cookie },
    origin,
  });

  const heard: ServerMessage[] = [];

  socket.on("message", (data: Buffer) => {
    heard.push(JSON.parse(data.toString()));
  });

  /** The first message of this type not yet taken, waiting for it if need be. */
  const next = async (type: ServerMessage["type"]): Promise<ServerMessage> => {
    const found = heard.find((message) => message.type === type);

    if (found) {
      heard.splice(0, heard.indexOf(found) + 1);

      return found;
    }

    await once(socket, "message");

    return next(type);
  };

  return { next, socket };
};

/** The HTTP status a refused socket was answered with. */
const refusal = async (cookie: string, origin = ORIGIN) => {
  const { socket } = open(cookie, origin);
  const [request, response] = await once(socket, "unexpected-response");

  // With this event handled, ws leaves the refused request for us to end.
  request.destroy();

  return response.statusCode;
};

describe("/ws", () => {
  it("refuses a socket from another site", async () => {
    expect(await refusal("session=ana", "https://evil.irmahs.dev")).toBe(403);
  });

  it("refuses a socket from someone signed out", async () => {
    expect(await refusal("session=nobody")).toBe(401);
  });

  it("matches two signed-in players and carries their moves", async () => {
    const ana = open("session=ana");
    const ben = open("session=ben");

    await ana.next("idle");
    await ben.next("idle");

    ana.socket.send(JSON.stringify({ type: "join" }));
    await ana.next("queued");
    ben.socket.send(JSON.stringify({ type: "join" }));

    expect(await ana.next("room")).toMatchObject({
      opponent: "Ben",
      you: "pink",
    });
    expect(await ben.next("room")).toMatchObject({
      opponent: "Ana L.",
      you: "purple",
    });

    ana.socket.send(JSON.stringify({ board: 4, cell: 4, type: "move" }));

    expect(await ben.next("room")).toMatchObject({
      moves: [{ board: 4, cell: 4 }],
    });

    ben.socket.send("not json");

    expect(await ben.next("error")).toEqual({
      message: "That message was not understood.",
      type: "error",
    });

    ana.socket.close();
    ben.socket.close();
  });
});

describe("/api", () => {
  it("names the signed-in player by first name and initial", async () => {
    const response = await fetch(`http://${base}/api/me`, {
      headers: { cookie: "session=ana" },
    });

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ account: { name: "Ana L." } });
  });

  it("reads the leaderboard for whoever asks, signed in or not", async () => {
    await fetch(`http://${base}/api/leaderboard`, {
      headers: { cookie: "session=ben" },
    });
    await fetch(`http://${base}/api/leaderboard`);

    expect(askedFor).toEqual([BEN.id, null]);
  });
});
