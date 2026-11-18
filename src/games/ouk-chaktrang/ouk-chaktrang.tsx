import { useCallback, useEffect, useMemo, useState } from "react";

import { EndDialog } from "../../components/end-dialog";
import { Leaderboard } from "../../components/leaderboard";
import {
  ConnectionHint,
  ONLINE_COPY,
  OnlineGate,
  pointsText,
  queueLog,
  resultHeadline,
  turnNote,
  useNow,
} from "../../components/online-play";
import type { Log } from "../../components/online-play";
import { currentAccount } from "../../lib/account";
import type { Account } from "../../lib/account";
import { useCopy, useLanguage } from "../../lib/language";
import { useOnline } from "../../lib/online/use-online";
import { useConfirm } from "../../lib/use-confirm";
import { Board } from "./board";
import { LEVELS, chooseMove } from "./bot";
import { HowToPlay } from "./how-to-play";
import {
  Captures,
  headlineFor,
  noteFor,
  pointRules,
  useCaptureSound,
} from "./log";
import { sideName } from "./names";
import { serverMessage } from "./online/protocol";
import { THEMES } from "./pieces";
import type { Theme } from "./pieces";
import { newGame, play, replay } from "./rules";
import type { Move, Side } from "./rules";
import { loadMoves, loadSettings, saveMoves, saveSettings } from "./state";
import type { Mode, Settings } from "./state";

/** How long the bot seems to think, so its move doesn't land at once */
const BOT_PAUSE_MS = 450;

const COPY = {
  en: {
    bot: "Bot",
    level: "Bot level",
    levels: { easy: "Easy", hard: "Hard", medium: "Medium" },
    modes: { bot: "Against the bot", local: "Same screen", online: "Online" },
    newGame: "New game",
    over: "Game over",
    play: "Play",
    playAs: "You play",
    saved:
      "Saved in this browser only. Games against the bot don't count on the leaderboard.",
    settings: "Settings",
    sound: "Capture sound",
    sub: "Cambodian chess: checkmate the other Khun",
    sure: "Sure? New game",
    theme: "Pieces",
    themes: { matcha: "Matcha", "yeak-tevada": "Yeak vs Tevada" },
    thinking: "The bot is thinking…",
    upNext: "Up next",
    you: "You",
  },
  fr: {
    bot: "Bot",
    level: "Niveau du bot",
    levels: { easy: "Facile", hard: "Difficile", medium: "Moyen" },
    modes: { bot: "Contre le bot", local: "Même écran", online: "En ligne" },
    newGame: "Nouvelle partie",
    over: "Partie terminée",
    play: "Mode",
    playAs: "Vous jouez",
    saved:
      "Enregistré dans ce navigateur uniquement. Les parties contre le bot ne comptent pas au classement.",
    settings: "Réglages",
    sound: "Son des prises",
    sub: "Les échecs cambodgiens : mettez l’autre Khun en échec et mat",
    sure: "Sûr ? Nouvelle partie",
    theme: "Pièces",
    themes: { matcha: "Matcha", "yeak-tevada": "Yeak contre Tevada" },
    thinking: "Le bot réfléchit…",
    upNext: "À suivre",
    you: "Vous",
  },
};

/** A row of buttons, one pressed: the modes, the themes, the levels */
const Picker = <T extends string>({
  label,
  options,
  value,
  names,
  onPick,
}: {
  label: string;
  options: readonly T[];
  value: T;
  names: Record<T, string>;
  onPick: (option: T) => void;
}) => (
  <fieldset className="picker">
    <legend className="sr-only">{label}</legend>
    {options.map((option) => (
      <button
        key={option}
        type="button"
        className="picker__option"
        aria-pressed={option === value}
        onClick={() => onPick(option)}
      >
        {names[option]}
      </button>
    ))}
  </fieldset>
);

/** The side the bot plays against the visitor's */
const OTHER: Record<Side, Side> = { black: "white", white: "black" };

interface OfflineProps {
  mode: "bot" | "local";
  settings: Settings;
  onSettings: (change: Partial<Settings>) => void;
}

/** A game on this screen: against the bot, or two people taking turns */
const OfflineGame = ({ mode, settings, onSettings }: OfflineProps) => {
  const [moves, setMoves] = useState<Move[]>(() => loadMoves(mode));
  const [ending, setEnding] = useState(false);
  const confirm = useConfirm();
  const language = useLanguage();
  const t = useCopy(COPY);
  const { level, side, sound, theme } = settings;

  // The saved moves were checked on load, so they always replay
  const game = useMemo(() => replay(moves) ?? newGame(), [moves]);

  const botSide: Side | null = mode === "bot" ? OTHER[side] : null;

  const botsTurn = botSide === game.turn && !game.over;

  useCaptureSound(game, sound);
  useEffect(() => saveMoves(mode, moves), [mode, moves]);

  const move = useCallback(
    (next: Move) => {
      const after = play(game, next);

      if (after === game) {
        return;
      }

      setMoves((before) => [...before, next]);
      setEnding(after.over);
    },
    [game]
  );

  // The bot answers after a short pause
  useEffect(() => {
    if (!botsTurn) {
      return;
    }

    const timer = window.setTimeout(() => {
      const reply = chooseMove(game, level);

      if (reply) {
        move(reply);
      }
    }, BOT_PAUSE_MS);

    return () => window.clearTimeout(timer);
  }, [botsTurn, game, level, move]);

  const restart = () => {
    setMoves([]);
    setEnding(false);
  };

  const headline = headlineFor(game, theme, language);

  const sides: Record<Side, string> = {
    black: sideName("black", theme, language),
    white: sideName("white", theme, language),
  };

  return (
    <>
      <div className="layout">
        <section aria-label={t.modes[mode]} className="panel panel--ouk">
          <span className="legend">chaktrang.brd</span>
          <Board
            game={game}
            theme={theme}
            movable={botSide ? [side] : ["white", "black"]}
            flipped={mode === "bot" && side === "black"}
            locked={botsTurn}
            onMove={move}
          />
        </section>

        <section aria-labelledby="ouk-turn" className="panel panel--log">
          <span className="legend">match.log</span>

          <div className="stack">
            <p className="kicker">{game.over ? t.over : t.upNext}</p>
            <h2 id="ouk-turn" className="display turn">
              {headline}
            </h2>
          </div>
          <p className="turn__note" aria-live="polite">
            {botsTurn ? t.thinking : noteFor(game, theme, language)}
          </p>

          {mode === "bot" ? (
            <div className="stack">
              <Picker
                label={t.level}
                options={LEVELS}
                value={level}
                names={t.levels}
                onPick={(next) => onSettings({ level: next })}
              />
              <Picker
                label={t.playAs}
                options={["white", "black"] as const}
                value={side}
                names={sides}
                onPick={(next) => {
                  onSettings({ side: next });
                  restart();
                }}
              />
            </div>
          ) : null}

          <Captures moves={moves} theme={theme} />

          <div>
            <button
              type="button"
              className={game.over ? "btn btn--primary" : "btn"}
              disabled={moves.length === 0}
              onClick={() =>
                game.over ? restart() : confirm.press("new", restart)
              }
            >
              {confirm.armed === "new" ? t.sure : t.newGame}
            </button>
          </div>

          <HowToPlay />
          <p className="hint">{t.saved}</p>
        </section>
      </div>

      <EndDialog
        open={ending}
        headline={game.winner ? `${headline} 🎉🎉` : headline}
        note={noteFor(game, theme, language)}
        onNewGame={restart}
        onClose={() => setEnding(false)}
      />
    </>
  );
};

/** Ouk Chaktrang's socket: a move goes as its two squares */
const moveMessage = (move: Move) => ({ from: move.from, to: move.to });

/** Against someone else online: queue, game, result, all on the server */
const OnlinePlay = ({
  settings,
  onFinished,
}: {
  settings: Settings;
  onFinished: () => void;
}) => {
  const { connection, error, join, leave, move, state } = useOnline(
    "/ws/ouk-chaktrang",
    serverMessage,
    moveMessage
  );

  const [dismissed, setDismissed] = useState<typeof state | null>(null);
  const now = useNow(state.phase === "queued" || state.phase === "playing");
  const language = useLanguage();
  const t = ONLINE_COPY[language];
  const { sound, theme } = settings;

  const seat =
    state.phase === "playing" || state.phase === "over" ? state.seat : null;

  const game = useMemo(() => (seat && replay(seat.moves)) || newGame(), [seat]);

  const myTurn = state.phase === "playing" && game.turn === state.seat.you;
  const ready = connection === "open";

  useCaptureSound(game, sound);

  useEffect(() => {
    if (state.phase === "over") {
      onFinished();
    }
  }, [state, onFinished]);

  const playButton = (label: string) => (
    <button
      type="button"
      className="btn btn--primary"
      disabled={!ready}
      onClick={join}
    >
      {label}
    </button>
  );

  const resultNote = (over: Extract<typeof state, { phase: "over" }>) => {
    let reason = noteFor(game, theme, language);

    if (over.ending === "timeout") {
      reason =
        over.winner === over.seat.you
          ? t.theirTime(over.seat.opponent)
          : t.yourTime;
    }

    return `${reason} ${t.onLeaderboard(pointsText(over.points, t))}`;
  };

  const gameLog = (): Log => {
    if (state.phase === "playing") {
      const { opponent, you } = state.seat;
      const hurry = turnNote(myTurn, opponent, state.deadline, now, t);
      const note = noteFor(game, theme, language);

      return {
        headline: myTurn ? t.yourTurn : t.theirTurn(opponent),
        kicker: t.youAre(sideName(you, theme, language)),
        note: [note, hurry].filter(Boolean).join(" "),
      };
    }

    if (state.phase === "over") {
      return {
        action: playButton(t.playAgain),
        headline: resultHeadline(state.winner, state.seat.you, t),
        kicker: t.gameOver,
        note: resultNote(state),
      };
    }

    return { headline: "", kicker: "", note: "" };
  };

  const log = queueLog(state, now, t, playButton, leave) ?? gameLog();

  return (
    <>
      <div className="layout">
        <section aria-label={t.online} className="panel panel--ouk">
          <span className="legend">chaktrang.brd</span>
          <Board
            game={game}
            theme={theme}
            movable={seat ? [seat.you] : []}
            flipped={seat?.you === "black"}
            locked={!(myTurn && ready)}
            onMove={move}
          />
        </section>

        <section aria-labelledby="ouk-online" className="panel panel--log">
          <span className="legend">match.log</span>

          <div className="stack">
            <p className="kicker">{log.kicker}</p>
            <h2 id="ouk-online" className="display turn">
              {log.headline}
            </h2>
          </div>
          <p className="turn__note" aria-live="polite">
            {log.note}
          </p>

          {seat ? <Captures moves={seat.moves} theme={theme} /> : null}

          {log.action ? <div>{log.action}</div> : null}

          <ConnectionHint connection={connection} error={error} />

          <HowToPlay />
        </section>
      </div>

      {state.phase === "over" ? (
        <EndDialog
          open={dismissed !== state}
          headline={resultHeadline(state.winner, state.seat.you, t)}
          note={resultNote(state)}
          again={t.playAgain}
          onNewGame={join}
          onClose={() => setDismissed(state)}
        />
      ) : null}
    </>
  );
};

const OukChaktrang = () => {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  // undefined until the server answers, or when it cannot be reached
  const [account, setAccount] = useState<Account | null | undefined>();
  // Counts finished online games; the leaderboard reloads on each
  const [finished, setFinished] = useState(0);
  const t = useCopy(COPY);
  const language = useLanguage();

  useEffect(() => saveSettings(settings), [settings]);

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

  const change = (next: Partial<Settings>) =>
    setSettings((before) => ({ ...before, ...next }));

  const onFinished = useCallback(() => setFinished((n) => n + 1), []);

  return (
    <main className="page">
      <p className="page__sub">{t.sub}</p>

      <div className="ouk-settings">
        <Picker<Mode>
          label={t.play}
          options={["bot", "local", "online"]}
          value={settings.mode}
          names={t.modes}
          onPick={(mode) => change({ mode })}
        />
        <Picker<Theme>
          label={t.theme}
          options={THEMES}
          value={settings.theme}
          names={t.themes}
          onPick={(theme) => change({ theme })}
        />
        <label className="ouk-sound">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(event) => change({ sound: event.target.checked })}
          />
          {t.sound}
        </label>
      </div>

      {settings.mode === "online" ? (
        <OnlineGate account={account}>
          <OnlinePlay settings={settings} onFinished={onFinished} />
        </OnlineGate>
      ) : (
        <OfflineGame
          key={settings.mode}
          mode={settings.mode}
          settings={settings}
          onSettings={change}
        />
      )}

      <Leaderboard
        key={finished}
        url="/api/ouk-chaktrang/leaderboard"
        rules={pointRules(language)}
      />
    </main>
  );
};

export default OukChaktrang;
