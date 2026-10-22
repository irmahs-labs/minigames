import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";

import { noteRequest, voteRequest } from "../src/board/api";
import type { Board, Note, NoteRequest } from "../src/board/api";
import { NOTES_PER_DAY, isValidBody, tidy } from "../src/board/rules";
import type { Vote } from "../src/board/rules";
import { brewRequest } from "../src/games/booster-potion/api";
import type {
  Book,
  BrewAnswer,
  Brewer,
  LatestBrew,
  SoloBook,
  SoloBrewAnswer,
} from "../src/games/booster-potion/api";
import {
  bookOf,
  brew,
  foundPageOf,
  isPotion,
  soloBookOf,
  soloFoundPageOf,
} from "../src/games/booster-potion/brewing";
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
import type { IsAdmin, SessionAccount, WhoIs } from "./session";

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

/**
 * The note a request asks to stick up, tidied, or null when it is not JSON,
 * not a note, or a note that cannot go up: empty or too long.
 */
const readNote = async (request: Request): Promise<NoteRequest | null> => {
  try {
    const parsed = noteRequest.safeParse(await request.json());

    if (!parsed.success) {
      return null;
    }

    const body = tidy(parsed.data.body);

    return isValidBody(body) ? { body, colour: parsed.data.colour } : null;
  } catch {
    return null;
  }
};

/** The vote a request gives, or null when it is not one. */
const readVote = async (request: Request): Promise<Vote | null> => {
  try {
    const parsed = voteRequest.safeParse(await request.json());

    return parsed.success ? parsed.data.vote : null;
  } catch {
    return null;
  }
};

/** Plenty for anyone reading the board; too few to stuff a count. */
const VOTES_PER_MINUTE = 60;

/** A note's id as the database has it: a bigint, so at most 18 digits. */
const NOTE_ID = /^\d{1,18}$/u;

interface AppOptions {
  lobby: Lobby;
  whoIs: WhoIs;
  readLeaderboard: (userId: string | null) => Promise<Leaderboard>;
  /** Booster Potion's shared recipe book. */
  potions: {
    readBrews: (userId: string | null) => Promise<BrewLog>;
    recordBrew: (potion: string, account: SessionAccount) => Promise<Recorded>;
    readLatest: () => Promise<LatestBrew | null>;
    readBrewers: (potion: string) => Promise<Brewer[]>;
    /** The player's own book, played solo. */
    readSoloFinds: (userId: string) => Promise<ReadonlyMap<string, string>>;
    recordSoloBrew: (
      userId: string,
      potion: string
    ) => Promise<{ isNew: boolean; foundAt: string }>;
    resetSolo: (userId: string) => Promise<void>;
  };
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
  /** Whether a visitor can take notes down, from their cookie. */
  isAdmin: IsAdmin;
  /** The site's own origin; sockets from any other are refused. */
  appOrigin: string;
}

interface Variables {
  account: { id: string; name: string };
}

/**
 * The server's routes: /api for who is signed in, the leaderboard,
 * Booster Potion's recipe book and the hub's sticky board, and /ws, the socket online games are played
 * over. Who a socket belongs to comes
 * from the shared irmahs.dev sign-in cookie, asked of the account service
 * when the socket opens, never from anything sent over it.
 */
export const createApp = ({
  lobby,
  whoIs,
  readLeaderboard,
  potions,
  notes,
  isAdmin,
  appOrigin,
}: AppOptions) => {
  const app = new Hono<{ Variables: Variables }>();
  const brews = createLimiter({ max: BREWS_PER_MINUTE, windowMs: 60_000 });
  const votes = createLimiter({ max: VOTES_PER_MINUTE, windowMs: 60_000 });
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

    const [log, latest] = await Promise.all([
      potions.readBrews(account?.id ?? null),
      potions.readLatest(),
    ]);

    return c.json({ latest, pages: bookOf(log) } satisfies Book);
  });

  app.get("/api/potions/brewers", async (c) => {
    const potion = c.req.query("potion") ?? "";

    if (!isPotion(potion)) {
      return c.text("There is no potion by that name.", 404);
    }

    return c.json({ brewers: await potions.readBrewers(potion) });
  });

  /**
   * What every brew must be: from the site itself, since the sign-in cookie
   * reaches here from any irmahs.dev page; by someone signed in; within
   * their brews a minute; and a cauldron that can be. Either the refusal to
   * send, or who is brewing and what.
   */
  const takeBrew = async (
    request: Request,
    cookie: string | undefined
  ): Promise<
    | { refused: string; status: 400 | 401 | 403 | 429 }
    | { account: SessionAccount; cauldron: Selection }
  > => {
    if (request.headers.get("origin") !== appOrigin) {
      return {
        refused: "Brews are only taken from the site itself.",
        status: 403,
      };
    }

    const { account } = await whoIs(cookie);

    if (!account) {
      return { refused: "Sign in to brew.", status: 401 };
    }

    if (!brews.allow(account.id)) {
      return {
        refused: "The cauldron needs a moment. Try again in a minute.",
        status: 429,
      };
    }

    const cauldron = await readCauldron(request);

    return cauldron
      ? { account, cauldron }
      : { refused: "That brew was not understood.", status: 400 };
  };

  // The server brews, so the page never needs the recipes: it sends what is
  // in the cauldron and hears back a potion or a hint.
  app.post("/api/potions/brew", async (c) => {
    const taken = await takeBrew(c.req.raw, c.req.header("cookie"));

    if ("refused" in taken) {
      return c.text(taken.refused, taken.status);
    }

    const { account, cauldron } = taken;
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

  // Played solo: the player's own book, on their account, apart from the
  // shared one. Brewing for it never puts a name in the shared book.
  app.get("/api/potions/solo", async (c) => {
    const { account } = await whoIs(c.req.header("cookie"));

    if (!account) {
      return c.text("Sign in to keep your own grimoire.", 401);
    }

    const finds = await potions.readSoloFinds(account.id);

    return c.json({ pages: soloBookOf(finds) } satisfies SoloBook);
  });

  app.post("/api/potions/solo/brew", async (c) => {
    const taken = await takeBrew(c.req.raw, c.req.header("cookie"));

    if ("refused" in taken) {
      return c.text(taken.refused, taken.status);
    }

    const { account, cauldron } = taken;
    const finds = await potions.readSoloFinds(account.id);
    const result = brew(cauldron, new Set(finds.keys()));

    if (result.type === "mystery") {
      return c.json(result satisfies SoloBrewAnswer);
    }

    const { foundAt, isNew } = await potions.recordSoloBrew(
      account.id,
      result.recipe.name
    );

    return c.json({
      isNew,
      page: soloFoundPageOf(result.recipe, foundAt),
      type: "potion",
    } satisfies SoloBrewAnswer);
  });

  app.delete("/api/potions/solo", async (c) => {
    if (c.req.header("origin") !== appOrigin) {
      return c.text("Only the site itself can start a grimoire over.", 403);
    }

    const { account } = await whoIs(c.req.header("cookie"));

    if (!account) {
      return c.text("Sign in to start over.", 401);
    }

    await potions.resetSolo(account.id);

    return c.body(null, 204);
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
