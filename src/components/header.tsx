import type { ReactNode } from "react";

import { Link } from "../lib/router";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  /** The page's 40 × 40 app icon. */
  icon: ReactNode;
  name: string;
  /** Where the brand links: the page's own home. */
  href: string;
  /** The page's own buttons, in the middle. */
  children?: ReactNode;
}

/**
 * Cute Matcha's app Header: the icon, the name with "by Irma HS" under it,
 * the page's actions in the middle, and the theme toggle at the end. The
 * name is the page's heading.
 */
export const Header = ({ icon, name, href, children }: HeaderProps) => (
  <header className="app-header">
    <Link href={href} className="app-header__home">
      {icon}
      <span>
        <h1 className="app-header__name">{name}</h1>
        <span className="app-header__by">by Irma HS</span>
      </span>
    </Link>
    {children ? <div className="app-header__actions">{children}</div> : null}
    <div className="app-header__end">
      <ThemeToggle />
    </div>
  </header>
);
