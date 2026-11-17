import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { useCopy, useLanguage } from "../../lib/language";
import type { Language } from "../../lib/language";
import { cryptoRandom } from "../../lib/random";
import {
  EIGHT,
  IDENTITY,
  STILL,
  WINDOW,
  WINDOW_UP,
  dragTurn,
  feedShake,
  forceOf,
  fromAxisAngle,
  linesOf,
  multiply,
  pickAnswer,
  project,
  scaled,
  slerp,
  ZERO,
} from "./eight-ball";
import type { Answer, Quat, ShakeState, Vec } from "./eight-ball";

/** The page's words, in each of the site's languages. */
const COPY = {
  en: {
    about:
      "Twenty answers: ten say yes, five say maybe, five say no. It is a toy, not an oracle, so ask again whenever you like.",
    felt: "Shake your phone to ask, or flick the ball.",
    flick: "Flick the ball hard to shake it, or drag it to turn it and peek.",
    hold: "Hold a question in your mind.",
    how: "How it works",
    motionOff:
      " Motion is off for this site; you can allow it in your browser's settings.",
    placeholder: "Ask a yes-or-no question…",
    question: "Your question",
    shake: "Shake the ball",
    shakePhone: "Shake your phone instead",
    step1: "Think of a question that can be answered yes or no.",
    step2:
      "Shake: shake your phone, flick the ball with your finger or the mouse, or press the button.",
    step3:
      "The ball tumbles, then rolls its window up to you, and the die floats up with your answer.",
    step4: "Drag the ball gently to turn it over and look at it from any side.",
    stirring: "The spirits are stirring…",
    sub: "ask a yes-or-no question, and shake",
    title: "Ask the Magic 8 Ball",
  },
  fr: {
    about:
      "Vingt réponses : dix disent oui, cinq peut-être, cinq non. C’est un jouet, pas un oracle, alors redemandez quand vous voulez.",
    felt: "Secouez votre téléphone pour demander, ou lancez la boule d’un coup.",
    flick:
      "Lancez la boule d’un coup sec pour la secouer, ou faites-la glisser pour la tourner et regarder.",
    hold: "Gardez une question en tête.",
    how: "Comment ça marche",
    motionOff:
      " Le mouvement est désactivé pour ce site ; vous pouvez l’autoriser dans les réglages du navigateur.",
    placeholder: "Posez une question fermée…",
    question: "Votre question",
    shake: "Secouer la boule",
    shakePhone: "Secouer plutôt votre téléphone",
    step1: "Pensez à une question à laquelle on répond par oui ou par non.",
    step2:
      "Secouez : secouez votre téléphone, lancez la boule du doigt ou à la souris, ou appuyez sur le bouton.",
    step3:
      "La boule roule, puis tourne sa fenêtre vers vous, et le dé remonte avec votre réponse.",
    step4:
      "Faites glisser la boule doucement pour la retourner et la regarder sous tous les angles.",
    stirring: "Les esprits s’agitent…",
    sub: "posez une question fermée, et secouez",
    title: "Interrogez la boule magique",
  },
};

/** The ball's radius, in the drawing's units (it is 300 across, with room). */
const RADIUS = 130;

/** How long a shaken ball tumbles before it settles, in milliseconds. */
const SPIN_MS = 900;

/** How long it takes to roll its window up to you afterwards. */
const SETTLE_MS = 900;

/** A flick at least this fast, in pixels a millisecond, shakes the ball. */
const FLICK = 1.1;

/** How much spin is left after each millisecond of tumbling. */
const DRAG = 0.997;

type Phase = "idle" | "spinning" | "settling" | "answered";

/**
 * Whether the page may ask for the motion sensor: "ask" on a touch screen
 * whose browser has requestPermission (an iPhone shows nothing until it is
 * asked; Chrome answers yes at once), and "denied" once refused.
 */
type Motion = "none" | "ask" | "denied";

/** DeviceMotionEvent, with requestPermission where the browser has it. */
interface MotionEventClass {
  prototype: DeviceMotionEvent;
  requestPermission?: () => Promise<"granted" | "denied">;
}

const motionEventClass = (): MotionEventClass | null =>
  "DeviceMotionEvent" in window ? DeviceMotionEvent : null;

const startingMotion = (): Motion =>
  motionEventClass()?.requestPermission &&
  window.matchMedia("(pointer: coarse)").matches
    ? "ask"
    : "none";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ease = (t: number) => 1 - (1 - t) ** 3;

/** A spin about a random axis, about `speed` radians a millisecond. */
const randomSpin = (speed: number): Vec => {
  const axis: Vec = [
    cryptoRandom() - 0.5,
    cryptoRandom() - 0.5,
    cryptoRandom() - 0.5,
  ];

  return scaled(axis, speed / (Math.hypot(...axis) || 1));
};

const spun = (turn: Quat, spin: Vec, ms: number): Quat =>
  multiply(fromAxisAngle(spin, Math.hypot(...spin) * ms), turn);

/** The ball as drawn: a sphere with the 8 and the window turning with it. */
const Ball = ({
  turn,
  answer,
  showing,
}: {
  turn: Quat;
  answer: Answer | null;
  showing: boolean;
}) => {
  const eight = project(turn, EIGHT, RADIUS);
  const window = project(turn, WINDOW, RADIUS);
  const language = useLanguage();
  const lines = answer ? linesOf(answer.text[language]) : [];

  return (
    <svg
      viewBox="-150 -150 300 300"
      className="eight-ball__ball"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="eight-ball-gloss" cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="var(--white)" stopOpacity="0.55" />
          <stop offset="35%" stopColor="var(--white)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--white)" stopOpacity="0" />
        </radialGradient>
        <clipPath id="eight-ball-clip">
          <circle r={RADIUS} />
        </clipPath>
      </defs>
      <ellipse cy="142" rx="92" ry="7" fill="var(--outline)" opacity="0.2" />
      <circle r={RADIUS} fill="var(--ball)" />
      <g clipPath="url(#eight-ball-clip)">
        {eight.facing > 0 ? (
          <g transform={`matrix(${eight.matrix.join(" ")}) scale(0.01)`}>
            <circle r="100" fill="var(--white)" />
            <text
              y="36"
              textAnchor="middle"
              className="eight-ball__eight"
              fill="var(--ball)"
            >
              8
            </text>
          </g>
        ) : null}
        {window.facing > 0 ? (
          <g transform={`matrix(${window.matrix.join(" ")}) scale(0.01)`}>
            <circle r="100" fill="var(--ball-liquid)" />
            <circle r="96" fill="none" stroke="var(--ball)" strokeWidth="8" />
            <g className="eight-ball__die" opacity={showing ? 1 : 0}>
              <polygon points="0,-82 74,46 -74,46" fill="var(--ball-die)" />
              {lines.map((line, i) => (
                <text
                  key={line}
                  y={12 + (i - (lines.length - 1) / 2) * 17}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="eight-ball__answer"
                  fill="var(--white)"
                >
                  {line}
                </text>
              ))}
            </g>
          </g>
        ) : null}
      </g>
      <circle
        r={RADIUS}
        fill="url(#eight-ball-gloss)"
        stroke="var(--outline)"
        strokeWidth="2"
      />
    </svg>
  );
};

/** What the animation keeps between frames. */
interface Live {
  answer: Answer | null;
  /** The pending animation frame, or 0. */
  frame: number;
  /** When the last frame ran. */
  last: number;
  phase: Phase;
  settleFrom: Quat;
  shakeState: ShakeState;
  /** Radians a millisecond, about its own direction. */
  spin: Vec;
  /** When the tumble or the settling began. */
  started: number;
  turn: Quat;
}

const AT_REST: Live = {
  answer: null,
  frame: 0,
  last: 0,
  phase: "idle",
  settleFrom: IDENTITY,
  shakeState: STILL,
  spin: ZERO,
  started: 0,
  turn: IDENTITY,
};

/** A finger or the mouse on the ball: where, when, and how fast it moves. */
interface Held {
  x: number;
  y: number;
  time: number;
  vx: number;
  vy: number;
}

/** What the line under the ball says. */
const captionOf = (
  phase: Phase,
  answer: Answer | null,
  stirring: string,
  language: Language
) => {
  if (phase === "spinning" || phase === "settling") {
    return stirring;
  }

  return phase === "answered" && answer ? answer.text[language] : null;
};

/** The Magic 8 Ball: ask, shake, and read the answer. */
const MagicEightBall = () => {
  const t = useCopy(COPY);
  const language = useLanguage();
  const [turn, setTurn] = useState<Quat>(IDENTITY);
  const [phase, setPhase] = useState<Phase>("idle");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [question, setQuestion] = useState("");
  const [motion, setMotion] = useState<Motion>(startingMotion);
  // Whether the phone has sent real readings: a laptop has the API but no sensor.
  const [felt, setFelt] = useState(false);

  // The animation's own state, read and written every frame.
  const live = useRef<Live>({ ...AT_REST });
  const drag = useRef<Held | null>(null);

  const enter = (next: Phase) => {
    live.current.phase = next;
    setPhase(next);
  };

  const tick = (now: number) => {
    const state = live.current;
    const ms = Math.min(48, now - (state.last || now));

    state.last = now;

    if (state.phase === "settling") {
      const done = Math.min(1, (now - state.started) / SETTLE_MS);

      state.turn = slerp(state.settleFrom, WINDOW_UP, ease(done));

      if (done >= 1) {
        enter("answered");
      }
    } else {
      state.turn = spun(state.turn, state.spin, ms);
      state.spin = scaled(state.spin, DRAG ** ms);

      if (state.phase === "spinning" && now - state.started >= SPIN_MS) {
        state.settleFrom = state.turn;
        state.started = now;
        state.spin = ZERO;
        enter("settling");
      }
    }

    setTurn(state.turn);

    const moving =
      state.phase === "spinning" ||
      state.phase === "settling" ||
      Math.hypot(...state.spin) > 0.00005;

    state.frame = moving ? requestAnimationFrame(tick) : 0;
  };

  const run = () => {
    const state = live.current;

    if (state.frame === 0) {
      state.last = 0;
      state.frame = requestAnimationFrame(tick);
    }
  };

  /** Shake the ball: a new answer, a tumble, and the window rolls up. */
  const shake = (spin?: Vec) => {
    const state = live.current;

    if (state.phase === "spinning" || state.phase === "settling") {
      return;
    }

    const next = pickAnswer(cryptoRandom, state.answer);

    state.answer = next;
    setAnswer(next);

    if (reducedMotion()) {
      state.turn = WINDOW_UP;
      state.spin = ZERO;
      setTurn(WINDOW_UP);
      enter("answered");

      return;
    }

    state.spin = spin ?? randomSpin(0.022);
    state.started = performance.now();
    enter("spinning");
    run();
  };

  useEffect(() => () => cancelAnimationFrame(live.current.frame), []);

  const onMotion = useEffectEvent((event: DeviceMotionEvent) => {
    const force = forceOf(
      event.acceleration,
      event.accelerationIncludingGravity
    );

    if (force === null) {
      return;
    }

    setFelt(true);

    const result = feedShake(live.current.shakeState, {
      force,
      time: event.timeStamp,
    });

    live.current.shakeState = result.state;

    if (result.felt === "shake") {
      shake();
    } else if (result.felt === "jolt" && live.current.phase === "idle") {
      // A jolt that is not yet a shake gives the ball a wobble.
      live.current.spin = randomSpin(0.004);
      run();
    }
  });

  // Listen wherever the browser has the sensor: on Android readings come at
  // once, on an iPhone only after asking, and on a laptop never.
  useEffect(() => {
    if (!motionEventClass()) {
      return;
    }

    const listener = (event: DeviceMotionEvent) => onMotion(event);

    window.addEventListener("devicemotion", listener);

    return () => window.removeEventListener("devicemotion", listener);
  }, []);

  const askForMotion = async () => {
    const ask = motionEventClass()?.requestPermission;

    if (!ask) {
      return;
    }

    try {
      setMotion((await ask()) === "granted" ? "none" : "denied");
    } catch {
      setMotion("denied");
    }
  };

  const busy = phase === "spinning" || phase === "settling";

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (busy) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    live.current.spin = ZERO;
    drag.current = {
      time: event.timeStamp,
      vx: 0,
      vy: 0,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const held = drag.current;

    if (!held || busy) {
      return;
    }

    // Screen pixels to the drawing's units, so a drag rolls the ball under the finger.
    const scale = 300 / event.currentTarget.getBoundingClientRect().width;
    const dx = (event.clientX - held.x) * scale;
    const dy = (event.clientY - held.y) * scale;
    const ms = Math.max(1, event.timeStamp - held.time);

    live.current.turn = multiply(dragTurn(dx, dy, RADIUS), live.current.turn);
    setTurn(live.current.turn);
    drag.current = {
      time: event.timeStamp,
      // The pointer's speed, smoothed over the last few moves.
      vx: held.vx * 0.5 + (dx / ms) * 0.5,
      vy: held.vy * 0.5 + (dy / ms) * 0.5,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const held = drag.current;

    drag.current = null;

    // A pause before letting go means no flick.
    if (!held || busy || event.timeStamp - held.time > 80) {
      return;
    }

    const speed = Math.hypot(held.vx, held.vy);
    const spin: Vec = [held.vy / RADIUS, held.vx / RADIUS, 0];

    if (speed >= FLICK) {
      shake(spin);
    } else {
      live.current.spin = spin;
      run();
    }
  };

  const caption = captionOf(phase, answer, t.stirring, language);

  return (
    <main className="page">
      <p className="page__sub">{t.sub}</p>
      <div className="layout">
        <section
          aria-labelledby="eight-ball-title"
          className="panel panel--wide eight-ball"
        >
          <span className="legend">magic-8-ball.gif</span>
          <h2 id="eight-ball-title" className="display eight-ball__title">
            {t.title}
          </h2>
          <input
            className="field"
            aria-label={t.question}
            placeholder={t.placeholder}
            maxLength={120}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <div
            className="eight-ball__stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <Ball turn={turn} answer={answer} showing={phase === "answered"} />
          </div>
          <p
            className={
              phase === "answered"
                ? "display eight-ball__caption"
                : "display eight-ball__caption eight-ball__caption--waiting"
            }
            aria-live="polite"
          >
            {caption ?? (question.trim() ? `“${question.trim()}”` : t.hold)}
          </p>
          <div className="eight-ball__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() => shake()}
            >
              {t.shake}
            </button>
            {motion === "ask" && !felt ? (
              <button type="button" className="btn" onClick={askForMotion}>
                {t.shakePhone}
              </button>
            ) : null}
          </div>
          <p className="hint">
            {felt ? t.felt : t.flick}
            {motion === "denied" ? t.motionOff : ""}
          </p>
        </section>

        <section
          aria-labelledby="eight-ball-how"
          className="panel panel--narrow eight-ball__how"
        >
          <span className="legend">how-it-works.txt</span>
          <h2 id="eight-ball-how" className="display eight-ball__title">
            {t.how}
          </h2>
          <ol className="how-to">
            <li>{t.step1}</li>
            <li>{t.step2}</li>
            <li>{t.step3}</li>
            <li>{t.step4}</li>
          </ol>
          <p className="hint">{t.about}</p>
        </section>
      </div>
    </main>
  );
};

export default MagicEightBall;
