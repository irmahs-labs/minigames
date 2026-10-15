import { Suspense } from "react";

import { GAMES } from "./games";
import { Hub } from "./hub";
import { APP_NAME } from "./lib/brand";
import { Link, usePath } from "./lib/router";

const NotFound = () => (
  <main className="page">
    <section className="panel empty">
      <span className="legend">404.txt</span>
      <h1 className="display page__title">No game here</h1>
      <p className="page__sub">That page does not exist, but the games do.</p>
      <Link href="/" className="btn btn--primary">
        See all games
      </Link>
    </section>
  </main>
);

export const App = () => {
  // "/wheel-of-fortune/" and "/wheel-of-fortune" are the same page.
  const path = usePath().replace(/\/+$/u, "") || "/";

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
