/**
 * The wheel's geometry. Angles are degrees clockwise from the top, where the
 * pointer sits; slice i covers [i, i + 1) × 360 / count before any spin.
 */

/** Whole turns a spin makes before it settles, so it never looks short. */
const TURNS = 6;

/** How far from a slice's centre a spin may land, as a share of its width. */
const JITTER = 0.6;

const mod360 = (degrees: number) => ((degrees % 360) + 360) % 360;

/** A uniform random index below count, from the browser's crypto source. */
export const randomIndex = (count: number): number => {
  // Rejection sampling keeps every index equally likely.
  const limit = Math.floor(0x1_00_00_00_00 / count) * count;
  const buffer = new Uint32Array(1);

  for (;;) {
    crypto.getRandomValues(buffer);
    const value = buffer[0] ?? 0;

    if (value < limit) {
      return value % count;
    }
  }
};

/**
 * The rotation that ends a spin on slice index, starting from current.
 * `offset` in [-0.5, 0.5] moves the landing point inside the slice.
 */
export const landingRotation = (
  current: number,
  index: number,
  count: number,
  offset = Math.random() - 0.5
): number => {
  const slice = 360 / count;
  const target = mod360(360 - (index + 0.5 + offset * JITTER) * slice);
  const delta = mod360(target - mod360(current));

  return current + TURNS * 360 + delta;
};

/** The slice under the pointer once the wheel has turned by rotation. */
export const sliceAt = (rotation: number, count: number): number =>
  Math.floor(mod360(-rotation) / (360 / count)) % count;

/** An SVG path for slice index of count on a wheel of radius r at 0,0. */
export const slicePath = (index: number, count: number, r: number): string => {
  const point = (degrees: number) => {
    const radians = ((degrees - 90) * Math.PI) / 180;

    return `${(r * Math.cos(radians)).toFixed(3)} ${(r * Math.sin(radians)).toFixed(3)}`;
  };

  const slice = 360 / count;
  const large = slice > 180 ? 1 : 0;

  return `M0 0L${point(index * slice)}A${r} ${r} 0 ${large} 1 ${point((index + 1) * slice)}Z`;
};

/** A label short enough to fit its slice, ending in an ellipsis if cut. */
export const fitLabel = (label: string, max: number): string =>
  label.length <= max ? label : `${label.slice(0, max - 1).trimEnd()}…`;
