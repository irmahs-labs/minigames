import { APP_NAME } from "../lib/brand";

/** The foot of every page: "Mini Games by Irma HS", her name linking home. */
export const Footer = () => (
  <footer className="site-foot">
    <span className="site-foot__name">{APP_NAME}</span> by{" "}
    <a href="https://irmahs.dev">Irma HS</a>
  </footer>
);
