import { useState } from "react";

import { StickyBoard } from "./board/sticky-board";
import { MiniGamesIcon } from "./components/app-icons";
import { Header } from "./components/header";
import { GAMES } from "./games";
import { APP_NAME } from "./lib/brand";
import { Icon } from "./lib/icon";
import { useCopy, useLanguage } from "./lib/language";
import { Link } from "./lib/router";

const COPY = {
  en: { inside: "Inside", sub: "pick a game, any game" },
  fr: { inside: "À l’intérieur", sub: "choisissez un jeu, n’importe lequel" },
};

/**
 * The front page: one card per game, with its icon and what's inside it,
 * and the sticky board under them. On a
 * wide screen the notes hang in the margins either side, on a layer as wide
 * as the page.
 */
export const Hub = () => {
  const [sides, setSides] = useState<HTMLDivElement | null>(null);
  const language = useLanguage();
  const t = useCopy(COPY);

  return (
    <>
      <Header icon={<MiniGamesIcon />} name={APP_NAME} href="/" />
      <div className="hub">
        <main className="page">
          <p className="page__sub">{t.sub}</p>

          <ul className="games">
            {GAMES.map((game) => (
              <li key={game.slug}>
                <Link href={`/${game.slug}`} className="game-card">
                  <span className="legend">{game.legend}</span>
                  <game.Icon />
                  <h2 className="display game-card__name">
                    {game.name[language]}
                    <Icon name="arrow" size={20} />
                  </h2>
                  <p className="game-card__blurb">{game.blurb[language]}</p>
                  <p className="game-card__inside">
                    <span className="game-card__inside-label">{t.inside}</span>
                    {game.inside.map((item) => (
                      <span key={item.en} className="game-card__pill">
                        {item[language]}
                      </span>
                    ))}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <StickyBoard sides={sides} />
        </main>
        <div ref={setSides} className="hub__sides" />
      </div>
    </>
  );
};
