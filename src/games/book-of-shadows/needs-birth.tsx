import { tr } from "./french";

interface NeedsBirthProps {
  onOpen: () => void;
  legend?: string;
  title?: string;
  text?: string;
  /** Extra panel classes: "panel--wide" beside another panel. */
  className?: string;
}

/** What a page that reads the birth date shows without one. */
export const NeedsBirth = ({
  onOpen,
  legend = "locked.txt",
  title,
  text,
  className = "",
}: NeedsBirthProps) => (
  <section className={`panel panel--book empty ${className}`}>
    <span className="legend">{legend}</span>
    <h2 className="display page__title">
      {title ?? tr("This page is still blank", "Cette page est encore vierge")}
    </h2>
    <p className="page__sub">
      {text ??
        tr(
          "It needs your birth date, on your profile.",
          "Il lui faut votre date de naissance, dans votre profil."
        )}
    </p>
    <button type="button" className="btn btn--primary" onClick={onOpen}>
      {tr("Fill in your profile", "Remplir votre profil")}
    </button>
  </section>
);
