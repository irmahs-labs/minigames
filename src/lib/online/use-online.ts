import { useEffect, useRef, useState } from "react";
import type * as z from "zod/mini";

import { parseMessage } from "../parse-message";
import { IDLE, receive } from "./state";
import type { Online, ServerMessage } from "./state";

/** A move as a game's socket sends it: squares and boards are numbers */
type MoveMessage = Record<string, number>;

/** Waits this long, doubling up to RETRY_MAX_MS, before reconnecting. */
const RETRY_MS = 1000;
const RETRY_MAX_MS = 30_000;

export type Connection = "connecting" | "open" | "closed";

const socketUrl = (path: string) => {
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";

  return `${scheme}://${window.location.host}${path}`;
};

/**
 * The socket to the server while the Online tab is open, reconnecting with
 * a growing wait when it drops. The server says where this player stands on
 * every connect, so a reload or a lost signal picks the game up again; a
 * player who was looking for a game is put back in the queue.
 */
export const useOnline = <M, P extends string, E extends string>(
  /** The game's socket: /ws, /ws/ouk-chaktrang */
  path: string,
  schema: z.ZodMiniType<ServerMessage<M, P, E>>,
  /** A move as the socket sends it */
  moveMessage: (move: M) => MoveMessage
) => {
  const [state, setState] = useState<Online<M, P, E>>(IDLE);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<WebSocket | null>(null);
  // Set by Play online, cleared by Cancel and by a game starting.
  const looking = useRef(false);

  const send = (message: { readonly type: string }) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    let stopped = false;
    let attempts = 0;
    let retry = 0;

    const open = () => {
      const current = new WebSocket(socketUrl(path));

      socket.current = current;
      setConnection("connecting");

      current.addEventListener("open", () => {
        attempts = 0;
        setConnection("open");
      });

      current.addEventListener("message", (event) => {
        const message = parseMessage(schema, String(event.data));

        if (!message) {
          return;
        }

        if (message.type === "error") {
          setError(message.message);

          return;
        }

        setError(null);

        if (message.type === "idle" && looking.current) {
          // Back after a drop that cost this player their place: ask again.
          current.send(JSON.stringify({ type: "join" }));
        } else if (message.type !== "queued") {
          looking.current = false;
        }

        setState((before) => receive(before, message, Date.now()));
      });

      current.addEventListener("close", () => {
        socket.current = null;

        if (stopped) {
          return;
        }

        setConnection("closed");
        attempts += 1;
        retry = window.setTimeout(
          open,
          Math.min(RETRY_MAX_MS, RETRY_MS * 2 ** attempts)
        );
      });
    };

    open();

    return () => {
      stopped = true;
      window.clearTimeout(retry);
      socket.current?.close();
    };
  }, [path, schema]);

  return {
    connection,
    error,
    /** Look for a game: the first two people looking play each other. */
    join: () => {
      looking.current = true;
      send({ type: "join" });
    },
    leave: () => {
      looking.current = false;
      send({ type: "leave" });
    },
    move: (move: M) => send({ ...moveMessage(move), type: "move" }),
    state,
  };
};
