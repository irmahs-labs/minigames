import * as z from "zod/mini";

/**
 * Signing in happens at the IrmaHS Labs account service, shared by every
 * irmahs.dev app: the site sends people there and they come back signed in.
 * Who that is, the site asks its own server, which asks the account service.
 */
export const AUTH_URL =
  import.meta.env.VITE_AUTH_URL ?? "https://auth.irmahs.dev";

const meAnswer = z.object({
  account: z.nullable(z.object({ name: z.string() })),
});

export type Account = NonNullable<z.infer<typeof meAnswer>["account"]>;

/**
 * Who is signed in: an account, null for nobody, or undefined when the
 * server cannot be reached (online play is then unavailable).
 */
export const currentAccount = async (): Promise<Account | null | undefined> => {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      return undefined;
    }

    const parsed = meAnswer.safeParse(await response.json());

    return parsed.success ? parsed.data.account : undefined;
  } catch {
    return undefined;
  }
};

/** The sign-in page, set to bring the visitor back to this page. */
export const signInUrl = (): string =>
  `${AUTH_URL}/sign-in?redirect=${encodeURIComponent(window.location.href)}`;
