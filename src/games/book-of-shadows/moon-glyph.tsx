import { illuminationOf } from "./sky";

interface MoonGlyphProps {
  /** The Moon's angle: 0 new, 90 first quarter, 180 full. */
  angle: number;
  size?: number;
  /** Below the equator the Moon is seen the other way round. */
  southern?: boolean;
  /** What it shows, for a moon that stands alone; none for one with a caption. */
  label?: string;
}

/**
 * The Moon as it looks: a dark disc with its lit part in cream, bounded by
 * the limb on one side and the terminator, an ellipse as wide as the cosine
 * of its angle, on the other. Fixed drawing colours, the same in both themes.
 */
export const MoonGlyph = ({
  angle,
  size = 24,
  southern = false,
  label,
}: MoonGlyphProps) => {
  const lit = illuminationOf(angle);
  const waxing = angle < 180;
  const crescent = lit < 0.5;
  const rx = 10 * Math.abs(Math.cos((angle * Math.PI) / 180));
  // From the top round the lit side to the bottom, then back by the terminator.
  const litPart = `M12 2A10 10 0 0 ${waxing ? 1 : 0} 12 22A${rx.toFixed(3)} 10 0 0 ${waxing === crescent ? 0 : 1} 12 2Z`;

  return (
    <svg
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="moon-glyph"
    >
      <g transform={southern ? "matrix(-1 0 0 1 24 0)" : undefined}>
        <circle cx="12" cy="12" r="10" fill="var(--ink)" />
        {lit > 0.005 ? <path d={litPart} fill="var(--cream)" /> : null}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="var(--outline)"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
};
