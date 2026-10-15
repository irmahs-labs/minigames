import { useEffect, useReducer, useRef, useState } from "react";

import { APP_NAME } from "../../lib/brand";
import { Link } from "../../lib/router";
import { beep, primeAudio } from "./beep";
import { PRESETS, WHEEL_IDS } from "./presets";
import { ResultDialog } from "./result-dialog";
import {
  MAX_LABEL,
  MAX_SLOTS,
  MIN_SLOTS,
  loadState,
  namedSlices,
  reducer,
  saveState,
} from "./state";
import { landingRotation, randomIndex } from "./wheel";
import { WheelView, sliceColors } from "./wheel-view";

const SPIN_MS = 4500;
const REDUCED_SPIN_MS = 1200;
const RESET_CONFIRM_MS = 3000;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const WheelOfFortune = () => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  // 0 is never a live timer id, so clearing it is a harmless no-op.
  const spinTimer = useRef(0);
  const resetTimer = useRef(0);
  const [durationMs, setDurationMs] = useState(SPIN_MS);

  const preset = PRESETS[state.selected];
  const slots = state.wheels[state.selected];
  const labels = namedSlices(slots);
  const colors = sliceColors(labels.length);
  const canSpin = labels.length >= 2 && !spinning;

  useEffect(() => saveState(state), [state]);

  useEffect(() => {
    document.title = `Wheel of Fortune · ${APP_NAME}`;

    return () => {
      document.title = APP_NAME;
    };
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(spinTimer.current);
      window.clearTimeout(resetTimer.current);
    },
    []
  );

  const spin = () => {
    if (!canSpin) {
      return;
    }

    const { sound } = state;

    if (sound) {
      primeAudio();
    }

    // Read at each spin, so turning reduced motion on applies straight away.
    const spinMs = prefersReducedMotion() ? REDUCED_SPIN_MS : SPIN_MS;
    const index = randomIndex(labels.length);
    const landed = labels[index] ?? null;

    setDurationMs(spinMs);
    setWinner(null);
    setRotation((current) => landingRotation(current, index, labels.length));
    setSpinning(true);
    spinTimer.current = window.setTimeout(() => {
      setSpinning(false);
      setWinner(landed);

      if (sound) {
        beep();
      }
    }, spinMs + 100);
  };

  const reset = () => {
    window.clearTimeout(resetTimer.current);

    if (confirmReset) {
      setConfirmReset(false);
      dispatch({ type: "reset" });

      return;
    }

    setConfirmReset(true);
    resetTimer.current = window.setTimeout(
      () => setConfirmReset(false),
      RESET_CONFIRM_MS
    );
  };

  // A named slot's dot takes its slice's colour; an empty slot has none.
  const slotColors = slots.map((slot, i) =>
    slot.trim().length === 0
      ? null
      : (colors[namedSlices(slots.slice(0, i)).length] ?? null)
  );

  return (
    <main className="page">
      <header className="page__header">
        <Link href="/" className="back">
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          All games
        </Link>
        <h1 className="display page__title">Wheel of Fortune</h1>
        <p className="page__sub">pick a wheel, fill it in, give it a spin</p>
      </header>

      <nav aria-label="Wheels" className="picker">
        {WHEEL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className="picker__option"
            aria-pressed={state.selected === id}
            disabled={spinning}
            onClick={() => {
              setWinner(null);
              dispatch({ type: "select", wheel: id });
            }}
          >
            {PRESETS[id].name}
          </button>
        ))}
      </nav>

      <div className="layout">
        <section aria-label="Wheel" className="panel panel--wheel">
          <span className="legend">{preset.legend}</span>
          <WheelView
            labels={labels}
            emptySlots={slots.length}
            rotation={rotation}
            durationMs={durationMs}
          />
          <button
            type="button"
            className="btn btn--primary btn--spin"
            onClick={spin}
            disabled={!canSpin}
          >
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
            {spinning ? "spinning…" : "spin the wheel"}
          </button>
          <p className="hint" aria-live="polite">
            {labels.length < 2 ? "Name at least two slices to spin." : ""}
          </p>
        </section>

        <section aria-labelledby="slices-title" className="panel panel--slices">
          <span className="legend">slices</span>
          <div className="slices__head">
            <div className="stack">
              <h2 id="slices-title" className="field-label">
                On the wheel
              </h2>
              <span className="slices__count">
                {labels.length} <span>of {slots.length} named</span>
              </span>
            </div>
            <button
              type="button"
              className="btn btn--small"
              onClick={() => dispatch({ type: "add" })}
              disabled={spinning || slots.length >= MAX_SLOTS}
            >
              Add a slice
            </button>
          </div>

          <ol className="slices">
            {slots.map((slot, i) => (
              // Slots are positional and may share a name, so the index is the key.
              // oxlint-disable-next-line no-array-index-key
              <li key={i} className="slice">
                <span
                  aria-hidden="true"
                  className="slice__dot"
                  style={{ background: slotColors[i] ?? "transparent" }}
                />
                <label className="slice__num" htmlFor={`slice-${i}`}>
                  {String(i + 1).padStart(2, "0")}
                </label>
                <input
                  id={`slice-${i}`}
                  aria-label={`Slice ${i + 1}`}
                  className="slice__input"
                  value={slot}
                  maxLength={MAX_LABEL}
                  placeholder="Type a name"
                  disabled={spinning}
                  onChange={(event) =>
                    dispatch({
                      index: i,
                      label: event.target.value,
                      type: "rename",
                    })
                  }
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove slice ${i + 1}`}
                  disabled={
                    spinning || (slots.length <= MIN_SLOTS && slot === "")
                  }
                  onClick={() => dispatch({ index: i, type: "remove" })}
                >
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ol>

          <div className="slices__foot">
            <button
              type="button"
              role="switch"
              aria-checked={state.sound}
              className="switch"
              onClick={() => dispatch({ on: !state.sound, type: "sound" })}
            >
              <span>Beep when it lands</span>
              <span aria-hidden="true" className="switch__track">
                <span className="switch__thumb" />
              </span>
            </button>
            <button
              type="button"
              className="btn btn--quiet btn--small"
              onClick={reset}
              disabled={spinning}
            >
              {confirmReset ? "Sure? Reset it" : `Reset ${preset.name}`}
            </button>
          </div>
          <p className="hint">Saved in this browser only.</p>
        </section>
      </div>

      <ResultDialog
        winner={winner}
        kicker={preset.kicker}
        canRemove={labels.length > 2}
        onClose={() => setWinner(null)}
        onSpinAgain={spin}
        onRemove={() => {
          if (winner !== null) {
            dispatch({ label: winner, type: "removeLabel" });
          }

          setWinner(null);
        }}
      />
    </main>
  );
};

export default WheelOfFortune;
