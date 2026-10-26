/**
 * The Magic 8 Ball: twenty answers, a ball that turns in three dimensions
 * (as a quaternion), and a shake detector for a phone's motion sensors.
 * View space has x to the right, y up and z toward the viewer.
 */
export type Mood = "yes" | "maybe" | "no";

export interface Answer {
  text: string;
  mood: Mood;
}

/** The classic twenty: ten yes, five maybe, five no. */
export const ANSWERS: readonly Answer[] = [
  { mood: "yes", text: "It is certain" },
  { mood: "yes", text: "It is decidedly so" },
  { mood: "yes", text: "Without a doubt" },
  { mood: "yes", text: "Yes, definitely" },
  { mood: "yes", text: "You may rely on it" },
  { mood: "yes", text: "As I see it, yes" },
  { mood: "yes", text: "Most likely" },
  { mood: "yes", text: "Outlook good" },
  { mood: "yes", text: "Yes" },
  { mood: "yes", text: "Signs point to yes" },
  { mood: "maybe", text: "Reply hazy, try again" },
  { mood: "maybe", text: "Ask again later" },
  { mood: "maybe", text: "Better not tell you now" },
  { mood: "maybe", text: "Cannot predict now" },
  { mood: "maybe", text: "Concentrate and ask again" },
  { mood: "no", text: "Don't count on it" },
  { mood: "no", text: "My reply is no" },
  { mood: "no", text: "My sources say no" },
  { mood: "no", text: "Outlook not so good" },
  { mood: "no", text: "Very doubtful" },
];

/** An answer, `random` giving 0 ≤ n < 1; never the same one twice running. */
export const pickAnswer = (
  random: () => number,
  previous: Answer | null = null
): Answer => {
  const pool = ANSWERS.filter((answer) => answer !== previous);
  const answer = pool[Math.floor(random() * pool.length)] ?? pool[0];

  if (!answer) {
    throw new Error("No answers");
  }

  return answer;
};

/** "Better not tell you now" → ["Better not", "tell you", "now"]: lines for the die. */
export const linesOf = (text: string, width = 10): string[] => {
  const lines: string[] = [];

  for (const word of text.split(" ")) {
    const last = lines.at(-1);

    if (last !== undefined && `${last} ${word}`.length <= width) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }

  return lines;
};

export type Vec = readonly [x: number, y: number, z: number];

/** A rotation, as a unit quaternion [w, x, y, z]. */
export type Quat = readonly [w: number, x: number, y: number, z: number];

export const IDENTITY: Quat = [1, 0, 0, 0];

export const ZERO: Vec = [0, 0, 0];

export const scaled = ([x, y, z]: Vec, factor: number): Vec => [
  x * factor,
  y * factor,
  z * factor,
];

const normalize = ([w, x, y, z]: Quat): Quat => {
  const length = Math.hypot(w, x, y, z) || 1;

  return [w / length, x / length, y / length, z / length];
};

/** A turn of `angle` radians about `axis` (any length but zero). */
export const fromAxisAngle = (axis: Vec, angle: number): Quat => {
  const length = Math.hypot(...axis);

  if (length === 0 || angle === 0) {
    return IDENTITY;
  }

  const s = Math.sin(angle / 2) / length;

  return [Math.cos(angle / 2), axis[0] * s, axis[1] * s, axis[2] * s];
};

/** `a` after `b`: the turn `b`, then the turn `a`. */
export const multiply = (a: Quat, b: Quat): Quat =>
  normalize([
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ]);

/** Where the turn `q` takes the point `v`. */
export const rotate = (q: Quat, [vx, vy, vz]: Vec): Vec => {
  const [w, x, y, z] = q;
  // v + 2w(u × v) + 2u × (u × v), with u the quaternion's vector part.
  const cx = y * vz - z * vy;
  const cy = z * vx - x * vz;
  const cz = x * vy - y * vx;

  return [
    vx + 2 * (w * cx + y * cz - z * cy),
    vy + 2 * (w * cy + z * cx - x * cz),
    vz + 2 * (w * cz + x * cy - y * cx),
  ];
};

/** The turn part of the way from `a` to `b`, the shorter way round. */
export const slerp = (a: Quat, b: Quat, t: number): Quat => {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let end = b;

  if (dot < 0) {
    dot = -dot;
    end = [-b[0], -b[1], -b[2], -b[3]];
  }

  if (dot > 0.9995) {
    return normalize([
      a[0] + (end[0] - a[0]) * t,
      a[1] + (end[1] - a[1]) * t,
      a[2] + (end[2] - a[2]) * t,
      a[3] + (end[3] - a[3]) * t,
    ]);
  }

  const theta = Math.acos(dot);
  const sa = Math.sin((1 - t) * theta) / Math.sin(theta);
  const sb = Math.sin(t * theta) / Math.sin(theta);

  return normalize([
    a[0] * sa + end[0] * sb,
    a[1] * sa + end[1] * sb,
    a[2] * sa + end[2] * sb,
    a[3] * sa + end[3] * sb,
  ]);
};

/**
 * The turn a drag of (dx, dy) screen pixels gives a ball of `radius`
 * pixels: like rolling it under a finger. Screen y points down.
 */
export const dragTurn = (dx: number, dy: number, radius: number): Quat =>
  fromAxisAngle([dy, dx, 0], Math.hypot(dx, dy) / radius);

/**
 * The ball with its window, on its back, facing the viewer upright: half a
 * turn about the vertical from where it starts, with the 8 to the front.
 */
export const WINDOW_UP: Quat = fromAxisAngle([0, 1, 0], Math.PI);

/** A flat disc on the ball: the 8 on the front, the window on the back. */
export interface Decal {
  /** Where its middle points, in the ball's own frame. */
  normal: Vec;
  /** Its right and its up, in the ball's own frame. */
  right: Vec;
  up: Vec;
}

export const EIGHT: Decal = {
  normal: [0, 0, 1],
  right: [1, 0, 0],
  up: [0, 1, 0],
};

export const WINDOW: Decal = {
  normal: [0, 0, -1],
  right: [-1, 0, 0],
  up: [0, 1, 0],
};

/** Half the angle a decal covers, seen from the ball's middle. */
export const DECAL_ANGLE = (38 * Math.PI) / 180;

export interface Projected {
  /** How squarely it faces the viewer: 1 head on, 0 edge on, below 0 hidden. */
  facing: number;
  /**
   * An SVG matrix(a b c d e f) taking the unit disc (y down) onto the
   * screen, around the ball's middle, as the decal sits on a ball of `radius`.
   */
  matrix: readonly [number, number, number, number, number, number];
}

/**
 * Where a decal lands on screen with the ball turned by `q`: a flat disc
 * just under the sphere's skin, seen straight on (orthographic), so it
 * squashes to an ellipse as it turns away.
 */
export const project = (q: Quat, decal: Decal, radius: number): Projected => {
  const normal = rotate(q, decal.normal);
  const right = rotate(q, decal.right);
  const up = rotate(q, decal.up);
  const size = radius * Math.sin(DECAL_ANGLE);
  const depth = radius * Math.cos(DECAL_ANGLE);

  return {
    facing: normal[2],
    matrix: [
      size * right[0],
      -size * right[1],
      -size * up[0],
      size * up[1],
      depth * normal[0],
      -depth * normal[1],
    ],
  };
};

/** One reading of the phone's motion sensor, in m/s² and milliseconds. */
export interface MotionSample {
  /** How hard the phone is being moved, gravity taken out. */
  force: number;
  time: number;
}

/** A jolt is a push this hard, about two g. */
const JOLT = 15;

/** Jolts closer together than this count as one. */
const JOLT_GAP_MS = 90;

/** This many jolts inside the window make a shake. */
const JOLTS = 3;
const WINDOW_MS = 1200;

/** After a shake, the ball ignores more for this long. */
const REST_MS = 1500;

/** What the shake detector remembers between samples. */
export interface ShakeState {
  /** When the recent jolts came. */
  jolts: readonly number[];
  /** Until when it ignores everything, after a shake. */
  restUntil: number;
}

/** What one sample adds up to, and what the detector remembers after it. */
export interface Felt {
  felt: "shake" | "jolt" | null;
  state: ShakeState;
}

export const STILL: ShakeState = { jolts: [], restUntil: 0 };

/**
 * Tells a shake from the phone's ordinary jiggling: three hard jolts inside
 * a second or so. Given every sample in turn, it says "jolt" for each hard
 * one (to nudge the ball) and "shake" when they add up.
 */
export const feedShake = (
  state: ShakeState,
  { force, time }: MotionSample
): Felt => {
  const last = state.jolts.at(-1);

  if (
    time < state.restUntil ||
    force < JOLT ||
    (last !== undefined && time - last < JOLT_GAP_MS)
  ) {
    return { felt: null, state };
  }

  const jolts = [...state.jolts.filter((at) => time - at <= WINDOW_MS), time];

  return jolts.length >= JOLTS
    ? { felt: "shake", state: { jolts: [], restUntil: time + REST_MS } }
    : { felt: "jolt", state: { ...state, jolts } };
};

/** Standard gravity, in m/s². */
const GRAVITY = 9.81;

interface Axes {
  x: number | null;
  y: number | null;
  z: number | null;
}

/** An acceleration's size, when the phone gave all three axes. */
const sizeOf = (axes: Axes | null): number | null =>
  axes && axes.x !== null && axes.y !== null && axes.z !== null
    ? Math.hypot(axes.x, axes.y, axes.z)
    : null;

/**
 * How hard a devicemotion event says the phone moved: from `acceleration`
 * where the phone gives it, else from the gravity-included one, less g.
 */
export const forceOf = (
  acceleration: Axes | null,
  withGravity: Axes | null
): number | null => {
  const bare = sizeOf(acceleration);

  if (bare !== null) {
    return bare;
  }

  const total = sizeOf(withGravity);

  return total === null ? null : Math.abs(total - GRAVITY);
};
