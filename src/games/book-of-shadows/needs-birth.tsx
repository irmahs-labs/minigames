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
  title = "This page is still blank",
  text = "It needs your birth date, on your profile.",
  className = "",
}: NeedsBirthProps) => (
  <section className={`panel panel--book empty ${className}`}>
    <span className="legend">{legend}</span>
    <h2 className="display page__title">{title}</h2>
    <p className="page__sub">{text}</p>
    <button type="button" className="btn btn--primary" onClick={onOpen}>
      Fill in your profile
    </button>
  </section>
);
