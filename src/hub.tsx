import { useState } from "react";

import { StickyBoard } from "./board/sticky-board";
import { MiniGamesIcon } from "./components/app-icons";
import { Header } from "./components/header";
import { GAMES } from "./games";
import { APP_NAME } from "./lib/brand";
import { Link } from "./lib/router";

/**
 * The front page: one card per game, and the sticky board under them. On a
 * wide screen the notes hang in the margins either side, on a layer as wide
 * as the page.
 */
export const Hub = () => {
  const [sides, setSides] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <Header icon={<MiniGamesIcon />} name={APP_NAME} href="/" />
      <div className="hub">
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

          <StickyBoard sides={sides} />

          <footer className="foot">
            <a href="https://irmahs.dev">irmahs.dev</a>
          </footer>
        </main>
        <div ref={setSides} className="hub__sides" />
      </div>
    </>
  );
};
