import { useEffect, useReducer, useState } from "react";

import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { Link } from "../../lib/router";
import { useConfirm } from "../../lib/use-confirm";
import { beep, primeAudio } from "./beep";
import { EXAMPLES, EXAMPLE_IDS } from "./examples";
import type { ExampleId } from "./examples";
import { ResultDialog } from "./result-dialog";
import {
  MAX_LABEL,
  MAX_NAME,
  MAX_SLOTS,
  MAX_WHEELS,
  MIN_SLOTS,
  currentWheel,
  loadState,
  namedPositions,
  namedSlices,
  reducer,
  saveState,
} from "./state";
import { landingRotation, randomIndex } from "./wheel";
import { WheelView, sliceColors } from "./wheel-view";

/** A wheel's name as a filename for its panel's pill: "Team lunch" → team-lunch. */
const legendFor = (name: string) => {
  const slug = name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");

  return `${slug || "untitled"}.wheel`;
};

const WheelOfFortune = ({ name }: GameProps) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [rotation, setRotation] = useState(0);
  // The slice a spin is heading for while the wheel turns, then the one it won.
  const [landing, setLanding] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const confirm = useConfirm();

  const wheel = currentWheel(state);
  const { slots } = wheel;
  const labels = namedSlices(slots);
  const positions = namedPositions(slots);
  const colors = sliceColors(labels.length);
  const spinning = landing !== null;
  const tooFew = labels.length < MIN_SLOTS;
  const canSpin = !tooFew && !spinning;

  useEffect(() => saveState(state), [state]);

  const spin = () => {
    if (!canSpin) {
      return;
    }

    if (state.sound) {
      primeAudio();
    }

    const index = randomIndex(labels.length);

    setWinner(null);
    setLanding(index);
    setRotation((current) => landingRotation(current, index, labels.length));
  };

  const settle = () => {
    setWinner(landing);
    setLanding(null);

    if (state.sound) {
      beep();
    }
  };

  // Filling a wheel that has names replaces them, so it asks first.
  const fill = (example: ExampleId) => {
    const run = () => dispatch({ example, type: "fill" });

    if (labels.length === 0) {
      run();
    } else {
      confirm.press(`fill-${example}`, run);
    }
  };

  return (
    <main className="page">
      <header className="page__header">
        <Link href="/" className="back">
          <Icon name="back" size={18} />
          All games
        </Link>
        <h1 className="display page__title">{name}</h1>
        <p className="page__sub">make a wheel, fill it in, give it a spin</p>
      </header>

      <nav aria-label="Your wheels" className="picker">
        {state.wheels.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="picker__option"
            aria-pressed={entry.id === wheel.id}
            disabled={spinning}
            onClick={() => {
              setWinner(null);
              dispatch({ id: entry.id, type: "select" });
            }}
          >
            {entry.name.trim() || "Untitled"}
          </button>
        ))}
        <button
          type="button"
          className="picker__option picker__add"
          disabled={spinning || state.wheels.length >= MAX_WHEELS}
          onClick={() => dispatch({ id: crypto.randomUUID(), type: "create" })}
        >
          + New wheel
        </button>
      </nav>

      <div className="layout">
        <section aria-label="Wheel" className="panel panel--wheel">
          <span className="legend">{legendFor(wheel.name)}</span>
          <WheelView
            labels={labels}
            emptySlots={slots.length}
            rotation={rotation}
            onSettle={settle}
          />
          <button
            type="button"
            className="btn btn--primary btn--spin"
            onClick={spin}
            disabled={!canSpin}
          >
            <Icon name="spin" />
            {spinning ? "spinning…" : "spin the wheel"}
          </button>
          <p className="hint" aria-live="polite">
            {tooFew ? "Name at least two slices to spin." : ""}
          </p>
        </section>

        <section aria-labelledby="slices-title" className="panel panel--slices">
          <span className="legend">slices</span>

          <div className="stack">
            <label className="field-label" htmlFor="wheel-name">
              Wheel name
            </label>
            <input
              id="wheel-name"
              className="field"
              value={wheel.name}
              maxLength={MAX_NAME}
              disabled={spinning}
              onChange={(event) =>
                dispatch({ name: event.target.value, type: "renameWheel" })
              }
            />
          </div>

          <div className="stack">
            <h2 className="field-label">Fill with an example</h2>
            <div className="examples">
              {EXAMPLE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="btn btn--small"
                  disabled={spinning}
                  onClick={() => fill(id)}
                >
                  {confirm.armed === `fill-${id}`
                    ? "Sure? Replace"
                    : EXAMPLES[id].name}
                </button>
              ))}
            </div>
          </div>

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
                  style={{
                    background: colors[positions[i] ?? -1] ?? "transparent",
                  }}
                />
                <span aria-hidden="true" className="slice__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <input
                  aria-label={`Slice ${i + 1}`}
                  className="field slice__input"
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
                  <Icon name="close" size={16} weight={3} />
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
            <div className="slices__actions">
              <button
                type="button"
                className="btn btn--quiet btn--small"
                onClick={() =>
                  confirm.press("reset", () => dispatch({ type: "reset" }))
                }
                disabled={spinning}
              >
                {confirm.armed === "reset" ? "Sure? Reset" : "Reset"}
              </button>
              {state.wheels.length > 1 ? (
                <button
                  type="button"
                  className="btn btn--quiet btn--small"
                  onClick={() =>
                    confirm.press("delete", () =>
                      dispatch({ type: "deleteWheel" })
                    )
                  }
                  disabled={spinning}
                >
                  {confirm.armed === "delete" ? "Sure? Delete" : "Delete wheel"}
                </button>
              ) : null}
            </div>
          </div>
          <p className="hint">Saved in this browser only.</p>
        </section>
      </div>

      <ResultDialog
        winner={winner === null ? null : (labels[winner] ?? null)}
        canRemove={labels.length > MIN_SLOTS}
        onClose={() => setWinner(null)}
        onSpinAgain={spin}
        onRemove={() => {
          dispatch({ index: positions.indexOf(winner ?? -1), type: "remove" });
          setWinner(null);
        }}
      />
    </main>
  );
};

export default WheelOfFortune;
