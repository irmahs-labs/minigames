import { MiniGamesIcon } from "./components/app-icons";
import { Header } from "./components/header";
import { GAMES } from "./games";
import { APP_NAME } from "./lib/brand";
import { Link } from "./lib/router";

/** The front page: one card per game. */
export const Hub = () => (
  <>
    <Header icon={<MiniGamesIcon />} name={APP_NAME} href="/" />
    <main className="page">
      <p className="page__sub">pick a game, any game</p>

      <ul className="games">
        {GAMES.map((game) => (
          <li key={game.slug}>
            <Link href={`/${game.slug}`} className="game-card">
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
  </>
);
