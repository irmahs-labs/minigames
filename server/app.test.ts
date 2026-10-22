// @vitest-environment node
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { serve } from "@hono/node-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WebSocket } from "ws";

import type { Brewers } from "../src/games/booster-potion/brewing";
import type { ServerMessage } from "../src/games/super-tic-tac-toe/online/protocol";
import { createApp } from "./app";
import { createLobby } from "./lobby";
import type { Leaderboard } from "./scores";
import type { WhoIs } from "./session";

const ORIGIN = "http://localhost:5173";
const ANA = { id: "00000000-0000-4000-8000-00000000000a", name: "Ana Lopez" };
const BEN = { id: "00000000-0000-4000-8000-00000000000b", name: "Ben" };
const CY = { id: "00000000-0000-4000-8000-00000000000c", name: "Cy" };

/** Stands in for the account service: a cookie per test account. */
const ACCOUNTS = new Map([
  ["session=ana", ANA],
  ["session=ben", BEN],
  ["session=cy", CY],
]);

const whoIs: WhoIs = (cookie) =>
  Promise.resolve({
    account: (cookie && ACCOUNTS.get(cookie)) || null,
    setCookies: [],
  });

const lobby = createLobby({ onFinish: () => null, random: () => 0 });

/** Stands in for the potion_brews table: who brewed what, in order. */
const brewLog: { potion: string; id: string; name: string }[] = [];

const brewersOf = (potion: string, userId: string | null): Brewers => {
  const rows = brewLog.filter((row) => row.potion === potion);

  return {
    by: rows[0]?.name ?? "",
    count: rows.length,
    yours: rows.some((row) => row.id === userId),
  };
};

const potions = {
  readBrews: (userId: string | null) =>
    Promise.resolve(
      new Map(
        [...new Set(brewLog.map((row) => row.potion))].map((potion) => [
          potion,
          brewersOf(potion, userId),
        ])
      )
    ),
  recordBrew: (potion: string, account: { id: string; name: string }) => {
    const isNew = !brewLog.some(
      (row) => row.potion === potion && row.id === account.id
    );

    if (isNew) {
      brewLog.push({ id: account.id, name: account.name, potion });
    }

    const brewers = brewersOf(potion, account.id);

    return Promise.resolve({
      brewers,
      first: isNew && brewers.count === 1,
      isNew,
    });
  },
};

const askedFor: (string | null)[] = [];

const { app, injectWebSocket } = createApp({
  appOrigin: ORIGIN,
  lobby,
  potions,
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

/** The classic ginger shot: Ember's Embrace. */
const GINGER_SHOT = [
  { name: "Apple" },
  { name: "Lime" },
  { form: "fresh", name: "Ginger" },
  { name: "Cayenne" },
];

const MYSTERY = [{ name: "Kale" }, { name: "Mango" }];

/** What a page might send, sense or not: a test sends some of each. */
type Sent = readonly { name: string; form?: string }[] | string;

const brewAs = (cookie: string, ingredients: Sent, origin = ORIGIN) =>
  fetch(`http://${base}/api/potions/brew`, {
    body: JSON.stringify({ ingredients }),
    headers: { "content-type": "application/json", cookie, origin },
    method: "POST",
  });

const statusOf = async (response: Promise<Response>) => {
  const { status } = await response;

  return status;
};

const bodyOf = async (response: Promise<Response>) => {
  const answer = await response;

  return answer.json();
};

describe("/api/potions", () => {
  it("shows everyone the book, every page locked until someone brews it", async () => {
    const { pages } = await bodyOf(fetch(`http://${base}/api/potions`));

    expect(pages).toHaveLength(100);
    expect(pages[0]).toEqual({ clue: expect.any(String), state: "locked" });
  });

  it("takes brews only from the site itself, and only signed in", async () => {
    const elsewhere = "https://evil.irmahs.dev";

    expect(await statusOf(brewAs("session=ana", GINGER_SHOT, elsewhere))).toBe(
      403
    );
    expect(await statusOf(brewAs("", GINGER_SHOT))).toBe(401);
  });

  it("refuses a cauldron that cannot be", async () => {
    const powderedGinger = [
      { name: "Lemon" },
      { form: "powder", name: "Ginger" },
    ];

    const newt = [{ name: "Newt" }, { name: "Lemon" }];

    expect(await statusOf(brewAs("session=ana", powderedGinger))).toBe(400);
    expect(await statusOf(brewAs("session=ana", newt))).toBe(400);
    expect(await statusOf(brewAs("session=ana", "soup"))).toBe(400);
  });

  it("hints at a mystery and writes nothing down", async () => {
    const answer = await bodyOf(brewAs("session=ana", MYSTERY));

    expect(answer).toMatchObject({ size: 2, type: "mystery" });
    expect(brewLog).toEqual([]);
  });

  it("puts the first brewer's name on the page, and counts the rest", async () => {
    expect(await bodyOf(brewAs("session=ana", GINGER_SHOT))).toMatchObject({
      first: true,
      isNew: true,
      page: { by: "Ana L.", name: "Ember's Embrace", others: 0, yours: true },
      type: "potion",
    });

    expect(await bodyOf(brewAs("session=ben", GINGER_SHOT))).toMatchObject({
      first: false,
      isNew: true,
      page: { by: "Ana L.", others: 1, yours: true },
    });

    expect(await bodyOf(brewAs("session=ben", GINGER_SHOT))).toMatchObject({
      first: false,
      isNew: false,
    });

    const book = await bodyOf(
      fetch(`http://${base}/api/potions`, {
        headers: { cookie: "session=ben" },
      })
    );

    expect(book.pages[0]).toMatchObject({
      by: "Ana L.",
      ingredients: ["Apple", "Lime", "Fresh ginger", "Cayenne"],
      state: "found",
      yours: true,
    });
  });

  it("lets nobody try every mix in a hurry", async () => {
    const statuses: number[] = [];

    for (let i = 0; i < 31; i += 1) {
      // One after another, as a player would.
      // oxlint-disable-next-line no-await-in-loop
      statuses.push(await statusOf(brewAs("session=cy", MYSTERY)));
    }

    expect(statuses.slice(0, 30).every((status) => status === 200)).toBe(true);
    expect(statuses[30]).toBe(429);
  });
});
