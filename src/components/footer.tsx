import { APP_NAME } from "../lib/brand";
import { useCopy } from "../lib/language";
import { MiniGamesIcon } from "./app-icons";

/**
 * The foot of every page, as every irmahs.dev app ends: the die, then
 * "Mini Games by Irma HS" on a pill, her name linking home.
 */
const COPY = { en: { by: "by" }, fr: { by: "par" } };

export const Footer = () => {
  const t = useCopy(COPY);

  return (
    <footer className="site-foot">
      <MiniGamesIcon size={20} />
      <span>
        {APP_NAME} {t.by} <a href="https://irmahs.dev">Irma HS</a>
      </span>
    </footer>
  );
};
