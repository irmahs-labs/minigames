import { useEffect, useReducer, useState } from "react";

import { WheelIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { useCopy } from "../../lib/language";
import { Link } from "../../lib/router";
import { useConfirm } from "../../lib/use-confirm";
import { beep, primeAudio } from "./beep";
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

const COPY = {
  en: {
    add: "Add a slice",
    allGames: "all games",
    beep: "Beep when it lands",
    clear: "Clear",
    delete: "Delete wheel",
    named: (n: number) => `of ${n} named`,
    newWheel: "+ New wheel",
    onTheWheel: "On the wheel",
    placeholder: "Type a name",
    removeSlice: (n: number) => `Remove slice ${n}`,
    reset: "Reset",
    saved: "Saved in this browser only.",
    slice: (n: number) => `Slice ${n}`,
    spin: "spin the wheel",
    spinning: "spinning…",
    sub: "fill in a wheel, give it a spin",
    sureClear: "Sure? Clear",
    sureDelete: "Sure? Delete",
    sureReset: "Sure? Reset",
    tooFew: "Name at least two slices to spin.",
    untitled: "Untitled",
    wheel: "Wheel",
    wheelName: "Wheel name",
    yourWheels: "Your wheels",
  },
  fr: {
    add: "Ajouter une part",
    allGames: "tous les jeux",
    beep: "Bip à l’arrêt",
    clear: "Vider",
    delete: "Supprimer la roue",
    named: (n: number) => `sur ${n} remplies`,
    newWheel: "+ Nouvelle roue",
    onTheWheel: "Sur la roue",
    placeholder: "Tapez un nom",
    removeSlice: (n: number) => `Retirer la part ${n}`,
    reset: "Réinitialiser",
    saved: "Enregistré dans ce navigateur uniquement.",
    slice: (n: number) => `Part ${n}`,
    spin: "faire tourner la roue",
    spinning: "ça tourne…",
    sub: "remplissez une roue, faites-la tourner",
    sureClear: "Sûr ? Vider",
    sureDelete: "Sûr ? Supprimer",
    sureReset: "Sûr ? Réinitialiser",
    tooFew: "Nommez au moins deux parts pour lancer.",
    untitled: "Sans titre",
    wheel: "Roue",
    wheelName: "Nom de la roue",
    yourWheels: "Vos roues",
  },
};

/** A wheel's name as a filename for its panel's pill: "Team lunch" → team-lunch.gif. */
const legendFor = (name: string) => {
  const slug = name
    // "Prénoms" → "prenoms", not "pr-noms"
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");

  return `${slug || "untitled"}.gif`;
};

const WheelOfFortune = ({ name }: GameProps) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [rotation, setRotation] = useState(0);
  // The slice a spin is heading for while the wheel turns, then the one it won.
  const [landing, setLanding] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const confirm = useConfirm();
  const t = useCopy(COPY);

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

  return (
    <>
      <Header icon={<WheelIcon />} name={name} href="/wheel-of-fortune">
        <Link href="/" className="btn">
          <Icon name="back" size={16} />
          {t.allGames}
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub">{t.sub}</p>

        <nav aria-label={t.yourWheels} className="picker">
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
              {entry.name.trim() || t.untitled}
            </button>
          ))}
          <button
            type="button"
            className="picker__option picker__add"
            disabled={spinning || state.wheels.length >= MAX_WHEELS}
            onClick={() =>
              dispatch({ id: crypto.randomUUID(), type: "create" })
            }
          >
            {t.newWheel}
          </button>
        </nav>

        <div className="layout">
          <section aria-label={t.wheel} className="panel panel--wheel">
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
              {spinning ? t.spinning : t.spin}
            </button>
            <p className="hint" aria-live="polite">
              {tooFew ? t.tooFew : ""}
            </p>
          </section>

          <section
            aria-labelledby="slices-title"
            className="panel panel--slices"
          >
            <span className="legend">slices.txt</span>

            <div className="stack">
              <label className="field-label" htmlFor="wheel-name">
                {t.wheelName}
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

            <div className="slices__head">
              <div className="stack">
                <h2 id="slices-title" className="field-label">
                  {t.onTheWheel}
                </h2>
                <span className="slices__count">
                  {labels.length} <span>{t.named(slots.length)}</span>
                </span>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => dispatch({ type: "add" })}
                disabled={spinning || slots.length >= MAX_SLOTS}
              >
                {t.add}
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
                    aria-label={t.slice(i + 1)}
                    className="field slice__input"
                    value={slot}
                    maxLength={MAX_LABEL}
                    placeholder={t.placeholder}
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
                    aria-label={t.removeSlice(i + 1)}
                    disabled={
                      spinning || (slots.length <= MIN_SLOTS && slot === "")
                    }
                    onClick={() => dispatch({ index: i, type: "remove" })}
                  >
                    <Icon name="close" size={16} />
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
                <span>{t.beep}</span>
                <span aria-hidden="true" className="switch__track">
                  <span className="switch__thumb" />
                </span>
              </button>
              <div className="slices__actions">
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() =>
                    confirm.press("clear", () => dispatch({ type: "clear" }))
                  }
                  disabled={spinning || labels.length === 0}
                >
                  {confirm.armed === "clear" ? t.sureClear : t.clear}
                </button>
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() =>
                    confirm.press("reset", () => dispatch({ type: "reset" }))
                  }
                  disabled={spinning}
                >
                  {confirm.armed === "reset" ? t.sureReset : t.reset}
                </button>
                {state.wheels.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() =>
                      confirm.press("delete", () =>
                        dispatch({ type: "deleteWheel" })
                      )
                    }
                    disabled={spinning}
                  >
                    {confirm.armed === "delete" ? t.sureDelete : t.delete}
                  </button>
                ) : null}
              </div>
            </div>
            <p className="hint">{t.saved}</p>
          </section>
        </div>

        <ResultDialog
          winner={winner === null ? null : (labels[winner] ?? null)}
          canRemove={labels.length > MIN_SLOTS}
          onClose={() => setWinner(null)}
          onSpinAgain={spin}
          onRemove={() => {
            dispatch({
              index: positions.indexOf(winner ?? -1),
              type: "remove",
            });
            setWinner(null);
          }}
        />
      </main>
    </>
  );
};

export default WheelOfFortune;
