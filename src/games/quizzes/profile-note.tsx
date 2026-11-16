import { useEffect, useState } from "react";

import { signInUrl } from "../../lib/account";
import { useCopy, useLanguage } from "../../lib/language";
import { serverWords } from "../../lib/server-words";
import type { Quiz } from "./quiz";
import { fetchKept, keepResult, takeOffResult } from "./result-api";
import type { Asked } from "./result-api";
import type { Saved } from "./saved";

const COPY = {
  en: {
    add: (where: string) => `put it on ${where}`,
    browser: "Saved in this browser only.",
    kept: "Saved on your account too, for",
    off: "take it off your account",
    saving: "Saving it on your account…",
    signIn: (where: string) => `sign in to see it on ${where}`,
  },
  fr: {
    add: (where: string) => `l’ajouter à ${where}`,
    browser: "Enregistré dans ce navigateur uniquement.",
    kept: "Enregistré aussi sur votre compte, pour",
    off: "le retirer de votre compte",
    saving: "Enregistrement sur votre compte…",
    signIn: (where: string) => `se connecter pour le voir dans ${where}`,
  },
};

/**
 * Where a quiz's result is kept, under it: in this browser, and, for a quiz
 * that shows on a profile elsewhere (the witch quiz on the Book of Shadows),
 * on a signed-in visitor's account too. A quiz just finished signed in is
 * kept there at once; an older result is added only when they ask, and they
 * can take it off again.
 */
export const ProfileNote = ({
  quiz,
  saved,
  fresh,
}: {
  quiz: Quiz;
  saved: Saved;
  /** Whether the quiz was finished just now, rather than shown from before. */
  fresh: boolean;
}) => {
  const language = useLanguage();
  const t = useCopy(COPY);
  const [asked, setAsked] = useState<Asked | null>(null);
  const [busy, setBusy] = useState(false);
  const { profile } = quiz;

  useEffect(() => {
    if (!profile) {
      return;
    }

    let current = true;

    const load = async () => {
      const kept = await fetchKept(quiz);

      const same = kept.ok && kept.answer.result?.takenAt === saved.takenAt;

      // A quiz just finished, signed in, goes on the account at once.
      const next =
        fresh && kept.ok && kept.answer.signedIn && !same
          ? await keepResult(quiz, saved)
          : kept;

      if (current) {
        setAsked(next);
      }
    };

    void load();

    return () => {
      current = false;
    };
  }, [profile, quiz, saved, fresh]);

  if (!profile) {
    return <span>{t.browser}</span>;
  }

  const where = profile.name[language];

  const act = async (request: () => Promise<Asked>) => {
    setBusy(true);
    const answered = await request();
    setAsked(answered);
    setBusy(false);
  };

  if (asked === null) {
    return <span aria-busy="true">{fresh ? t.saving : t.browser}</span>;
  }

  if (!asked.ok) {
    return (
      <span>
        {t.browser} {serverWords(asked.message, language)}
      </span>
    );
  }

  const { answer } = asked;

  if (!answer.signedIn) {
    return (
      <span>
        {t.browser} <a href={signInUrl()}>{t.signIn(where)}</a>
      </span>
    );
  }

  if (answer.result?.takenAt === saved.takenAt) {
    return (
      <span className="profile-note">
        {t.kept} <a href={profile.url}>{where}</a>.{" "}
        <button
          type="button"
          className="link-btn"
          disabled={busy}
          onClick={() => act(() => takeOffResult(quiz))}
        >
          {t.off}
        </button>
      </span>
    );
  }

  return (
    <span className="profile-note">
      {t.browser}{" "}
      <button
        type="button"
        className="link-btn"
        disabled={busy}
        onClick={() => act(() => keepResult(quiz, saved))}
      >
        {t.add(where)}
      </button>
    </span>
  );
};
