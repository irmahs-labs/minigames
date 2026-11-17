import { useCallback, useEffect, useState } from "react";
import * as z from "zod/mini";

import { currentAccount } from "../../lib/account";
import type { Account } from "../../lib/account";
import { useCopy } from "../../lib/language";
import { readStored, writeStored } from "../../lib/storage";
import { Leaderboard } from "./leaderboard";
import { LocalGame } from "./local-game";
import { OnlineGame } from "./online-game";

const MODE_KEY = "minigames:super-tic-tac-toe:mode:v1";

const COPY = {
  en: {
    how: "How to play",
    modes: { local: "Same screen", online: "Online" },
    sub: "conquer three planets in a row",
  },
  fr: {
    how: "Comment jouer",
    modes: { local: "Même écran", online: "En ligne" },
    sub: "conquérez trois planètes alignées",
  },
};

const modeSchema = z.enum(["local", "online"]);

type Mode = z.infer<typeof modeSchema>;

const SuperTicTacToe = () => {
  // The tab last picked, so a reload mid-game comes back to it.
  const [mode, setMode] = useState<Mode>(() =>
    readStored(MODE_KEY, modeSchema, () => "local")
  );

  // undefined until the server answers, or when it cannot be reached.
  const [account, setAccount] = useState<Account | null | undefined>();
  // Counts finished online games; the leaderboard reloads on each.
  const [finished, setFinished] = useState(0);

  useEffect(() => writeStored(MODE_KEY, mode), [mode]);

  useEffect(() => {
    let current = true;

    const load = async () => {
      const who = await currentAccount();

      if (current) {
        setAccount(who);
      }
    };

    void load();

    return () => {
      current = false;
    };
  }, []);

  const onFinished = useCallback(() => setFinished((n) => n + 1), []);
  const t = useCopy(COPY);

  return (
    <main className="page">
      <p className="page__sub">{t.sub}</p>

      <nav aria-label={t.how} className="picker">
        {modeSchema.options.map((option) => (
          <button
            key={option}
            type="button"
            className="picker__option"
            aria-pressed={option === mode}
            onClick={() => setMode(option)}
          >
            {t.modes[option]}
          </button>
        ))}
      </nav>

      {mode === "local" ? (
        <LocalGame />
      ) : (
        <OnlineGame account={account} onFinished={onFinished} />
      )}

      <Leaderboard key={finished} />
    </main>
  );
};

export default SuperTicTacToe;
