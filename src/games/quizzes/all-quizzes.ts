import type { Quiz } from "./quiz";
import { WITCH_QUIZ } from "./witch";

/** Every quiz, in the order the Quizzes page lists them; each lives at /quizzes/<slug>. */
export const QUIZZES: readonly Quiz[] = [WITCH_QUIZ];
