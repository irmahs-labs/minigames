import { Suspense, useEffect } from "react";
import type { ReactNode } from "react";

import { MiniGamesIcon } from "./components/app-icons";
import { Footer } from "./components/footer";
import { GameHeader } from "./components/game-header";
import { Header } from "./components/header";
import { GAMES } from "./games";
import { Hub } from "./hub";
import { APP_NAME } from "./lib/brand";
import { useCopy, useLanguage } from "./lib/language";
import { Link, usePath, withoutTrailingSlashes } from "./lib/router";
import { Moved, movedTo } from "./moved";

const NOT_FOUND = {
  en: {
    all: "see all games",
    sub: "That page does not exist, but the games do.",
    title: "No game here",
  },
  fr: {
    all: "voir tous les jeux",
    sub: "Cette page n’existe pas, mais les jeux, si.",
    title: "Pas de jeu ici",
  },
};

const NotFound = () => {
  const t = useCopy(NOT_FOUND);

  return (
    <>
      <Header icon={<MiniGamesIcon />} name={APP_NAME} href="/" />
      <main className="page">
        <section className="panel empty">
          <span className="legend">404.txt</span>
          <h2 className="display page__title">{t.title}</h2>
          <p className="page__sub">{t.sub}</p>
          <Link href="/" className="btn btn--primary">
            {t.all}
          </Link>
        </section>
      </main>
    </>
  );
};

/** The page for `path`: the hub, a game, or none. */
const PageAt = ({ path }: { path: string }): ReactNode => {
  const language = useLanguage();

  // Once any page is open, every game loads while the browser is idle, so
  // opening one later is instant
  useEffect(() => {
    const id = window.setTimeout(() => {
      for (const game of GAMES) {
        game.preload().catch(() => null);
      }
    }, 1500);

    return () => window.clearTimeout(id);
  }, []);

  if (path === "/") {
    return <Hub />;
  }

  const moved = movedTo(path);

  if (moved) {
    return <Moved to={moved} />;
  }

  const game = GAMES.find(
    (entry) =>
      path === `/${entry.slug}` ||
      (entry.nested === true && path.startsWith(`/${entry.slug}/`))
  );

  if (!game) {
    return <NotFound />;
  }

  // A nested game's page under it: a quiz's slug
  const here = path.slice(`/${game.slug}/`.length);

  return (
    <>
      {/* React puts this in the head while the game is open. */}
      <title>{`${game.name[language]} · ${APP_NAME}`}</title>
      {/* The header stays while the game under it changes */}
      <GameHeader slug={game.slug} here={here} />
      <Suspense fallback={<main className="page" aria-busy="true" />}>
        <game.Screen name={game.name[language]} />
      </Suspense>
    </>
  );
};

/** Every page, and the footer under it. */
export const App = () => {
  // "/wheel-of-fortune/" and "/wheel-of-fortune" are the same page.
  const path = withoutTrailingSlashes(usePath()) || "/";

  return (
    <>
      <PageAt path={path} />
      <Footer />
    </>
  );
};
