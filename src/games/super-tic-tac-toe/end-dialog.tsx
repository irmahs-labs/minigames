import { useEffect, useRef } from "react";

interface EndDialogProps {
  open: boolean;
  headline: string;
  note: string;
  /** The main button's label: "New game" unless given. */
  again?: string;
  onNewGame: () => void;
  onClose: () => void;
}

/** The popup that celebrates the winner, or calls the draw. */
export const EndDialog = ({
  open,
  headline,
  note,
  again = "New game",
  onNewGame,
  onClose,
}: EndDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // The browser centres and layers the bare dialog; the panel look sits inside.
  return (
    <dialog
      ref={ref}
      className="result"
      aria-labelledby="end-title"
      onClose={onClose}
    >
      <div className="panel result__panel">
        <span className="legend">game-over.log</span>
        <h2 id="end-title" className="result__winner display">
          {headline}
        </h2>
        <p className="result__note">{note}</p>
        <div className="result__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onNewGame}
          >
            {again}
          </button>
          <button type="button" className="btn btn--quiet" onClick={onClose}>
            See the board
          </button>
        </div>
      </div>
    </dialog>
  );
};
