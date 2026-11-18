import type { ReactNode } from "react";

import type { Kind, Piece, Side } from "./rules";

/**
 * The pieces, drawn on a 64 grid: round wooden tokens, each piece drawn
 * as what its Khmer name means (a crown, a lotus, a temple tower, a horse,
 * a boat, a fish), in two themes' colours:
 *
 * - matcha: the app's own Cute Matcha, cream for White, dark green for Black.
 * - yeak-tevada: the Tevada (White) in ivory and gold, the Yeak (Black) in
 *   black and red. Same shapes for now; their own drawings come later.
 *
 * Both are artwork: the same colours in Light and Dark Matcha.
 */
export type Theme = "matcha" | "yeak-tevada";

export const THEMES: readonly Theme[] = ["matcha", "yeak-tevada"];

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 3,
} as const;

/** The Cute Matcha glyphs, in the token's ink */
const GLYPHS: Record<Kind, ReactNode> = {
  // Khun: a royal crown, five points and a jewelled band
  khun: (
    <g {...LINE}>
      <path d="M18 41 L16 24 L24 32 L28 20 L32 29 L36 20 L40 32 L48 24 L46 41 Z" />
      <path d="M19 46 H45" />
      <circle cx="32" cy="17" r="2.4" fill="currentColor" />
      <circle cx="24.5" cy="37" r="1.4" fill="currentColor" />
      <circle cx="32" cy="37" r="1.4" fill="currentColor" />
      <circle cx="39.5" cy="37" r="1.4" fill="currentColor" />
    </g>
  ),
  // Neang: a lotus bud, petals opening
  neang: (
    <g {...LINE}>
      <path d="M32 17 C38 23 39 31 32 40 C25 31 26 23 32 17 Z" />
      <path d="M32 40 C27 39 21 35 20 28 C25 28 29 31 32 34 M32 40 C37 39 43 35 44 28 C39 28 35 31 32 34" />
      <path d="M24 46 H40" />
    </g>
  ),
  // Koul: a temple tower (prasat)
  koul: (
    <g {...LINE}>
      <path d="M22 46 H42 M24 46 V40 H40 V46 M26 40 C26 33 28 28 32 16 C36 28 38 33 38 40" />
      <path d="M28 33 H36 M29.5 27 H34.5" />
      <path d="M30 46 V42 H34 V46" />
    </g>
  ),
  // Seh: a horse's head
  seh: (
    <g {...LINE}>
      <path d="M24 47 C24 38 26 33 30 29 L22 31 C20 28 21 25 24 23 L33 16 L34 12 L37 16 C43 20 45 30 42 47 Z" />
      <circle cx="31" cy="21.5" r="1.6" fill="currentColor" />
      <path d="M37 18 C40 24 41 30 40 38" />
    </g>
  ),
  // Tuk: a long boat, prow and stern raised
  tuk: (
    <g {...LINE}>
      <path d="M14 30 C17 30 18 34 20 37 H44 C46 34 47 30 50 30 C49 38 45 43 40 44 H24 C19 43 15 38 14 30 Z" />
      <path d="M32 37 V18 L41 31 H32" />
    </g>
  ),
  // Trey: a fish
  trey: (
    <g {...LINE}>
      <path d="M17 32 C22 24 32 22 40 27 L48 21 V43 L40 37 C32 42 22 40 17 32 Z" />
      <circle cx="24.5" cy="30.5" r="1.7" fill="currentColor" />
      <path d="M30 27 C32 30 32 34 30 37" />
    </g>
  ),
  // A flipped Trey: the fish upside down, ringed
  flipped: (
    <g {...LINE}>
      <path d="M17 32 C22 40 32 42 40 37 L48 43 V21 L40 27 C32 22 22 24 17 32 Z" />
      <circle cx="24.5" cy="33.5" r="1.7" fill="currentColor" />
      <circle cx="32" cy="32" r="22" strokeDasharray="3 5" />
    </g>
  ),
};

/** Each theme's token: its face, its rim, and the ink its glyph is drawn in */
const COLOURS: Record<
  Theme,
  Record<Side, { body: string; rim: string; ink: string }>
> = {
  matcha: {
    black: { body: "#2f3b34", ink: "#fff3cf", rim: "#fff3cf" },
    white: { body: "#fff3cf", ink: "#2f3b34", rim: "#2f3b34" },
  },
  // For now the Matcha shapes in the Tevada's ivory and gold and the Yeak's
  // black and red; their own drawings come later
  "yeak-tevada": {
    black: { body: "#1c1a1f", ink: "#f2e6d0", rim: "#d6463c" },
    white: { body: "#fffaf0", ink: "#3a2f1e", rim: "#e0b23c" },
  },
};

const Token = ({ piece, theme }: { piece: Piece; theme: Theme }) => {
  const { body, ink, rim } = COLOURS[theme][piece.side];
  const matcha = theme === "matcha";

  return (
    <>
      <circle
        cx="32"
        cy="32"
        r="28"
        fill={body}
        stroke={matcha ? "#2f3b34" : "#14110f"}
        strokeWidth="3"
      />
      <circle
        cx="32"
        cy="32"
        r={matcha ? 23.5 : 24}
        fill="none"
        stroke={rim}
        strokeOpacity={matcha ? 0.35 : 1}
        strokeWidth={matcha ? 1.5 : 2}
      />
      <g color={ink}>{GLYPHS[piece.kind]}</g>
    </>
  );
};

/** A piece in the theme picked; decorative, the square names it */
export const PieceIcon = ({
  piece,
  theme,
  size,
}: {
  piece: Piece;
  theme: Theme;
  size?: number;
}) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    aria-hidden="true"
    className="ouk-piece"
  >
    <Token piece={piece} theme={theme} />
  </svg>
);
