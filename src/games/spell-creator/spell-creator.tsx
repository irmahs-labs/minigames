import { useEffect, useId, useState } from "react";

import { SpellCreatorIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { useCopy } from "../../lib/language";
import { Link } from "../../lib/router";
import { loadPronunciations } from "./dictionary";
import { EXAMPLES } from "./examples";
import type { Pronounce } from "./pronunciations";
import type { RhymeKind } from "./rhyme";
import { LONG_SYLLABLES, MIN_SYLLABLES, TIERS, readSpell } from "./spell";
import type { Couplet, Failure, Reading, Tier } from "./spell";

/**
 * Spell Creator is in English only: its spells rhyme in English. The site's
 * own words around it (the way back to the hub) follow the visitor's
 * language, and in French a note says why the game doesn't.
 */
const COPY = {
  en: { allGames: "all games", englishOnly: "" },
  fr: {
    allGames: "tous les jeux",
    englishOnly:
      "Ce jeu n’existe qu’en anglais : ses sorts riment à l’oreille anglaise.",
  },
};

/** What each tier is called, how much power it has, and what the spell does. */
const POWER: Readonly<
  Record<Tier, { name: string; power: number; effect: string }>
> = {
  A: {
    effect: "Short, sharp and spellbinding: it works on the first try.",
    name: "Mighty spell",
    power: 85,
  },
  B: {
    effect:
      "It works, though the rhymes look as alike as they sound: a little predictable.",
    name: "Strong spell",
    power: 70,
  },
  C: {
    effect:
      "A word rhyming with itself still counts, just about. The spell holds.",
    name: "Steady spell",
    power: 55,
  },
  D: {
    effect: "Something happens, but not quite what you asked for.",
    name: "Wobbly spell",
    power: 35,
  },
  E: {
    effect: "A puff of smoke, and a faint smell of burnt toast.",
    name: "Fizzle",
    power: 15,
  },
  F: {
    effect: "Nothing happens. Without a rhyme, words are just words.",
    name: "Failed spell",
    power: 0,
  },
  S: {
    effect:
      "The cauldron roars and the sky turns violet. This one will be remembered.",
    name: "Legendary spell",
    power: 100,
  },
};

/** What a failed spell says instead, by why it failed. */
const FAILED: Readonly<Record<Failure, string>> = {
  "no-rhyme": POWER.F.effect,
  "one-verse":
    "A spell needs two verses that rhyme: write a second line, or break your line in two with a comma.",
  "too-short": `Too short to hold any magic: every verse needs ${MIN_SYLLABLES} syllables or more.`,
};

/** The rule for each tier, as the list beside the spell shows it. */
const RULES: Readonly<Record<Tier, string>> = {
  A: "Perfect rhymes, even syllables, a rhyme spelled differently, and short.",
  B: "Perfect rhymes and even syllables, but every rhyme spelled alike.",
  C: "Even syllables, but a word rhymes with itself.",
  D: "Even syllables, but a rhyme is a stretch; or good rhymes, uneven syllables.",
  E: "Uneven syllables, and a rhyme that is a stretch.",
  F: `No rhyme, or a verse under ${MIN_SYLLABLES} syllables: the spell fails.`,
  S: `Perfect rhymes that sound the same but are spelled differently, even syllables, and long: ${LONG_SYLLABLES} syllables or more.`,
};

const KIND: Readonly<Record<RhymeKind, string>> = {
  none: "no rhyme",
  perfect: "perfect rhyme",
  "same-word": "the same word",
  stretch: "a stretch",
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** One check on the spell, ticked or not. */
const Check = ({ ok, children }: { ok: boolean; children: string }) => (
  <li className={`spell-check${ok ? "" : " spell-check--miss"}`}>
    <span aria-hidden="true" className="spell-check__mark">
      {ok ? "✓" : "✗"}
    </span>
    <span className="sr-only">{ok ? "Yes: " : "No: "}</span>
    {children}
  </li>
);

/** What the cauldron checked: the rhymes, the syllables, the spelling, the length. */
const Checks = ({ reading }: { reading: Reading }) => {
  const kinds = new Set(reading.couplets.map((couplet) => couplet.rhyme.kind));
  const rhymes = reading.couplets.length > 0 && !kinds.has("none");
  let rhyming = "A couplet doesn’t rhyme";

  if (rhymes && kinds.has("stretch")) {
    rhyming = "Every couplet rhymes, but one is a stretch";
  } else if (rhymes && kinds.has("same-word")) {
    rhyming = "Every couplet rhymes, but a word rhymes with itself";
  } else if (rhymes) {
    rhyming = "Every couplet rhymes perfectly";
  }

  return (
    <ul className="spell-checks">
      <Check ok={rhymes && kinds.size === 1 && kinds.has("perfect")}>
        {rhyming}
      </Check>
      <Check ok={reading.couplets.every((couplet) => couplet.even)}>
        Each couplet’s verses have about as many syllables
      </Check>
      <Check
        ok={reading.verses.every((verse) => verse.syllables >= MIN_SYLLABLES)}
      >
        {`Every verse has ${MIN_SYLLABLES} syllables or more`}
      </Check>
      <Check
        ok={reading.couplets.some(
          (couplet) => couplet.rhyme.kind === "perfect" && !couplet.spelledAlike
        )}
      >
        A rhyme sounds the same but is spelled differently
      </Check>
      <Check ok={reading.long}>
        {`Long: ${plural(reading.syllables, "syllable")}, out of the ${LONG_SYLLABLES} it takes`}
      </Check>
    </ul>
  );
};

/** A verse, with the word it rhymes on in bold. */
const VerseLine = ({ text, last }: { text: string; last: string }) => {
  const at = text.lastIndexOf(last);

  return at === -1 ? (
    text
  ) : (
    <>
      {text.slice(0, at)}
      <strong>{last}</strong>
      {text.slice(at + last.length)}
    </>
  );
};

const CoupletView = ({ couplet }: { couplet: Couplet }) => (
  <li className="spell-couplet">
    {[couplet.first, couplet.second].map((verse, i) => (
      // The two verses of a couplet can be the same words, so their place is the key.
      // oxlint-disable-next-line no-array-index-key
      <p key={i} className="spell-couplet__verse">
        <span>
          <VerseLine text={verse.text} last={verse.last} />
        </span>
        <span className="spell-couplet__count">
          {plural(verse.syllables, "syllable")}
        </span>
      </p>
    ))}
    <p className="hint">
      {`${couplet.first.last.toLowerCase()} / ${couplet.second.last.toLowerCase()}: ${KIND[couplet.rhyme.kind]}`}
      {couplet.rhyme.kind === "perfect"
        ? `, spelled ${couplet.spelledAlike ? "alike" : "differently"}`
        : ""}
      {couplet.rhyme.guessed
        ? " (a word I don’t know, judged by its spelling)"
        : ""}
    </p>
  </li>
);

const Result = ({ reading }: { reading: Reading }) => {
  const power = POWER[reading.tier];

  return (
    <section className="panel spell-panel" aria-live="polite">
      <span className="legend">power.log</span>
      <div className="spell-result">
        <span
          className={`spell-tier spell-tier--${reading.tier.toLowerCase()}`}
        >
          <span className="sr-only">Tier </span>
          {reading.tier}
        </span>
        <div className="stack">
          <h2 className="display spell-result__name">{power.name}</h2>
          <p className="spell-result__effect">
            {reading.failure ? FAILED[reading.failure] : power.effect}
          </p>
        </div>
      </div>
      <div className="spell-power">
        <span className="kicker">Power</span>
        <span aria-hidden="true" className="meter">
          <span className="meter__fill" style={{ width: `${power.power}%` }} />
        </span>
        <span className="spell-power__value">{power.power}%</span>
      </div>
      {reading.couplets.length > 0 ? (
        <>
          <Checks reading={reading} />
          <ol className="spell-couplets">
            {reading.couplets.map((couplet, i) => (
              // A couplet is known by its place in the spell.
              // oxlint-disable-next-line no-array-index-key
              <CoupletView key={i} couplet={couplet} />
            ))}
          </ol>
        </>
      ) : null}
    </section>
  );
};

type Dictionary =
  | { state: "loading" }
  | { state: "ready"; pronounce: Pronounce }
  | { state: "failed" };

/** The CMU Pronouncing Dictionary, loaded with the game, not with the site. */
const useDictionary = () => {
  const [dictionary, setDictionary] = useState<Dictionary>({
    state: "loading",
  });

  useEffect(() => {
    let live = true;

    const load = async () => {
      let next: Dictionary = { state: "failed" };

      try {
        next = { pronounce: await loadPronunciations(), state: "ready" };
      } catch {
        // A lost connection: the cast button says the spellbook won't open.
      }

      if (live) {
        setDictionary(next);
      }
    };

    void load();

    return () => {
      live = false;
    };
  }, []);

  return dictionary;
};

/** The longest spell the field takes. */
const MAX_SPELL = 600;

/** Spell Creator: write a rhyming spell and cast it; the better it rhymes, the stronger it is. */
const SpellCreator = ({ name }: GameProps) => {
  const t = useCopy(COPY);
  const dictionary = useDictionary();
  const [text, setText] = useState("");
  const [reading, setReading] = useState<Reading | null>(null);
  const field = useId();

  const cast = (spell: string) => {
    if (dictionary.state === "ready" && spell.trim()) {
      setReading(readSpell(dictionary.pronounce, spell));
    }
  };

  let castLabel = "cast the spell";

  if (dictionary.state === "loading") {
    castLabel = "opening the spellbook…";
  } else if (dictionary.state === "failed") {
    castLabel = "the spellbook won’t open";
  }

  return (
    <>
      <Header icon={<SpellCreatorIcon />} name={name} href="/spell-creator">
        <Link href="/" className="btn">
          <Icon name="back" size={16} />
          {t.allGames}
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub" lang="en">
          write two rhyming lines: the better the rhyme, the stronger the spell
        </p>
        {t.englishOnly ? (
          <p className="hint" lang="fr">
            {t.englishOnly}
          </p>
        ) : null}

        <div className="layout" lang="en">
          <div className="spell-main">
            <section className="panel spell-panel">
              <span className="legend">spell.txt</span>
              <form
                className="stack spell-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  cast(text);
                }}
              >
                <label className="field-label" htmlFor={field}>
                  Your spell
                </label>
                <textarea
                  id={field}
                  className="field spell-form__text"
                  rows={5}
                  maxLength={MAX_SPELL}
                  placeholder={
                    "Silver candle, shining bright,\nguide me home on wings of light."
                  }
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
                <p className="hint">
                  One verse a line, or a couplet a line with a comma between its
                  two verses.
                </p>
                <div>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={dictionary.state !== "ready" || !text.trim()}
                  >
                    <Icon name="spin" size={18} />
                    {castLabel}
                  </button>
                </div>
              </form>
            </section>

            {reading ? <Result reading={reading} /> : null}
          </div>

          <section
            className="panel panel--narrow spell-panel"
            aria-labelledby="spell-tiers"
          >
            <span className="legend">tiers.csv</span>
            <h2 id="spell-tiers" className="field-label">
              How strong is a spell?
            </h2>
            <ol className="spell-tiers">
              {TIERS.map((tier) => (
                <li key={tier} className="spell-tiers__row">
                  <span
                    aria-hidden="true"
                    className={`spell-tier spell-tier--small spell-tier--${tier.toLowerCase()}`}
                  >
                    {tier}
                  </span>
                  <div className="stack">
                    <span>
                      <span className="sr-only">{`Tier ${tier}: `}</span>
                      {RULES[tier]}
                    </span>
                    <button
                      type="button"
                      className="spell-tiers__try"
                      disabled={dictionary.state !== "ready"}
                      onClick={() => {
                        setText(EXAMPLES[tier]);
                        cast(EXAMPLES[tier]);
                      }}
                    >
                      {`try a tier ${tier} spell`}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
};

export default SpellCreator;
