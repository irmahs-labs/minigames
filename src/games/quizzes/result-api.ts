import { resultAnswer } from "./account-result";
import type { ResultAnswer } from "./account-result";
import type { Quiz } from "./quiz";
import type { Saved } from "./saved";

const pathOf = (quiz: Quiz) =>
  `/api/quizzes/${encodeURIComponent(quiz.slug)}/result`;

export type Asked =
  | { ok: true; answer: ResultAnswer }
  | { ok: false; message: string };

const ask = async (quiz: Quiz, init?: RequestInit): Promise<Asked> => {
  try {
    const response = await fetch(pathOf(quiz), init);

    if (!response.ok) {
      // The server says why in a sentence: sign in, from the site itself.
      const message = await response.text();

      return { message: message || "The result wasn't kept.", ok: false };
    }

    const parsed = resultAnswer.safeParse(await response.json());

    return parsed.success
      ? { answer: parsed.data, ok: true }
      : { message: "The server's answer made no sense.", ok: false };
  } catch {
    return { message: "Your account can't be reached right now.", ok: false };
  }
};

/** The result kept on the visitor's account, and whether they are signed in. */
export const fetchKept = (quiz: Quiz) => ask(quiz);

/** Keeps a finished quiz's result on the visitor's account. */
export const keepResult = (quiz: Quiz, saved: Saved) =>
  ask(quiz, {
    body: JSON.stringify({ scores: saved.scores, takenAt: saved.takenAt }),
    headers: { "content-type": "application/json" },
    method: "PUT",
  });

/** Takes the result off the visitor's account. */
export const takeOffResult = (quiz: Quiz) => ask(quiz, { method: "DELETE" });
