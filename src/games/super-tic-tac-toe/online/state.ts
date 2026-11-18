import type {
  Online as OnlineOf,
  Seat as SeatOf,
} from "../../../lib/online/state";
import type { Move, Player } from "../rules";
import type { Ending } from "../scoring";

/** Where this player stands online, in Super Tic-Tac-Toe (src/lib/online/state.ts). */
export type Online = OnlineOf<Move, Player, Ending>;

export type Seat = SeatOf<Move, Player>;

export { IDLE, clock, receive } from "../../../lib/online/state";
