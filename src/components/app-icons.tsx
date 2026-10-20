/**
 * The 40 × 40 app icons, drawn flat in Cute Matcha colours. All use the
 * lime accent, whose edge shows in either theme. The Mini Games die is also
 * the favicon (public/favicon.svg, in fixed colours).
 */
export const MiniGamesIcon = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
    <rect
      x="3"
      y="3"
      width="34"
      height="34"
      rx="9"
      fill="var(--accent)"
      stroke="var(--on-accent)"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="12" r="3" fill="var(--on-accent)" />
    <circle cx="28" cy="12" r="3" fill="var(--on-accent)" />
    <circle cx="20" cy="20" r="3" fill="var(--on-accent)" />
    <circle cx="12" cy="28" r="3" fill="var(--on-accent)" />
    <circle cx="28" cy="28" r="3" fill="var(--on-accent)" />
  </svg>
);

/** As drawn on the design system's Header card. */
export const WheelIcon = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
    <circle
      cx="20"
      cy="20"
      r="18"
      fill="var(--accent)"
      stroke="var(--on-accent)"
      strokeWidth="1.5"
    />
    <path
      d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M32.7 7.3L7.3 32.7"
      stroke="var(--on-accent)"
      strokeWidth="1.2"
    />
    <circle cx="20" cy="20" r="5" fill="var(--on-accent)" />
  </svg>
);

/** A tic-tac-toe grid with a ringed planet in the middle square. */
export const SuperTicTacToeIcon = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
    <rect
      x="3"
      y="3"
      width="34"
      height="34"
      rx="9"
      fill="var(--accent)"
      stroke="var(--on-accent)"
      strokeWidth="1.5"
    />
    <path
      d="M14.3 7v26M25.7 7v26M7 14.3h26M7 25.7h26"
      stroke="var(--on-accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="20" cy="20" r="2.6" fill="var(--on-accent)" />
    <ellipse
      cx="20"
      cy="20"
      rx="4.4"
      ry="1.5"
      fill="none"
      stroke="var(--on-accent)"
      strokeWidth="1.1"
      transform="rotate(-20 20 20)"
    />
  </svg>
);
