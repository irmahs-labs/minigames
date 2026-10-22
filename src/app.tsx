import { Suspense } from "react";
import type { ReactNode } from "react";

import { MiniGamesIcon } from "./components/app-icons";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { GAMES } from "./games";
import { Hub } from "./hub";
import { APP_NAME } from "./lib/brand";
import { Link, usePath } from "./lib/router";

const NotFound = () => (
  <>
    <Header icon={<MiniGamesIcon />} name={APP_NAME} href="/" />
    <main className="page">
      <section className="panel empty">
        <span className="legend">404.txt</span>
        <h2 className="display page__title">No game here</h2>
        <p className="page__sub">That page does not exist, but the games do.</p>
        <Link href="/" className="btn btn--primary">
          see all games
        </Link>
      </section>
    </main>
  </>
);

/** The page for `path`: the hub, a game, or none. */
const PageAt = ({ path }: { path: string }): ReactNode => {
  if (path === "/") {
    return <Hub />;
  }

  const game = GAMES.find((entry) => `/${entry.slug}` === path);

  if (!game) {
    return <NotFound />;
  }

  return (
    <>
      {/* React puts this in the head while the game is open. */}
      <title>{`${game.name} · ${APP_NAME}`}</title>
      <Suspense fallback={<main className="page" aria-busy="true" />}>
        <game.Screen name={game.name} />
      </Suspense>
    </>
  );
};

/** Every page, and the footer under it. */
export const App = () => {
  // "/wheel-of-fortune/" and "/wheel-of-fortune" are the same page.
  const path = usePath().replace(/\/+$/u, "") || "/";

  return (
    <>
      <PageAt path={path} />
      <Footer />
    </>
  );
};
