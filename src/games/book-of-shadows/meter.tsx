/** A bar filled to `percent` (0–100): an element's share, a match's score. */
export const Meter = ({ percent }: { percent: number }) => (
  <span className="meter" aria-hidden="true">
    <span className="meter__fill" style={{ width: `${percent}%` }} />
  </span>
);
