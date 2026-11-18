import type { ReactNode } from "react";

import type { Kind, Piece } from "./rules";

/**
 * The pieces, drawn on a 64 grid, in two themes:
 *
 * - matcha: round wooden tokens in the app's own Cute Matcha colours, cream
 *   for White and dark green for Black, each piece drawn as what its Khmer
 *   name means (a crown, a lotus, a temple tower, a horse, a boat, a fish).
 * - yeak-tevada: the Tevada (White) in ivory and gold, with mokot crowns and
 *   spires; the Yeak (Black) in black and red, with flame crowns, horns and
 *   a club. No faces.
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

const MatchaPiece = ({ piece }: { piece: Piece }) => {
  const white = piece.side === "white";
  const ink = white ? "#2f3b34" : "#fff3cf";

  return (
    <>
      <circle
        cx="32"
        cy="32"
        r="28"
        fill={white ? "#fff3cf" : "#2f3b34"}
        stroke="#2f3b34"
        strokeWidth="3"
      />
      <circle
        cx="32"
        cy="32"
        r="23.5"
        fill="none"
        stroke={ink}
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <g color={ink}>{GLYPHS[piece.kind]}</g>
    </>
  );
};

/* ---------- Yeak and Tevada ---------- */

const T = { body: "#fffaf0", gold: "#e0b23c", ink: "#3a2f1e" } as const;

const Y = {
  body: "#1c1a1f",
  dark: "#3a3540",
  ink: "#f2e6d0",
  red: "#d6463c",
} as const;

const EDGE = "#14110f";

const stroke = (colour: string, width = 2.6) =>
  ({
    fill: "none",
    stroke: colour,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: width,
  }) as const;

/** A tall golden mokot: tiers rising to a spire */
const Mokot = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M-8 0 H8 L6 -6 H-6 Z M-5 -6 L-3.5 -12 H3.5 L5 -6 Z M-2.5 -12 L0 -22 L2.5 -12 Z"
      fill={T.gold}
      stroke={T.ink}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </g>
);

/** A Yeak's flame crown */
const Flames = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M-9 0 H9 L7 -6 L4 -3 L3 -12 L0 -6 L-1 -16 L-3 -6 L-4 -12 L-6 -3 L-7 -6 Z"
      fill={Y.red}
      stroke={EDGE}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </g>
);

const HORSE =
  "M24 47 C24 38 26 33 30 29 L22 31 C20 28 21 25 24 23 L33 16 L34 12 L37 16 C43 20 45 30 42 47 Z";

const BOAT =
  "M14 31 C17 31 18 35 20 38 H44 C46 35 47 31 50 31 C49 39 45 44 40 45 H24 C19 44 15 39 14 31 Z";

const FISH = "M17 32 C22 24 32 22 40 27 L48 21 V43 L40 37 C32 42 22 40 17 32 Z";

const FISH_FLIPPED =
  "M17 32 C22 40 32 42 40 37 L48 43 V21 L40 27 C32 22 22 24 17 32 Z";

const TEVADA: Record<Kind, ReactNode> = {
  flipped: (
    <>
      <path
        d={FISH_FLIPPED}
        fill="#ffffff"
        stroke={T.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M40 37 L48 43 V21 L40 27 Z"
        fill={T.gold}
        stroke={T.ink}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="24.5" cy="33.5" r="1.6" fill={T.ink} />
      <Mokot x={32} y={22} s={0.4} />
    </>
  ),
  khun: (
    <>
      <Mokot x={32} y={44} s={1.75} />
      <circle
        cx="32"
        cy="9.5"
        r="2"
        fill={T.gold}
        stroke={T.ink}
        strokeWidth="1"
      />
      <path d="M20 47 H44" {...stroke(T.ink)} />
    </>
  ),
  koul: (
    <>
      <path d="M32 14 V48" {...stroke(T.ink, 2.8)} />
      <path
        d="M24 22 C24 28 28 30 32 30 C36 30 40 28 40 22 M32 14 L32 30"
        {...stroke(T.ink)}
      />
      <path d="M24 22 L22 18 M40 22 L42 18 M32 14 L32 11" {...stroke(T.ink)} />
      <path d="M27 48 H37" {...stroke(T.gold, 3)} />
      <circle cx="32" cy="36" r="2.2" fill={T.gold} />
    </>
  ),
  neang: (
    <>
      <path
        d="M18 40 L20 24 L26 31 L32 17 L38 31 L44 24 L46 40 Z"
        fill={T.gold}
        stroke={T.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 40 H46" {...stroke(T.ink, 2.4)} />
      <circle
        cx="32"
        cy="34"
        r="3"
        fill="#ffffff"
        stroke={T.ink}
        strokeWidth="1.6"
      />
      <circle cx="22" cy="46" r="1.6" fill={T.gold} />
      <circle cx="32" cy="46" r="1.6" fill={T.gold} />
      <circle cx="42" cy="46" r="1.6" fill={T.gold} />
    </>
  ),
  seh: (
    <>
      <path
        d={HORSE}
        fill="#ffffff"
        stroke={T.ink}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="21.5" r="1.5" fill={T.ink} />
      <path d="M37 18 C40 24 41 30 40 38" {...stroke(T.gold)} />
      <path
        d="M33 12 L34 6 L36 12"
        fill={T.gold}
        stroke={T.ink}
        strokeWidth="1.2"
      />
    </>
  ),
  trey: (
    <>
      <path
        d={FISH}
        fill="#ffffff"
        stroke={T.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M40 27 L48 21 V43 L40 37 Z"
        fill={T.gold}
        stroke={T.ink}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="24.5" cy="30.5" r="1.6" fill={T.ink} />
      <path d="M30 27 C32 30 32 34 30 37" {...stroke(T.gold, 2.2)} />
    </>
  ),
  tuk: (
    <>
      <path
        d={BOAT}
        fill={T.gold}
        stroke={T.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M14 31 C13 27 15 24 18 25" {...stroke(T.ink, 2)} />
      <path d="M32 38 V19" {...stroke(T.ink, 2.4)} />
      <path
        d="M32 19 L42 31 H32 Z"
        fill="#ffffff"
        stroke={T.ink}
        strokeWidth="2"
      />
      <Mokot x={32} y={19} s={0.35} />
    </>
  ),
};

const YEAK: Record<Kind, ReactNode> = {
  flipped: (
    <>
      <path
        d={FISH_FLIPPED}
        fill={Y.dark}
        stroke={Y.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M40 37 L48 43 V21 L40 27 Z"
        fill={Y.red}
        stroke={EDGE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="24.5" cy="33.5" r="1.8" fill={Y.red} />
      <Flames x={32} y={24} s={0.45} />
    </>
  ),
  khun: (
    <>
      <Flames x={32} y={40} s={1.9} />
      <path
        d="M18 40 H46 V46 H18 Z"
        fill={Y.dark}
        stroke={Y.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="43" r="1.4" fill={Y.red} />
      <circle cx="32" cy="43" r="1.4" fill={Y.red} />
      <circle cx="39" cy="43" r="1.4" fill={Y.red} />
    </>
  ),
  koul: (
    <>
      <path d="M26 47 L36 22" {...stroke(Y.ink, 3)} />
      <path
        d="M33 26 C33 18 38 13 43 15 C46 19 44 26 37 29 Z"
        fill={Y.red}
        stroke={EDGE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M38 17 L40 13 M43 21 L47 20 M40 26 L43 28"
        {...stroke(Y.ink, 2)}
      />
      <path d="M23 45 H31" {...stroke(Y.red, 3)} />
    </>
  ),
  neang: (
    <>
      <path
        d="M20 40 C16 32 16 24 20 18 C21 25 24 29 27 32 M44 40 C48 32 48 24 44 18 C43 25 40 29 37 32"
        fill={Y.red}
        stroke={EDGE}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M22 40 L25 31 L29 36 L32 27 L35 36 L39 31 L42 40 Z"
        fill={Y.dark}
        stroke={Y.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M21 40 H43" {...stroke(Y.ink, 2.4)} />
      <circle
        cx="32"
        cy="45"
        r="2.4"
        fill={Y.red}
        stroke={EDGE}
        strokeWidth="1"
      />
    </>
  ),
  seh: (
    <>
      <path
        d={HORSE}
        fill={Y.dark}
        stroke={Y.ink}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="21.5" r="1.8" fill={Y.red} />
      <path d="M37 18 C40 24 41 30 40 38" {...stroke(Y.red)} />
      <path
        d="M32 14 C30 10 31 7 33 6 C33 9 34 11 35 13"
        fill={Y.red}
        stroke={EDGE}
        strokeWidth="1.2"
      />
    </>
  ),
  trey: (
    <>
      <path
        d={FISH}
        fill={Y.dark}
        stroke={Y.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M40 27 L48 21 V43 L40 37 Z"
        fill={Y.red}
        stroke={EDGE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="24.5" cy="30.5" r="1.8" fill={Y.red} />
      <path
        d="M18 32 L22 33 L20 35 M22 33 L24 35"
        fill={Y.ink}
        stroke={Y.ink}
        strokeWidth="1"
      />
    </>
  ),
  tuk: (
    <>
      <path
        d={BOAT}
        fill={Y.dark}
        stroke={Y.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M50 31 L53 26 L49 27 Z"
        fill={Y.red}
        stroke={EDGE}
        strokeWidth="1"
      />
      <path d="M32 38 V19" {...stroke(Y.ink, 2.4)} />
      <path
        d="M32 19 L42 31 H32 Z"
        fill={Y.red}
        stroke={EDGE}
        strokeWidth="2"
      />
    </>
  ),
};

const MythPiece = ({ piece }: { piece: Piece }) => {
  const white = piece.side === "white";

  return (
    <>
      <circle
        cx="32"
        cy="32"
        r="28"
        fill={white ? T.body : Y.body}
        stroke={EDGE}
        strokeWidth="3"
      />
      <circle
        cx="32"
        cy="32"
        r="24"
        fill="none"
        stroke={white ? T.gold : Y.red}
        strokeWidth="2"
      />
      {(white ? TEVADA : YEAK)[piece.kind]}
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
    {theme === "matcha" ? (
      <MatchaPiece piece={piece} />
    ) : (
      <MythPiece piece={piece} />
    )}
  </svg>
);
