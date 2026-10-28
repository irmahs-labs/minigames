// @vitest-environment node
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { askAdminAccess, shortName } from "./session";

/**
 * Stands in for the account service's GET /api/access/:app, as
 * irmahs-labs/auth answers it: 204 for an email listed for the app, a
 * redirect to sign in when signed out, 403 for anyone else.
 */
const asked: string[] = [];

const accountService = new Hono().get("/api/access/:app", (c) => {
  asked.push(c.req.param("app"));

  switch (c.req.header("cookie")) {
    case "session=irma": {
      return c.body(null, 204);
    }

    case "session=ben": {
      return c.text("Not listed", 403);
    }

    default: {
      // Signed out, or a session that has ended.
      return c.redirect("https://auth.irmahs.dev/sign-in");
    }
  }
});

const server = serve({ fetch: accountService.fetch, port: 0 });

let isAdmin = askAdminAccess("http://unused");

beforeAll(async () => {
  if (!server.listening) {
    await once(server, "listening");
  }

  // SAFETY: a server listening on a TCP port reports an AddressInfo, never a
  // pipe name.
  const { port } = server.address() as AddressInfo;

  isAdmin = askAdminAccess(`http://127.0.0.1:${port}`);
});

afterAll(() => {
  server.close();
});

describe("shortName", () => {
  it("keeps the first name and the initial of every name after it", () => {
    expect(shortName("Irma Houversing")).toBe("Irma H.");
    expect(shortName("Irma Houversing Sor")).toBe("Irma HS.");
    expect(shortName("  ben   carter ")).toBe("ben C.");
    expect(shortName("Cher")).toBe("Cher");
    expect(shortName("   ")).toBe("Player");
  });
});

describe("askAdminAccess", () => {
  it("asks the account service about Alma Housila's list", async () => {
    expect(await isAdmin("session=irma")).toBe(true);
    expect(asked).toEqual(["alma-housila"]);
  });

  it("says no for anyone the account service refuses", async () => {
    expect(await isAdmin("session=ben")).toBe(false);
  });

  it("says no when signed out, without following the redirect", async () => {
    expect(await isAdmin("session=ended")).toBe(false);
    expect(await isAdmin("")).toBe(false);
  });

  it("makes nobody an admin when the account service cannot be reached", async () => {
    expect(await askAdminAccess("http://127.0.0.1:9")("session=irma")).toBe(
      false
    );
  });
});
