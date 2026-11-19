import { useEffect, useRef, useState } from "react";

import { Icon } from "../../lib/icon";
import { LOCALES, useCopy, useLanguage } from "../../lib/language";
import { Link } from "../../lib/router";
import { PieChart } from "./pie-chart";
import { ProfileNote } from "./profile-note";
import { counts, eraScores, tally, winner } from "./quiz";
import type { Quiz } from "./quiz";
import { loadEras, loadSaved, saveEras, saveResult } from "./saved";
import type { Saved } from "./saved";

const COPY = {
  en: {
    allQuizzes: "all quizzes",
    back: "Back",
    eras: "Which eras?",
    noEra: "Pick at least one era.",
    of: (n: number, total: number) => `Question ${n} of ${total}`,
    questions: (n: number) => `${n} questions`,
    retake: "retake the quiz",
    start: "start the quiz",
    taken: (date: string) => `Taken on ${date}.`,
    youAre: "You are a",
  },
  fr: {
    allQuizzes: "tous les quiz",
    back: "Retour",
    eras: "Quelles époques ?",
    noEra: "Choisissez au moins une époque.",
    of: (n: number, total: number) => `Question ${n} sur ${total}`,
    questions: (n: number) => `${n} questions`,
    retake: "refaire le quiz",
    start: "commencer le quiz",
    taken: (date: string) => `Fait le ${date}.`,
    youAre: "Vous êtes une",
  },
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type Phase =
  | { step: "intro" }
  | { step: "asking"; picks: number[] }
  | { step: "result"; saved: Saved; fresh: boolean };

/** A quiz from its first page to its result: the last result saved, if any. */
export const QuizRunner = ({ quiz }: { quiz: Quiz }) => {
  const [phase, setPhase] = useState<Phase>(() => {
    const saved = loadSaved(quiz);

    return saved ? { fresh: false, saved, step: "result" } : { step: "intro" };
  });

  const [eras, setEras] = useState(() => loadEras(quiz));
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
      fresh: true,
      saved: saveResult(
        quiz,
        quiz.eras ? eraScores(quiz, next, eras) : tally(quiz, next)
      ),
      step: "result",
    });
  };

  const chooseEra = (id: string, on: boolean) => {
    const next = (quiz.eras ?? [])
      .map((era) => era.id)
      .filter((era) => (era === id ? on : eras.includes(era)));

    setEras(next);

    if (next.length > 0) {
      saveEras(quiz, next);
    }
  };

  if (phase.step === "intro") {
    return (
      <section className="panel quiz">
        <span className="legend">{quiz.legend}</span>
        <p className="kicker">{t.questions(total)}</p>
        <h2 className="display quiz__title">{quiz.title[language]}</h2>
        <p className="quiz__about">{quiz.blurb[language]}</p>
        {quiz.eras ? (
          <fieldset className="quiz__eras">
            <legend className="kicker">{t.eras}</legend>
            {quiz.eras.map((era) => (
              <label key={era.id} className="quiz__era">
                <input
                  type="checkbox"
                  checked={eras.includes(era.id)}
                  onChange={(event) => chooseEra(era.id, event.target.checked)}
                />
                <span>
                  <strong>{era.name[language]}</strong>
                  <span className="quiz__era-about">{era.about[language]}</span>
                </span>
              </label>
            ))}
          </fieldset>
        ) : null}
        <div className="quiz__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={eras.length === 0 && Boolean(quiz.eras)}
            onClick={() => setPhase({ picks: [], step: "asking" })}
          >
            {t.start}
          </button>
        </div>
        {quiz.eras && eras.length === 0 ? (
          <p className="hint" aria-live="polite">
            {t.noEra}
          </p>
        ) : null}
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
          {question.answers
            .map((answer, i) => ({ answer, i }))
            .filter(({ answer }) => !quiz.eras || counts(quiz, answer, eras))
            .map(({ answer, i }, shown) => (
              <li key={answer.text.en}>
                <button
                  type="button"
                  className="quiz__answer"
                  onClick={() => pick(picks, i)}
                >
                  <span aria-hidden="true" className="quiz__letter">
                    {LETTERS[shown]}
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

  const { fresh, saved } = phase;
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
            onClick={() =>
              setPhase(
                quiz.eras ? { step: "intro" } : { picks: [], step: "asking" }
              )
            }
          >
            <Icon name="spin" size={18} />
            {t.retake}
          </button>
          <Link href="/quizzes" className="btn">
            {t.allQuizzes}
          </Link>
        </div>
        <p className="hint" aria-live="polite">
          {Number.isNaN(takenAt.getTime())
            ? null
            : `${t.taken(
                takenAt.toLocaleDateString(LOCALES[language], {
                  dateStyle: "long",
                })
              )} `}
          <ProfileNote quiz={quiz} saved={saved} fresh={fresh} />
        </p>
      </div>
      <PieChart quiz={quiz} scores={saved.scores} />
    </section>
  );
};
