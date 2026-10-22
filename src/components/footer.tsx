import { APP_NAME } from "../lib/brand";
import { MiniGamesIcon } from "./app-icons";

/**
 * The foot of every page, as every irmahs.dev app ends: the die, then
 * "Mini Games by Irma HS" on a pill, her name linking home.
 */
export const Footer = () => (
  <footer className="site-foot">
    <MiniGamesIcon size={20} />
    <span>
      {APP_NAME} by <a href="https://irmahs.dev">Irma HS</a>
    </span>
  </footer>
);
