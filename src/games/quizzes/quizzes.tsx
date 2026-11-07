import { QuizzesIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { useCopy, useLanguage } from "../../lib/language";
import { Link, usePath } from "../../lib/router";
import { QUIZZES } from "./all-quizzes";
import { winner } from "./quiz";
import { QuizRunner } from "./quiz-runner";
import { loadSaved } from "./saved";

const COPY = {
  en: {
    allGames: "all games",
    allQuizzes: "all quizzes",
    see: "see your result",
    sub: "a few questions, and the truth about you",
    take: "take the quiz",
    you: "You are a",
  },
  fr: {
    allGames: "tous les jeux",
    allQuizzes: "tous les quiz",
    see: "voir votre résultat",
    sub: "quelques questions, et la vérité sur vous",
    take: "faire le quiz",
    you: "Vous êtes une",
  },
};

/** Every quiz as a card, with the visitor's last result on the ones they took. */
const QuizList = () => {
  const language = useLanguage();
  const t = useCopy(COPY);

  return (
    <>
      <p className="page__sub">{t.sub}</p>
      <ul className="games">
        {QUIZZES.map((quiz) => {
          const saved = loadSaved(quiz);
          const id = saved ? winner(quiz, saved.scores) : null;
          const result = id ? quiz.results[id] : undefined;

          return (
            <li key={quiz.slug}>
              <Link href={`/quizzes/${quiz.slug}`} className="game-card">
                <span className="legend">{quiz.legend}</span>
                <h2 className="display game-card__name">
                  {quiz.title[language]}
                </h2>
                <p className="game-card__blurb">{quiz.blurb[language]}</p>
                {result ? (
                  <p className="quiz-card__result">
                    {quiz.verdict?.[language] ?? t.you}{" "}
                    <strong>{result.name[language]}</strong>
                  </p>
                ) : null}
                <span className="game-card__play">
                  {result ? t.see : t.take}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

/** /quizzes lists the quizzes; /quizzes/<slug> is one of them. */
const Quizzes = ({ name }: GameProps) => {
  const slug = /^\/quizzes\/(?<slug>[^/]+)/u.exec(usePath())?.groups?.slug;
  const quiz = QUIZZES.find((entry) => entry.slug === slug);
  const t = useCopy(COPY);

  return (
    <>
      <Header icon={<QuizzesIcon />} name={name} href="/quizzes">
        <Link href={quiz ? "/quizzes" : "/"} className="btn">
          <Icon name="back" size={16} />
          {quiz ? t.allQuizzes : t.allGames}
        </Link>
      </Header>
      <main className="page">
        {/* A new quiz starts afresh, not where the last one was. */}
        {quiz ? <QuizRunner key={quiz.slug} quiz={quiz} /> : <QuizList />}
      </main>
    </>
  );
};

export default Quizzes;
