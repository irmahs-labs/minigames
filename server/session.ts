import * as z from "zod/mini";

/** What the account service says about a session, as far as this app reads it. */
const sessionAnswer = z.nullable(
  z.object({
    user: z.object({
      id: z.uuid(),
      name: z.optional(z.string()),
    }),
  })
);

export interface SessionAccount {
  id: string;
  name: string;
}

export interface SessionAnswer {
  account: SessionAccount | null;
  // Better Auth may extend the session as it answers; these carry the renewed
  // cookie back to the browser so it does not expire before the session does.
  setCookies: string[];
}

export type WhoIs = (cookie: string | undefined) => Promise<SessionAnswer>;

/**
 * Who sent this request, asked of the IrmaHS Labs account service
 * (irmahs-labs/auth) with the browser's own cookie. The answer is the only
 * place an account id comes from: nothing the browser sends is taken as one.
 */
export const askAccountService =
  (authUrl: string): WhoIs =>
  async (cookie) => {
    if (!cookie) {
      return { account: null, setCookies: [] };
    }

    const response = await fetch(`${authUrl}/api/auth/get-session`, {
      headers: { cookie },
    });

    if (!response.ok) {
      throw new Error(`The account service answered ${response.status}`);
    }

    // Anything that is not a session we recognise is treated as no session.
    const parsed = sessionAnswer.safeParse(await response.json());
    const user = parsed.success ? parsed.data?.user : undefined;

    return {
      account: user ? { id: user.id, name: user.name ?? "" } : null,
      setCookies: response.headers.getSetCookie(),
    };
  };

/**
 * The app whose list in the account service's APP_ACCESS secret makes
 * someone a Mini Games admin. It reuses Alma Housila's list, Irma's own,
 * so the secret needs no entry of its own: whoever may open Alma Housila
 * may take notes down here.
 */
export const ADMIN_APP = "alma-housila";

export type IsAdmin = (cookie: string | undefined) => Promise<boolean>;

/**
 * Whether the visitor is a Mini Games admin, asked of the account service the
 * way Caddy asks before opening a private app (`GET /api/access/:app`). Only
 * a 204 says yes, given when their Google-verified email is listed for
 * ADMIN_APP; signed out it redirects to sign in, which is not followed, and
 * anyone not listed gets a 403. When it cannot be asked, nobody is an admin.
 */
export const askAdminAccess =
  (authUrl: string): IsAdmin =>
  async (cookie) => {
    if (!cookie) {
      return false;
    }

    try {
      const response = await fetch(`${authUrl}/api/access/${ADMIN_APP}`, {
        headers: { cookie },
        redirect: "manual",
      });

      return response.status === 204;
    } catch {
      return false;
    }
  };

/**
 * A name as the leaderboard and an opponent see it: the first name and the
 * last name's initial, "Irma Houversing" → "Irma H.". Nobody's full name or
 * photo is shown to strangers.
 */
export const shortName = (name: string): string => {
  const [first, ...rest] = name.trim().split(/\s+/u);
  const initial = rest.at(-1)?.[0];

  if (!first) {
    return "Player";
  }

  return initial ? `${first} ${initial.toUpperCase()}.` : first;
};
