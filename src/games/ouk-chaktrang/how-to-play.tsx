import { useCopy } from "../../lib/language";

const COPY = {
  en: {
    moves: [
      "Khun (king): one square any way. Once, as its first move and before it has ever been checked, it may leap like a Seh onto the next rank, never to capture.",
      "Neang (lady): one square diagonally. Her first move may be two squares straight ahead.",
      "Koul (general): one square diagonally, or one straight ahead.",
      "Seh (horse): like a knight. Tuk (boat): like a rook.",
      "Trey (fish): one square ahead, taking one square diagonally ahead. On the sixth rank it is flipped and moves as a Neang.",
    ],
    movesTitle: "How the pieces move",
    rules: [
      "Tevada (or Cream) moves first. Checkmate the other Khun to win; stalemate is a draw.",
      "Once no unflipped Trey is left, the weaker side counts its moves: reach the limit and the game is drawn.",
      "Tap a piece to see where it can go, tap a square, then tap it again to play there. Or drag the piece.",
      "A square turns red when the piece you are moving could be taken there.",
    ],
    title: "How to play",
  },
  fr: {
    moves: [
      "Khun (roi) : une case dans tous les sens. Une fois, pour son premier coup et s’il n’a jamais été mis en échec, il peut sauter comme un Seh sur la rangée suivante, sans prendre.",
      "Neang (dame) : une case en diagonale. Son premier coup peut être de deux cases tout droit.",
      "Koul (général) : une case en diagonale, ou une tout droit devant.",
      "Seh (cheval) : comme un cavalier. Tuk (bateau) : comme une tour.",
      "Trey (poisson) : une case devant, et prend une case en diagonale devant. Sur la sixième rangée, il est retourné et va comme une Neang.",
    ],
    movesTitle: "Comment vont les pièces",
    rules: [
      "Les Tevada (ou Crème) commencent. Matez l’autre Khun pour gagner ; le pat est nul.",
      "Quand il ne reste plus de Trey non retourné, le camp le plus faible compte ses coups : arrivé à la limite, la partie est nulle.",
      "Touchez une pièce pour voir où elle peut aller, touchez une case, puis encore une fois pour y jouer. Ou faites glisser la pièce.",
      "Une case devient rouge quand la pièce que vous déplacez pourrait y être prise.",
    ],
    title: "Comment jouer",
  },
};

/** The rules, and how to move a piece, under every game */
export const HowToPlay = () => {
  const t = useCopy(COPY);

  return (
    <details className="stack ouk-how">
      <summary className="field-label">{t.title}</summary>
      <ul className="how-to">
        {t.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <h3 className="field-label">{t.movesTitle}</h3>
      <ul className="how-to">
        {t.moves.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </details>
  );
};
