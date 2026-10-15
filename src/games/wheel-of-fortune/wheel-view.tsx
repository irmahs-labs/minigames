import { fitLabel, slicePath } from "./wheel";

/** Slice fills, in turn: lime, sprout, paper, and a pale lime between. */
export const SLICE_COLORS = ["#dde87e", "#b8d970", "#f7f8de", "#cfe39a"];

/** Each slice's fill, never letting the last one match the first beside it. */
export const sliceColors = (count: number): string[] =>
  Array.from({ length: count }, (_, i) => {
    const color = SLICE_COLORS[i % SLICE_COLORS.length] ?? "#dde87e";

    return i === count - 1 && count > 1 && color === SLICE_COLORS[0]
      ? (SLICE_COLORS[1] ?? color)
      : color;
  });

const RADIUS = 100;
const LABEL_EDGE = 90;

const labelSize = (count: number) => {
  if (count <= 6) {
    return 9;
  }

  if (count <= 10) {
    return 7.5;
  }

  return 6.2;
};

interface WheelViewProps {
  /** The names on the wheel; with fewer than two, the empty slots show "?". */
  labels: readonly string[];
  emptySlots: number;
  rotation: number;
  durationMs: number;
}

export const WheelView = ({
  labels,
  emptySlots,
  rotation,
  durationMs,
}: WheelViewProps) => {
  const empty = labels.length < 2;
  const shown = empty ? Array.from({ length: emptySlots }, () => "?") : labels;
  const count = shown.length;
  const colors = sliceColors(count);
  const size = labelSize(count);
  const slice = 360 / count;
  const maxChars = count <= 10 ? 16 : 13;

  return (
    <div className="wheel">
      <svg
        aria-hidden="true"
        className="wheel__pointer"
        viewBox="0 0 40 46"
        width="40"
        height="46"
      >
        <path
          d="M6 4H34Q38 4 36 8L22 40Q20 44 18 40L4 8Q2 4 6 4Z"
          fill="var(--signal)"
          stroke="var(--outline)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle
          cx="20"
          cy="13"
          r="4"
          fill="var(--cream)"
          stroke="var(--outline)"
          strokeWidth="2"
        />
      </svg>
      <div className="wheel__rim" />
      <div
        className="wheel__disc"
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: `${durationMs}ms`,
        }}
      >
        {/* The slices panel lists the same names as text, so the drawing is
            decoration to a screen reader; the result is announced in the popup. */}
        <svg aria-hidden="true" viewBox="-100 -100 200 200">
          {shown.map((label, i) => (
            // Slices are positional: the same label may appear twice.
            // oxlint-disable-next-line no-array-index-key
            <g key={i}>
              <path
                d={slicePath(i, count, RADIUS)}
                fill={empty ? "var(--panel-raised)" : colors[i]}
                stroke="var(--ink)"
                strokeWidth="1"
              />
              <text
                transform={`rotate(${(i + 0.5) * slice - 90})`}
                x={LABEL_EDGE}
                y="0"
                dominantBaseline="central"
                textAnchor="end"
                fontSize={size}
                className={
                  empty ? "wheel__label wheel__label--empty" : "wheel__label"
                }
              >
                {fitLabel(label, maxChars)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div aria-hidden="true" className="wheel__hub">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--surface)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
          <path d="M5 19l7-7" />
        </svg>
      </div>
    </div>
  );
};
