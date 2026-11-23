import { useRef } from "react";

import { GAMES } from "../games";
import type { Game } from "../games";
import { APP_NAME } from "../lib/brand";
import { Icon } from "../lib/icon";
import { useCopy, useLanguage } from "../lib/language";
import { Link } from "../lib/router";
import { Header } from "./header";

const COPY = {
  en: {
    all: "all games",
    close: "Close the menu",
    home: "Mini Games home: every game",
    games: "Every game",
    menu: "Menu",
    pages: (game: string) => `${game}: its pages`,
  },
  fr: {
    all: "tous les jeux",
    close: "Fermer le menu",
    home: "Accueil de Mini Games : tous les jeux",
    games: "Tous les jeux",
    menu: "Menu",
    pages: (game: string) => `${game} : ses pages`,
  },
};

/** Where a game's page lives: "" is the game itself. */
const pathOf = (game: Game, page: string) =>
  page ? `/${game.slug}/${page}` : `/${game.slug}`;

/**
 * A phone's menu: a ☰ button in the header that opens a drawer from the
 * left with every game, and a game's own pages under it, the one open in
 * lime. A native dialog, so Escape closes it and the focus stays inside.
 */
const GameMenu = ({ slug, here }: { slug: string; here: string }) => {
  const t = useCopy(COPY);
  const language = useLanguage();
  const drawer = useRef<HTMLDialogElement>(null);
  const close = () => drawer.current?.close();

  return (
    <>
      <button
        type="button"
        className="icon-btn game-menu-button"
        aria-label={t.menu}
        aria-haspopup="dialog"
        onClick={() => drawer.current?.showModal()}
      >
        <Icon name="menu" size={22} />
      </button>
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- the backdrop press is a mouse shortcut; Escape closes the dialog natively */}
      <dialog
        ref={drawer}
        className="game-drawer"
        aria-label={t.games}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close();
          }
        }}
      >
        <nav className="game-drawer__body" aria-label={t.games}>
          <button
            type="button"
            className="icon-btn game-drawer__close"
            aria-label={t.close}
            onClick={close}
          >
            <Icon name="close" size={20} />
          </button>
          <Link href="/" className="game-drawer__link" onClick={close}>
            <Icon name="back" size={16} />
            {t.all}
          </Link>
          <ul className="game-drawer__games">
            {GAMES.map((game) => (
              <li key={game.slug}>
                <Link
                  href={`/${game.slug}`}
                  className="game-drawer__link"
                  aria-current={
                    game.slug === slug && (here === "" || !game.pages)
                      ? "page"
                      : undefined
                  }
                  onClick={close}
                >
                  {game.name[language]}
                </Link>
                {game.pages ? (
                  <ul className="game-drawer__pages">
                    {game.pages
                      .filter((page) => page.slug !== "")
                      .map((page) => (
                        <li key={page.slug}>
                          <Link
                            href={pathOf(game, page.slug)}
                            className="game-drawer__link game-drawer__link--sub"
                            aria-current={
                              game.slug === slug && page.slug === here
                                ? "page"
                                : undefined
                            }
                            onClick={close}
                          >
                            {page.name[language]}
                          </Link>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
};

/**
 * Every game's header: a house button back to the hub, its icon and name, "Mini Games · by Irma HS" under
 * it, and the shared pills, nothing more. Under it, a quiet way back to
 * every game, then its tabs: a game with pages of its own (Quizzes) has one
 * each, any other one tab of its own name; the open one lifted in lime.
 * On a phone the tabs give way to the menu.
 */
export const GameHeader = ({
  slug,
  here = "",
}: {
  slug: string;
  here?: string;
}) => {
  const t = useCopy(COPY);
  const language = useLanguage();
  const game = GAMES.find((entry) => entry.slug === slug);

  if (!game) {
    throw new Error(`There is no game called ${slug}`);
  }

  const name = game.name[language];

  return (
    <>
      <Header
        icon={<game.Icon />}
        name={name}
        href={`/${game.slug}`}
        app={APP_NAME}
        home={t.home}
        lead={<GameMenu slug={slug} here={here} />}
      />
      <nav className="game-tabs" aria-label={t.pages(name)}>
        <Link href="/" className="game-tabs__back">
          <Icon name="back" size={16} />
          {t.all}
        </Link>
        {(game.pages ?? [{ name: game.name, slug: "" }]).map((page) => (
          <Link
            key={page.slug}
            href={pathOf(game, page.slug)}
            className="game-tab"
            aria-current={page.slug === here ? "page" : undefined}
          >
            {page.name[language]}
          </Link>
        ))}
      </nav>
    </>
  );
};
