import { useEffect, useRef, useState } from "react";

import type { Move } from "../rules";
import { parseMessage, serverMessage } from "./protocol";
import type { ClientMessage } from "./protocol";
import { IDLE, receive } from "./state";
import type { Online } from "./state";

/** Waits this long, doubling up to RETRY_MAX_MS, before reconnecting. */
const RETRY_MS = 1000;
const RETRY_MAX_MS = 30_000;

export type Connection = "connecting" | "open" | "closed";

const socketUrl = () => {
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";

  return `${scheme}://${window.location.host}/ws`;
};

/**
 * The socket to the server while the Online tab is open, reconnecting with
 * a growing wait when it drops. The server says where this player stands on
 * every connect, so a reload or a lost signal picks the game up again; a
 * player who was looking for a game is put back in the queue.
 */
export const useOnline = () => {
  const [state, setState] = useState<Online>(IDLE);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<WebSocket | null>(null);
  // Set by Play online, cleared by Cancel and by a game starting.
  const looking = useRef(false);

  const send = (message: ClientMessage) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    let stopped = false;
    let attempts = 0;
    let retry = 0;

    const open = () => {
      const current = new WebSocket(socketUrl());

      socket.current = current;
      setConnection("connecting");

      current.addEventListener("open", () => {
        attempts = 0;
        setConnection("open");
      });

      current.addEventListener("message", (event) => {
        const message = parseMessage(serverMessage, String(event.data));

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
  }, []);

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
    move: (move: Move) => send({ ...move, type: "move" }),
    state,
  };
};
