import { useEffect, useRef, useState } from "react";

import { Icon } from "../../lib/icon";
import { LOCALES, useCopy, useLanguage } from "../../lib/language";
import { Link } from "../../lib/router";
import { PieChart } from "./pie-chart";
import { tally, winner } from "./quiz";
import type { Quiz } from "./quiz";
import { loadSaved, saveResult } from "./saved";
import type { Saved } from "./saved";

const COPY = {
  en: {
    allQuizzes: "all quizzes",
    back: "Back",
    of: (n: number, total: number) => `Question ${n} of ${total}`,
    questions: (n: number) => `${n} questions`,
    retake: "retake the quiz",
    saved: "Saved in this browser only.",
    start: "start the quiz",
    taken: (date: string) => `Taken on ${date}.`,
    youAre: "You are a",
  },
  fr: {
    allQuizzes: "tous les quiz",
    back: "Retour",
    of: (n: number, total: number) => `Question ${n} sur ${total}`,
    questions: (n: number) => `${n} questions`,
    retake: "refaire le quiz",
    saved: "Enregistré dans ce navigateur uniquement.",
    start: "commencer le quiz",
    taken: (date: string) => `Fait le ${date}.`,
    youAre: "Vous êtes une",
  },
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type Phase =
  | { step: "intro" }
  | { step: "asking"; picks: number[] }
  | { step: "result"; saved: Saved };

/** A quiz from its first page to its result: the last result saved, if any. */
export const QuizRunner = ({ quiz }: { quiz: Quiz }) => {
  const [phase, setPhase] = useState<Phase>(() => {
    const saved = loadSaved(quiz);

    return saved ? { saved, step: "result" } : { step: "intro" };
  });

  const language = useLanguage();
  const t = useCopy(COPY);
  const heading = useRef<HTMLHeadingElement>(null);
  const asked = phase.step === "asking" ? phase.picks.length : -1;
  const total = quiz.questions.length;

  // Each new question, and the result, take the focus, so a keyboard or a
  // screen reader carries on from the top of what changed.
  useEffect(() => {
    if (asked >= 0 || phase.step === "result") {
      heading.current?.focus();
    }
  }, [asked, phase.step]);

  const pick = (picks: number[], answer: number) => {
    const next = [...picks, answer];

    if (next.length < total) {
      setPhase({ picks: next, step: "asking" });

      return;
    }

    setPhase({
      saved: saveResult(quiz, tally(quiz, next)),
      step: "result",
    });
  };

  if (phase.step === "intro") {
    return (
      <section className="panel quiz">
        <span className="legend">{quiz.legend}</span>
        <p className="kicker">{t.questions(total)}</p>
        <h2 className="display quiz__title">{quiz.title[language]}</h2>
        <p className="quiz__about">{quiz.blurb[language]}</p>
        <div className="quiz__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setPhase({ picks: [], step: "asking" })}
          >
            {t.start}
          </button>
        </div>
      </section>
    );
  }

  if (phase.step === "asking") {
    const { picks } = phase;
    const question = quiz.questions[picks.length];

    if (!question) {
      return null;
    }

    return (
      <section className="panel quiz">
        <span className="legend">{`question-${picks.length + 1}.txt`}</span>
        <div className="quiz__head">
          <p className="kicker">{t.of(picks.length + 1, total)}</p>
          <span aria-hidden="true" className="quiz__progress">
            <span style={{ width: `${(picks.length / total) * 100}%` }} />
          </span>
        </div>
        <h2
          ref={heading}
          tabIndex={-1}
          className="display quiz__title quiz__prompt"
        >
          {question.prompt[language]}
        </h2>
        <ol className="quiz__answers">
          {question.answers.map((answer, i) => (
            <li key={answer.text.en}>
              <button
                type="button"
                className="quiz__answer"
                onClick={() => pick(picks, i)}
              >
                <span aria-hidden="true" className="quiz__letter">
                  {LETTERS[i]}
                </span>
                {answer.text[language]}
              </button>
            </li>
          ))}
        </ol>
        <div className="quiz__actions">
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() =>
              setPhase(
                picks.length === 0
                  ? { step: "intro" }
                  : { picks: picks.slice(0, -1), step: "asking" }
              )
            }
          >
            <Icon name="back" size={16} />
            {t.back}
          </button>
        </div>
      </section>
    );
  }

  const { saved } = phase;
  const id = winner(quiz, saved.scores);
  const result = id ? quiz.results[id] : undefined;
  const takenAt = new Date(saved.takenAt);

  return (
    <section className="panel quiz quiz--result">
      <span className="legend">result.log</span>
      <div className="quiz__verdict">
        <p className="kicker">{quiz.verdict?.[language] ?? t.youAre}</p>
        <h2 ref={heading} tabIndex={-1} className="display quiz__title">
          {result?.name[language]}
        </h2>
        <p className="quiz__about">{result?.about[language]}</p>
        <div className="quiz__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setPhase({ picks: [], step: "asking" })}
          >
            <Icon name="spin" size={18} />
            {t.retake}
          </button>
          <Link href="/quizzes" className="btn">
            {t.allQuizzes}
          </Link>
        </div>
        <p className="hint">
          {Number.isNaN(takenAt.getTime())
            ? t.saved
            : `${t.taken(
                takenAt.toLocaleDateString(LOCALES[language], {
                  dateStyle: "long",
                })
              )} ${t.saved}`}
        </p>
      </div>
      <PieChart quiz={quiz} scores={saved.scores} />
    </section>
  );
};
