/**
 * The 40 × 40 app icons, drawn flat in Cute Matcha's Light Matcha colours,
 * the same in both themes: an icon is also a favicon. Each has a 1.5px
 * `text` rim, which disappears in Light Matcha and turns cream in Dark
 * Matcha, so its edge reads on either header. The Mini Games die is also
 * public/favicon.svg.
 */
export const MiniGamesIcon = ({ size = 40 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40">
    <rect
      x="3"
      y="3"
      width="34"
      height="34"
      rx="9"
      fill="#d4dd9c"
      stroke="var(--text)"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="12" r="3" fill="#2f3b34" />
    <circle cx="28" cy="12" r="3" fill="#2f3b34" />
    <circle cx="20" cy="20" r="3" fill="#2f3b34" />
    <circle cx="12" cy="28" r="3" fill="#2f3b34" />
    <circle cx="28" cy="28" r="3" fill="#2f3b34" />
  </svg>
);

/** As drawn on the design system's Header card. */
export const WheelIcon = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
    <circle
      cx="20"
      cy="20"
      r="18"
      fill="#d4dd9c"
      stroke="var(--text)"
      strokeWidth="1.5"
    />
    <path
      d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M32.7 7.3L7.3 32.7"
      stroke="#2f3b34"
      strokeWidth="1.2"
    />
    <circle cx="20" cy="20" r="5" fill="#2f3b34" />
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
      fill="#d4dd9c"
      stroke="var(--text)"
      strokeWidth="1.5"
    />
    <path
      d="M14.3 7v26M25.7 7v26M7 14.3h26M7 25.7h26"
      stroke="#2f3b34"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="20" cy="20" r="2.6" fill="#2f3b34" />
    <ellipse
      cx="20"
      cy="20"
      rx="4.4"
      ry="1.5"
      fill="none"
      stroke="#2f3b34"
      strokeWidth="1.1"
      transform="rotate(-20 20 20)"
    />
  </svg>
);

/** A cream card with a question mark on it. */
export const QuizzesIcon = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
    <rect
      x="3"
      y="3"
      width="34"
      height="34"
      rx="9"
      fill="#d4dd9c"
      stroke="var(--text)"
      strokeWidth="1.5"
    />
    <rect
      x="11"
      y="8"
      width="18"
      height="24"
      rx="3"
      fill="#fff3cf"
      stroke="#2f3b34"
      strokeWidth="1.5"
    />
    <path
      d="M16.5 16.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3v.5"
      fill="none"
      stroke="#2f3b34"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="26.5" r="1.3" fill="#2f3b34" />
  </svg>
);

/** A ring of an arena, with a flame burning in the middle. */
export const ArenaIcon = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
    <rect
      x="3"
      y="3"
      width="34"
      height="34"
      rx="9"
      fill="#d4dd9c"
      stroke="var(--text)"
      strokeWidth="1.5"
    />
    <ellipse
      cx="20"
      cy="29"
      rx="12"
      ry="4.5"
      fill="#fff3cf"
      stroke="#2f3b34"
      strokeWidth="1.5"
    />
    <path
      d="M20 8c3.5 4 6.5 7.5 6.5 12.5a6.5 6.5 0 0 1-13 0c0-3 1.5-5 3-6.5 0 2.5 1 4 2.5 4.5-1-4 .5-7.5 1-10.5z"
      fill="#afc584"
      stroke="#2f3b34"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

/** A Magic 8 Ball: a dark ball, its cream window with an 8 in it. */
export const MagicEightBallIcon = () => (
  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40">
    <rect
      x="3"
      y="3"
      width="34"
      height="34"
      rx="9"
      fill="#d4dd9c"
      stroke="var(--text)"
      strokeWidth="1.5"
    />
    <circle cx="20" cy="20" r="12" fill="#2f3b34" />
    <circle cx="20" cy="18" r="6" fill="#fff3cf" />
    <circle
      cx="20"
      cy="16.2"
      r="1.7"
      fill="none"
      stroke="#2f3b34"
      strokeWidth="1.3"
    />
    <circle
      cx="20"
      cy="19.8"
      r="2"
      fill="none"
      stroke="#2f3b34"
      strokeWidth="1.3"
    />
    <path
      d="M12.5 23.5a8.5 8.5 0 0 0 5 4.6"
      fill="none"
      stroke="#afc584"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
