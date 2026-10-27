import type { ReactNode } from "react";

interface PeriodNavProps {
  /** The heading's id, for the panel's aria-labelledby. */
  id: string;
  unit: "month" | "year";
  title: ReactNode;
  /** Whether the period on show is the current one. */
  atCurrent: boolean;
  /** Moves a period back (-1) or on (1). */
  onStep: (by: -1 | 1) => void;
  onCurrent: () => void;
}

/** "‹ October 2026 ›", with a way back to this month or year once away from it. */
export const PeriodNav = ({
  id,
  unit,
  title,
  atCurrent,
  onStep,
  onCurrent,
}: PeriodNavProps) => (
  <div className="month-nav">
    <button
      type="button"
      className="icon-btn"
      aria-label={`Previous ${unit}`}
      onClick={() => onStep(-1)}
    >
      ‹
    </button>
    <h2 id={id} className="display book__title" aria-live="polite">
      {title}
    </h2>
    <button
      type="button"
      className="icon-btn"
      aria-label={`Next ${unit}`}
      onClick={() => onStep(1)}
    >
      ›
    </button>
    {atCurrent ? null : (
      <button type="button" className="btn btn--quiet" onClick={onCurrent}>
        This {unit}
      </button>
    )}
  </div>
);
