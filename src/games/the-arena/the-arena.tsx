import { Fragment, useEffect, useReducer, useRef, useState } from "react";

import { ArenaIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { useCopy, useLanguage } from "../../lib/language";
import { cryptoRandom } from "../../lib/random";
import { Link } from "../../lib/router";
import {
  MAX_DISTRICTS,
  MAX_NAME,
  MAX_PER_DISTRICT,
  SAMPLE_NAMES,
  castReducer,
  contestantsOf,
  loadCast,
  notReady,
  saveCast,
} from "./cast";
import type { Cast, CastAction } from "./cast";
import { victimsOf } from "./events";
import { simulate } from "./simulation";
import type { Contestant, Games, Happening, Phase } from "./simulation";

const COPY = {
  en: {
    addDistrict: "+ add a district",
    addPlace: "+ add a contestant",
    allGames: "all games",
    backToCast: "back to the cast",
    contestant: (n: number) => `Contestant ${n}`,
    count: (people: number, districts: number) =>
      `${people} contestant${people === 1 ? "" : "s"} in ${districts} district${districts === 1 ? "" : "s"}`,
    day: (n: number) => `Day ${n}`,
    district: (n: number) => `District ${n}`,
    editCast: "edit the cast",
    fallen: "Fallen",
    fill: "fill the empty places",
    killed: (n: number) => (n === 1 ? "1 kill" : `${n} kills`),
    killsOf: (name: string, n: number) =>
      `${name}: ${n === 1 ? "1 kill" : `${n} kills`}`,
    left: (n: number) => `${n} still standing`,
    night: (n: number) => `Night ${n}`,
    noneFell: "No one fell.",
    notReady: {
      "one-district":
        "District-mates win together: bring in a second district, or turn that off.",
      "too-few": "Name at least two contestants to start.",
    },
    placings: "Placings",
    playAgain: "play again",
    removeDistrict: (n: number) => `Remove district ${n}`,
    removePlace: (name: string) => `Remove ${name}`,
    rules: "Rules",
    skip: "skip to the end",
    start: "start the games",
    sub: "name the contestants, and watch who's still standing at the end",
    together: "District-mates can win together",
    togetherHint:
      "The games end when everyone left is from the same district, and they win together.",
    victor: "The victor",
    victorOf: (district: string) => `Victor, ${district}`,
    victors: "The victors",
    victorsOf: (district: string) => `Victors together, ${district}`,
    yourCast: "The cast",
  },
  fr: {
    addDistrict: "+ ajouter un district",
    addPlace: "+ ajouter un concurrent",
    allGames: "tous les jeux",
    backToCast: "retour aux concurrents",
    contestant: (n: number) => `Concurrent ${n}`,
    count: (people: number, districts: number) =>
      `${people} concurrent${people === 1 ? "" : "s"} dans ${districts} district${districts === 1 ? "" : "s"}`,
    day: (n: number) => `Jour ${n}`,
    district: (n: number) => `District ${n}`,
    editCast: "modifier les concurrents",
    fallen: "Tombés",
    fill: "remplir les places vides",
    killed: (n: number) => (n === 1 ? "1 élimination" : `${n} éliminations`),
    killsOf: (name: string, n: number) =>
      `${name} : ${n === 1 ? "1 élimination" : `${n} éliminations`}`,
    left: (n: number) => `${n} encore debout`,
    night: (n: number) => `Nuit ${n}`,
    noneFell: "Personne n’est tombé.",
    notReady: {
      "one-district":
        "Victoire à plusieurs du même district : ajoutez un second district, ou désactivez-la.",
      "too-few": "Nommez au moins deux concurrents pour commencer.",
    },
    placings: "Classement",
    playAgain: "rejouer",
    removeDistrict: (n: number) => `Retirer le district ${n}`,
    removePlace: (name: string) => `Retirer ${name}`,
    rules: "Règles",
    skip: "aller à la fin",
    start: "lancer les jeux",
    sub: "nommez les concurrents, et voyez qui reste debout à la fin",
    together: "Les membres d’un district peuvent gagner ensemble",
    togetherHint:
      "Les jeux s’arrêtent quand tous les survivants viennent du même district, qui gagnent ensemble.",
    victor: "Victoire",
    victorOf: (district: string) => `Victoire, ${district}`,
    victors: "Victoire à plusieurs",
    victorsOf: (district: string) => `Victoire partagée, ${district}`,
    yourCast: "Les concurrents",
  },
};

/** A line with its places filled by names, in bold. */
const Line = ({ text, names }: { text: string; names: readonly string[] }) => (
  <>
    {text.split(/(?<place>\{\d\})/u).map((part, i) => {
      const place = /^\{(?<place>\d)\}$/u.exec(part)?.groups?.place;

      return place ? (
        <strong key={`${i}-${part}`}>{names[Number(place) - 1] ?? "?"}</strong>
      ) : (
        <Fragment key={`${i}-${part}`}>{part}</Fragment>
      );
    })}
  </>
);

const HappeningLine = ({
  happening,
  byId,
}: {
  happening: Happening;
  byId: ReadonlyMap<string, Contestant>;
}) => {
  const language = useLanguage();
  const deadly = victimsOf(happening.template).length > 0;

  return (
    <li className={deadly ? "arena-event arena-event--deadly" : "arena-event"}>
      <span aria-hidden="true" className="arena-event__mark">
        {deadly ? "💀" : "•"}
      </span>
      <span>
        <Line
          text={happening.template.text[language]}
          names={happening.who.map((id) => byId.get(id)?.name ?? "?")}
        />
      </span>
    </li>
  );
};

/** Setting up: the districts, their contestants, and the rules. */
const Setup = ({
  cast,
  dispatch,
  onStart,
}: {
  cast: Cast;
  dispatch: (action: CastAction) => void;
  onStart: () => void;
}) => {
  const t = useCopy(COPY);
  const contestants = contestantsOf(cast);
  const blocked = notReady(cast);
  const districts = new Set(contestants.map((one) => one.district)).size;

  return (
    <div className="layout">
      <section
        aria-labelledby="arena-cast"
        className="panel panel--wide arena-panel"
      >
        <span className="legend">districts.csv</span>
        <h2 id="arena-cast" className="field-label">
          {t.yourCast}
        </h2>
        <ol className="arena-districts">
          {cast.districts.map((district, d) => (
            // A district is known by its number, its place in the list.
            // oxlint-disable-next-line no-array-index-key
            <li key={d} className="arena-district">
              <div className="arena-district__head">
                <h3 className="display arena-district__name">
                  {t.district(d + 1)}
                </h3>
                {cast.districts.length > 1 ? (
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={t.removeDistrict(d + 1)}
                    onClick={() =>
                      dispatch({ district: d, type: "removeDistrict" })
                    }
                  >
                    <Icon name="close" size={16} />
                  </button>
                ) : null}
              </div>
              {district.names.map((name, p) => (
                // Places are positional, and two can hold the same name.
                // oxlint-disable-next-line no-array-index-key
                <div key={p} className="arena-place">
                  <input
                    className="field"
                    aria-label={`${t.district(d + 1)}, ${t.contestant(p + 1)}`}
                    placeholder={t.contestant(p + 1)}
                    value={name}
                    maxLength={MAX_NAME}
                    onChange={(event) =>
                      dispatch({
                        district: d,
                        name: event.target.value,
                        place: p,
                        type: "rename",
                      })
                    }
                  />
                  {district.names.length > 1 ? (
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={t.removePlace(name || t.contestant(p + 1))}
                      onClick={() =>
                        dispatch({ district: d, place: p, type: "removePlace" })
                      }
                    >
                      <Icon name="close" size={16} />
                    </button>
                  ) : null}
                </div>
              ))}
              {district.names.length < MAX_PER_DISTRICT ? (
                <button
                  type="button"
                  className="btn btn--quiet arena-district__add"
                  onClick={() => dispatch({ district: d, type: "addPlace" })}
                >
                  {t.addPlace}
                </button>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="arena-actions">
          {cast.districts.length < MAX_DISTRICTS ? (
            <button
              type="button"
              className="btn"
              onClick={() => dispatch({ type: "addDistrict" })}
            >
              {t.addDistrict}
              <span className="arena-muted">
                {cast.districts.length}/{MAX_DISTRICTS}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => dispatch({ names: SAMPLE_NAMES, type: "fill" })}
          >
            {t.fill}
          </button>
        </div>
      </section>

      <section
        aria-labelledby="arena-rules"
        className="panel panel--narrow arena-panel"
      >
        <span className="legend">rules.cfg</span>
        <h2 id="arena-rules" className="field-label">
          {t.rules}
        </h2>
        <button
          type="button"
          role="switch"
          aria-checked={cast.together}
          className="switch arena-switch"
          onClick={() =>
            dispatch({ together: !cast.together, type: "together" })
          }
        >
          <span>{t.together}</span>
          <span aria-hidden="true" className="switch__track">
            <span className="switch__thumb" />
          </span>
        </button>
        <p className="hint">{t.togetherHint}</p>
        <p className="arena-count">{t.count(contestants.length, districts)}</p>
        <button
          type="button"
          className="btn btn--primary"
          disabled={blocked !== null}
          onClick={onStart}
        >
          {t.start}
          <Icon name="arrow" size={18} />
        </button>
        <p className="hint" aria-live="polite">
          {blocked ? t.notReady[blocked] : ""}
        </p>
      </section>
    </div>
  );
};

/** Each district's contestants, struck through once fallen. */
const Roster = ({
  contestants,
  fallen,
  kills,
}: {
  contestants: readonly Contestant[];
  fallen: ReadonlySet<string>;
  kills: Readonly<Record<string, number>>;
}) => {
  const t = useCopy(COPY);
  const districts = [...new Set(contestants.map((one) => one.district))];

  return (
    <section
      aria-labelledby="arena-roster"
      className="panel panel--narrow arena-panel"
    >
      <span className="legend">roster.csv</span>
      <h2 id="arena-roster" className="field-label">
        {t.yourCast}
      </h2>
      <ul className="arena-roster">
        {districts.map((district) => (
          <li key={district}>
            <span className="arena-roster__district">
              {t.district(district)}
            </span>
            <ul>
              {contestants
                .filter((one) => one.district === district)
                .map((one) => (
                  <li
                    key={one.id}
                    className={
                      fallen.has(one.id)
                        ? "arena-roster__one arena-roster__one--fallen"
                        : "arena-roster__one"
                    }
                  >
                    <span>
                      {fallen.has(one.id) ? (
                        <span aria-hidden="true">💀 </span>
                      ) : null}
                      <span className="arena-roster__name">{one.name}</span>
                      {fallen.has(one.id) ? (
                        <span className="sr-only">, {t.fallen}</span>
                      ) : null}
                    </span>
                    {kills[one.id] ? (
                      <span className="arena-muted">
                        {t.killed(kills[one.id] ?? 0)}
                      </span>
                    ) : null}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
};

const phaseTitle = (
  t: (typeof COPY)["en"],
  { kind, number }: Pick<Phase, "kind" | "number">
) => (kind === "day" ? t.day(number) : t.night(number));

/** Kills counted up to and including the phase on show. */
const killsUpTo = (games: Games, shown: number) => {
  const kills: Record<string, number> = {};

  for (const phase of games.phases.slice(0, shown + 1)) {
    for (const { template, who } of phase.happenings) {
      for (const [killer] of template.kills) {
        const id = who[killer];

        if (id) {
          kills[id] = (kills[id] ?? 0) + 1;
        }
      }
    }
  }

  return kills;
};

/** The arena: name the cast, then follow the games day by day to the victor. */
const TheArena = ({ name }: GameProps) => {
  const t = useCopy(COPY);
  const [cast, dispatch] = useReducer(castReducer, undefined, loadCast);
  const [games, setGames] = useState<Games | null>(null);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [shown, setShown] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => saveCast(cast), [cast]);

  // Each new phase, and the end, take the focus, so a screen reader reads on.
  const focusOn = games ? shown : -1;

  useEffect(() => {
    if (focusOn >= 0) {
      heading.current?.focus();
    }
  }, [focusOn]);

  const start = () => {
    const cast_ = contestantsOf(cast);

    setContestants(cast_);
    setGames(simulate(cast_, { together: cast.together }, cryptoRandom));
    setShown(0);
  };

  const byId = new Map(contestants.map((one) => [one.id, one]));
  const finished = games !== null && shown >= games.phases.length;
  const phase = games?.phases[shown];
  const next = games?.phases[shown + 1];

  const fallenList = games
    ? games.phases
        .slice(0, finished ? undefined : shown + 1)
        .flatMap((one) => one.fallen)
    : [];

  const fallenSoFar = new Set(fallenList);

  const standing = contestants.length - fallenSoFar.size;

  let body = null;

  if (!games) {
    body = <Setup cast={cast} dispatch={dispatch} onStart={start} />;
  } else if (finished || !phase) {
    const victors = games.victors
      .map((id) => byId.get(id))
      .filter((one): one is Contestant => one !== undefined);

    const district = t.district(victors[0]?.district ?? 0);
    // The last to fall placed highest, after the victors.
    const placings = games.fallen.toReversed();

    body = (
      <div className="layout">
        <section
          aria-labelledby="arena-end"
          className="panel panel--wide arena-panel arena-end"
        >
          <span className="legend">victor.log</span>
          <p className="kicker">
            {victors.length > 1 ? t.victorsOf(district) : t.victorOf(district)}
          </p>
          <h2
            ref={heading}
            tabIndex={-1}
            id="arena-end"
            className="display arena-end__name"
          >
            <span aria-hidden="true">👑 </span>
            {victors.map((one) => one.name).join(" & ")}
          </h2>
          <p className="arena-muted">
            {victors
              .map((one) => t.killsOf(one.name, games.kills[one.id] ?? 0))
              .join(" · ")}
          </p>
          <h3 className="field-label">{t.placings}</h3>
          <ol className="arena-placings" start={victors.length + 1}>
            {placings.map((id) => {
              const one = byId.get(id);

              return one ? (
                <li key={id}>
                  <strong>{one.name}</strong>{" "}
                  <span className="arena-muted">
                    {t.district(one.district)} ·{" "}
                    {t.killed(games.kills[id] ?? 0)}
                  </span>
                </li>
              ) : null;
            })}
          </ol>
          <div className="arena-actions">
            <button type="button" className="btn btn--primary" onClick={start}>
              <Icon name="spin" size={18} />
              {t.playAgain}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setGames(null)}
            >
              {t.editCast}
            </button>
          </div>
        </section>
        <Roster
          contestants={contestants}
          fallen={new Set(games.fallen)}
          kills={games.kills}
        />
      </div>
    );
  } else {
    let nextLabel = games.victors.length > 1 ? t.victors : t.victor;

    if (next) {
      nextLabel = phaseTitle(t, next);
    }

    body = (
      <div className="layout">
        <section
          aria-labelledby="arena-phase"
          className="panel panel--wide arena-panel"
        >
          <span className="legend">{`${phase.kind}-${phase.number}.log`}</span>
          <div className="arena-phase__head">
            <h2
              ref={heading}
              tabIndex={-1}
              id="arena-phase"
              className="display arena-phase__title"
            >
              <span aria-hidden="true">
                {phase.kind === "day" ? "☀️ " : "🌙 "}
              </span>
              {phaseTitle(t, phase)}
            </h2>
            <p className="arena-muted">{t.left(standing)}</p>
          </div>
          <ul className="arena-events">
            {phase.happenings.map((happening, i) => (
              <HappeningLine
                // A phase's happenings never change order.
                // oxlint-disable-next-line no-array-index-key
                key={i}
                happening={happening}
                byId={byId}
              />
            ))}
          </ul>
          <p className="arena-fallen">
            <strong>{t.fallen}: </strong>
            {phase.fallen.length > 0
              ? phase.fallen.map((id) => byId.get(id)?.name ?? "?").join(", ")
              : t.noneFell}
          </p>
          <div className="arena-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setShown(shown + 1)}
            >
              {nextLabel}
              <Icon name="arrow" size={18} />
            </button>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => setShown(games.phases.length)}
            >
              {t.skip}
            </button>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => setGames(null)}
            >
              {t.backToCast}
            </button>
          </div>
        </section>
        <Roster
          contestants={contestants}
          fallen={fallenSoFar}
          kills={killsUpTo(games, shown)}
        />
      </div>
    );
  }

  return (
    <>
      <Header icon={<ArenaIcon />} name={name} href="/the-arena">
        <Link href="/" className="btn">
          <Icon name="back" size={16} />
          {t.allGames}
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub">{t.sub}</p>
        {body}
      </main>
    </>
  );
};

export default TheArena;
