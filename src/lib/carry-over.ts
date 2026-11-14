import * as z from "zod/mini";

/**
 * The move from minigames.irmahs.dev to playground.irmahs.dev. A browser
 * keeps each address's localStorage apart, so on a visitor's first visit to
 * the new address their saved games, theme and language are fetched from the
 * old one: a hidden frame loads public/carry-over.html there, which posts
 * them to this address and no other. Nothing already saved here is replaced,
 * and the page never waits more than a few seconds for it.
 */
export const OLD_ORIGIN = "https://minigames.irmahs.dev";
export const NEW_ORIGIN = "https://playground.irmahs.dev";

/** Set once the old address has answered, so the frame loads only once. */
export const DONE_KEY = "playground:carried-over";

const WAIT_MS = 3000;

/** The site's own saved games, and the theme and language every page reads. */
export const isCarriedKey = (key: string): boolean =>
  key.startsWith("minigames:") || key === "theme" || key === "lang";

/** What public/carry-over.html posts: every saved entry, as text. */
export const carriedMessage = z.object({
  entries: z.record(z.string(), z.string()),
  type: z.literal("carry-over"),
});

/**
 * What to save from the old address's answer: only the site's own keys, and
 * never over something this address already has.
 */
export const entriesToCarry = (
  sent: Record<string, string>,
  has: (key: string) => boolean
): [string, string][] =>
  Object.entries(sent).filter(([key]) => isCarriedKey(key) && !has(key));

const alreadyCarried = (): boolean => {
  try {
    return window.localStorage.getItem(DONE_KEY) !== null;
  } catch {
    // No storage at all (a private window): there is nowhere to save to.
    return true;
  }
};

const save = (entries: [string, string][]) => {
  try {
    for (const [key, value] of entries) {
      window.localStorage.setItem(key, value);
    }

    window.localStorage.setItem(DONE_KEY, new Date().toISOString());
  } catch {
    // Storage full or blocked: the games start from their defaults.
  }

  // index.html picked the theme before this ran; show the carried one now.
  const theme = entries.find(([key]) => key === "theme")?.[1];

  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
};

/**
 * Brings the old address's saved data over, once. Resolves when it has, or
 * after a few seconds if the old address does not answer, so the page always
 * goes on; it then tries again on the next visit.
 */
export const carryOver = (): Promise<void> =>
  // oxlint-disable-next-line promise/avoid-new -- waits on a frame's message and a timeout, which have no promise API
  new Promise((resolve) => {
    if (window.location.origin !== NEW_ORIGIN || alreadyCarried()) {
      resolve();

      return;
    }

    const frame = document.createElement("iframe");
    frame.hidden = true;
    frame.title = "carry-over";
    frame.src = `${OLD_ORIGIN}/carry-over.html`;

    const finish = () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      frame.remove();
      resolve();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== OLD_ORIGIN || event.source !== frame.contentWindow) {
        return;
      }

      const message = carriedMessage.safeParse(event.data);

      if (!message.success) {
        return;
      }

      save(
        entriesToCarry(message.data.entries, (key) => {
          try {
            return window.localStorage.getItem(key) !== null;
          } catch {
            return true;
          }
        })
      );
      finish();
    };

    const timer = setTimeout(finish, WAIT_MS);
    window.addEventListener("message", onMessage);
    document.body.append(frame);
  });
