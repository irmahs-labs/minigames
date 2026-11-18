import { useOnline as useGameSocket } from "../../../lib/online/use-online";
import { serverMessage } from "./protocol";

export type { Connection } from "../../../lib/online/use-online";

/** Super Tic-Tac-Toe's socket, /ws (src/lib/online/use-online.ts) */
export const useOnline = () =>
  useGameSocket("/ws", serverMessage, (move) => ({ ...move }));
