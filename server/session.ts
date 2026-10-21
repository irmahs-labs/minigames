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
