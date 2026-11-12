import { useCopy } from "../lib/language";

/**
 * Cute Matcha's Footer, the foot of every page: the Header already names
 * the app and says "by Irma HS", so this says where to find more.
 */
const COPY = {
  en: { more: "more apps at" },
  fr: { more: "plus d’apps sur" },
};

export const Footer = () => {
  const t = useCopy(COPY);

  return (
    <footer className="site-foot">
      {t.more} <a href="https://irmahs.dev">irmahs.dev</a>
    </footer>
  );
};
