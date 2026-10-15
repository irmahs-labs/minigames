import { useEffect, useRef } from "react";

interface ResultDialogProps {
  /** The winning slice; the dialog is open while it is set. */
  winner: string | null;
  kicker: string;
  canRemove: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemove: () => void;
}

/** The popup that names the slice the wheel landed on. */
export const ResultDialog = ({
  winner,
  kicker,
  canRemove,
  onClose,
  onSpinAgain,
  onRemove,
}: ResultDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    if (winner !== null && !dialog.open) {
      dialog.showModal();
    } else if (winner === null && dialog.open) {
      dialog.close();
    }
  }, [winner]);

  return (
    <dialog
      ref={ref}
      className="result panel"
      aria-labelledby="result-title"
      onClose={onClose}
    >
      <span className="legend">result.log</span>
      <p className="kicker">{kicker}</p>
      <h2 id="result-title" className="result__winner display">
        {winner}
      </h2>
      <div className="result__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onSpinAgain}
        >
          Spin again
        </button>
        {canRemove ? (
          <button type="button" className="btn" onClick={onRemove}>
            Remove from wheel
          </button>
        ) : null}
        <button type="button" className="btn btn--quiet" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
};
