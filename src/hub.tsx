import { GAMES } from "./games";
import { APP_NAME } from "./lib/brand";
import { Link } from "./lib/router";

/** The front page: one card per game. */
export const Hub = () => (
  <main className="page">
    <header className="page__header hub__header">
      <img
        src="/favicon.svg"
        alt=""
        width="56"
        height="56"
        className="hub__logo"
      />
      <div className="stack">
        <h1 className="display page__title">{APP_NAME}</h1>
        <p className="page__sub">pick a game, any game</p>
      </div>
    </header>

    <ul className="games">
      {GAMES.map((game) => (
        <li key={game.slug}>
          <Link href={`/${game.slug}`} className="panel game-card">
            <span className="legend">{game.legend}</span>
            <h2 className="display game-card__name">{game.name}</h2>
            <p className="game-card__blurb">{game.blurb}</p>
            <span className="game-card__play">play</span>
          </Link>
        </li>
      ))}
    </ul>

    <footer className="foot">
      <a href="https://irmahs.dev">irmahs.dev</a>
    </footer>
  </main>
);
