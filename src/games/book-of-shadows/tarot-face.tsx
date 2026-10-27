import type { ReactNode } from "react";

import type { Suit, TarotCard } from "./tarot";

/** A pentagram in a circle, for the pentacles. */
const PENTAGRAM = Array.from({ length: 5 }, (_, i) => {
  const turn = ((-90 + i * 144) * Math.PI) / 180;

  return `${(30 + 11 * Math.cos(turn)).toFixed(2)} ${(50 + 11 * Math.sin(turn)).toFixed(2)}`;
}).join(" L");

const SUIT_MARKS: Record<Suit, ReactNode> = {
  cups: (
    <>
      <path d="M19 34h22q0 15-11 17q-11-2-11-17z" />
      <path d="M30 51v11M23 64h14" />
    </>
  ),
  pentacles: (
    <>
      <circle cx="30" cy="50" r="14" />
      <path d={`M${PENTAGRAM}Z`} />
    </>
  ),
  swords: (
    <>
      <path d="M30 24v38" strokeWidth="3" />
      <path d="M21 58h18" />
      <circle cx="30" cy="68" r="3" />
    </>
  ),
  wands: (
    <>
      <path d="M24 72l12-46" strokeWidth="3" />
      <path d="M34 34q6-2 7 3q-5 2-7-3zM27 50q-6-1-7 4q5 1 7-4z" />
    </>
  ),
};

/** A four-pointed star, for the major arcana. */
const MAJOR_MARK = (
  <path
    d="M30 30q2 18 18 20q-16 2-18 20q-2-18-18-20q16-2 18-20z"
    fill="var(--accent)"
  />
);

interface TarotFaceProps {
  card: TarotCard;
  reversed?: boolean;
  /** Its width in pixels; a card is 60 × 100. */
  width?: number;
  /** Whether to write the name at its foot: too small to read on a thumbnail. */
  named?: boolean;
}

/**
 * A card's face, drawn flat like the rest of the site: its numeral or rank
 * at the top, its suit's mark (or a star, for the major arcana) in the
 * middle, and upside down when it was drawn reversed.
 */
export const TarotFace = ({
  card,
  reversed = false,
  width = 60,
  named = false,
}: TarotFaceProps) => (
  <svg
    aria-hidden="true"
    className="tarot-face"
    width={width}
    height={(width * 100) / 60}
    viewBox="0 0 60 100"
  >
    <g transform={reversed ? "rotate(180 30 50)" : undefined}>
      <rect
        x="1.5"
        y="1.5"
        width="57"
        height="97"
        rx="6"
        fill={card.suit ? "var(--raised)" : "var(--accent-soft)"}
        stroke="var(--outline)"
        strokeWidth="2"
      />
      <rect
        x="6"
        y="6"
        width="48"
        height="88"
        rx="3"
        fill="none"
        stroke="var(--outline)"
        strokeWidth="0.75"
      />
      <text x="30" y="17" textAnchor="middle" className="tarot-face__label">
        {card.label}
      </text>
      <g
        fill="none"
        stroke="var(--outline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {card.suit ? SUIT_MARKS[card.suit] : MAJOR_MARK}
      </g>
      {named ? (
        <text x="30" y="87" textAnchor="middle" className="tarot-face__name">
          {card.name.replace(/^The /u, "")}
        </text>
      ) : null}
    </g>
  </svg>
);

/** A card face down: the back of the deck, before it is turned over. */
export const TarotBack = ({ width = 60 }: { width?: number }) => (
  <svg
    aria-hidden="true"
    className="tarot-face"
    width={width}
    height={(width * 100) / 60}
    viewBox="0 0 60 100"
  >
    <rect
      x="1.5"
      y="1.5"
      width="57"
      height="97"
      rx="6"
      fill="var(--strong)"
      stroke="var(--outline)"
      strokeWidth="2"
    />
    <rect
      x="6"
      y="6"
      width="48"
      height="88"
      rx="3"
      fill="none"
      stroke="var(--on-strong)"
      strokeWidth="0.75"
      opacity="0.6"
    />
    <circle
      cx="30"
      cy="50"
      r="12"
      fill="none"
      stroke="var(--on-strong)"
      strokeWidth="1.2"
    />
    <path d="M33 41.5a9 9 0 1 0 0 17a7 7 0 1 1 0-17z" fill="var(--on-strong)" />
    <path
      d="M30 18l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM30 74l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"
      fill="var(--on-strong)"
    />
  </svg>
);
