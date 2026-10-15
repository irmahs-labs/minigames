/** Line icons on a 24 × 24 grid, drawn in the surrounding text colour. */
const GLYPHS = {
  back: ["M15 18l-6-6 6-6"],
  close: ["M6 6l12 12M18 6L6 18"],
  leaf: ["M5 19c0-8 5-13 14-14-1 9-6 14-14 14z", "M5 19l7-7"],
  spin: ["M21 12a9 9 0 1 1-3-6.7", "M21 4v5h-5"],
} as const;

interface IconProps {
  name: keyof typeof GLYPHS;
  size?: number;
  weight?: number;
}

export const Icon = ({ name, size = 22, weight = 2.4 }: IconProps) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={weight}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {GLYPHS[name].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);
