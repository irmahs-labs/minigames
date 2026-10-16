/** Line icons on a 24 × 24 grid, drawn in the surrounding text colour. */
const GLYPHS = {
  back: ["M15 18l-6-6 6-6"],
  close: ["M6 6l12 12M18 6L6 18"],
  leaf: ["M5 19c0-8 5-13 14-14-1 9-6 14-14 14z", "M5 19l7-7"],
  moon: ["M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"],
  spin: ["M21 12a9 9 0 1 1-3-6.7", "M21 4v5h-5"],
  sun: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8z",
    "M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  ],
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
