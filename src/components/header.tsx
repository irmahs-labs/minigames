import type { ReactNode } from "react";

import { Icon } from "../lib/icon";
import { useCopy } from "../lib/language";
import { Link } from "../lib/router";
import { AccountButton } from "./account-button";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

const COPY = {
  en: { by: "by Irma HS" },
  fr: { by: "par Irma HS" },
};

interface HeaderProps {
  /** The page's 40 × 40 app icon. */
  icon: ReactNode;
  name: string;
  /** Where the brand links: the page's own home. */
  href: string;
  /** The page's own buttons, in the middle. */
  children?: ReactNode;
  /** Before the icon: the phone's menu button, on a game's pages. */
  lead?: ReactNode;
  /** On a sub-page: the label of the house button back to the hub, at "/". */
  home?: string;
  /** What the name belongs to, before "by Irma HS": "Mini Games" on a game's pages. */
  app?: string;
}

/**
 * Cute Matcha's app Header: on a sub-page a house button back to the hub,
 * then the icon, the name with "by Irma HS" under it,
 * the page's actions in the middle, and the language pill, the theme toggle
 * and the account pill at the end. The
 * name is the page's heading.
 */
export const Header = ({
  icon,
  name,
  href,
  children,
  lead,
  home,
  app,
}: HeaderProps) => {
  const t = useCopy(COPY);

  return (
    <header className="app-header">
      {lead}
      {home ? (
        <Link
          href="/"
          className="icon-btn app-header__hub"
          aria-label={home}
          title={home}
        >
          <Icon name="home" size={22} />
        </Link>
      ) : null}
      <Link href={href} className="app-header__home">
        {icon}
        <span>
          <h1 className="app-header__name">{name}</h1>
          <span className="app-header__by">
            {app ? `${app} · ${t.by}` : t.by}
          </span>
        </span>
      </Link>
      {children ? <div className="app-header__actions">{children}</div> : null}
      <div className="app-header__end">
        <LanguageToggle />
        <ThemeToggle />
        <AccountButton />
      </div>
    </header>
  );
};
