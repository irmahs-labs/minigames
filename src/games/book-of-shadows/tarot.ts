/**
 * The 78 cards of a Rider–Waite–Smith tarot deck, and how to read each one,
 * upright and reversed. The 22 major arcana are life's big lessons; the 56
 * minor arcana, in four suits of fourteen, are its everyday weather.
 */
export type Suit = "wands" | "cups" | "swords" | "pentacles";

export const SUITS: readonly Suit[] = ["wands", "cups", "swords", "pentacles"];

export interface SuitInfo {
  name: string;
  element: string;
  about: string;
}

export const SUIT_INFO: Readonly<Record<Suit, SuitInfo>> = {
  cups: {
    about: "feelings, love, intuition and relationships",
    element: "Water",
    name: "Cups",
  },
  pentacles: {
    about: "money, work, the body and the home",
    element: "Earth",
    name: "Pentacles",
  },
  swords: {
    about: "thoughts, truth, words and conflict",
    element: "Air",
    name: "Swords",
  },
  wands: {
    about: "passion, energy, creativity and action",
    element: "Fire",
    name: "Wands",
  },
};

export interface Reading {
  keywords: string;
  meaning: string;
}

export interface TarotCard {
  /** "the-fool", "three-of-cups": for keys and lookups. */
  id: string;
  name: string;
  /** The major arcana's numeral (0, I … XXI), or the minor card's rank. */
  label: string;
  suit: Suit | null;
  /** The sign, planet or element the major arcana are tied to. */
  ruler: string | null;
  upright: Reading;
  reversed: Reading;
}

type Row = readonly [
  uprightKeywords: string,
  upright: string,
  reversedKeywords: string,
  reversed: string,
];

type MajorRow = readonly [name: string, ruler: string, ...reading: Row];

const MAJORS: readonly MajorRow[] = [
  [
    "The Fool",
    "Uranus, air",
    "new beginnings, innocence, a leap of faith",
    "A fresh start. Step off the cliff with trust, curiosity and a light pack.",
    "recklessness, hesitation, naivety",
    "Either leaping without looking, or too afraid to leap at all.",
  ],
  [
    "The Magician",
    "Mercury",
    "willpower, skill, manifestation",
    "Everything you need is on the table. Focus your will and make it happen.",
    "manipulation, scattered energy, untapped talent",
    "Tricks, half-truths, or a gift left unused. Check whose agenda this serves.",
  ],
  [
    "The High Priestess",
    "the Moon",
    "intuition, mystery, inner knowing",
    "Be still and listen: the answer is already in you, under the surface.",
    "secrets, ignored intuition, withdrawal",
    "You are tuning out your inner voice, or something is being kept from you.",
  ],
  [
    "The Empress",
    "Venus",
    "abundance, nurture, creativity",
    "Fertile ground: care, comfort, beauty and things that grow.",
    "smothering, dependence, creative block",
    "Care given too much or too little, to others or to yourself.",
  ],
  [
    "The Emperor",
    "Aries",
    "structure, authority, stability",
    "Order and leadership. Set the rules, take charge, build something solid.",
    "control, rigidity, domination",
    "Power held too tightly, or the structure you need is missing.",
  ],
  [
    "The Hierophant",
    "Taurus",
    "tradition, teaching, belonging",
    "Learn from a tradition, a teacher or a community, on a path others have walked.",
    "rebellion, dogma, breaking convention",
    "Questioning the rules, or stuck in ones that no longer fit you.",
  ],
  [
    "The Lovers",
    "Gemini",
    "love, union, choices",
    "A deep bond, or a choice made from the heart and true to your values.",
    "disharmony, imbalance, misaligned choices",
    "A relationship or a decision out of step with what you really value.",
  ],
  [
    "The Chariot",
    "Cancer",
    "determination, willpower, victory",
    "Take the reins: pull opposing forces together and drive forward.",
    "lack of direction, aggression, stalling",
    "Going nowhere, or forcing it. Regain control before you push.",
  ],
  [
    "Strength",
    "Leo",
    "courage, compassion, inner strength",
    "Gentle strength: tame the lion with patience, not force.",
    "self-doubt, insecurity, raw temper",
    "Fear or anger has the upper hand. Be kind to yourself first.",
  ],
  [
    "The Hermit",
    "Virgo",
    "solitude, introspection, inner guidance",
    "Step back from the noise and follow your own lantern.",
    "isolation, loneliness, avoidance",
    "Solitude has turned into hiding, or you are avoiding the reflection you need.",
  ],
  [
    "Wheel of Fortune",
    "Jupiter",
    "cycles, fate, turning points",
    "The wheel turns: luck changes and a new chapter begins.",
    "bad luck, resisting change, repeating cycles",
    "A downturn, or a pattern you keep living. What can you change?",
  ],
  [
    "Justice",
    "Libra",
    "fairness, truth, cause and effect",
    "The truth comes out and consequences land fairly. Act with integrity.",
    "injustice, dishonesty, dodging accountability",
    "Something is unfair, or someone, maybe you, is avoiding responsibility.",
  ],
  [
    "The Hanged Man",
    "Neptune, water",
    "surrender, pause, a new perspective",
    "Hang upside down for a while: letting go shows you a new view.",
    "stalling, resistance, needless sacrifice",
    "Stuck in limbo, or giving things up with nothing to show for it.",
  ],
  [
    "Death",
    "Scorpio",
    "endings, transformation, transition",
    "Rarely a literal death: something ends so something new can begin.",
    "resisting change, stagnation, fear of endings",
    "Clinging to what is over keeps you from the next chapter.",
  ],
  [
    "Temperance",
    "Sagittarius",
    "balance, moderation, patience",
    "Blend opposites slowly. The middle path heals.",
    "excess, imbalance, impatience",
    "Too much of something. Bring yourself back to the middle.",
  ],
  [
    "The Devil",
    "Capricorn",
    "attachment, temptation, the shadow self",
    "Chains of habit, desire or fear, and they are looser than they look.",
    "release, breaking free, reclaiming power",
    "You see the chains for what they are and start slipping them off.",
  ],
  [
    "The Tower",
    "Mars",
    "upheaval, sudden change, revelation",
    "What was built on false ground falls, and the lightning clears the way.",
    "averted disaster, fear of change, delayed collapse",
    "The crash is dodged or put off, or it happens on the inside.",
  ],
  [
    "The Star",
    "Aquarius",
    "hope, renewal, inspiration",
    "After the storm, calm and healing. Trust, and pour out your gifts.",
    "despair, disconnection, lost faith",
    "Hope feels far away. Reconnect with whatever restores you.",
  ],
  [
    "The Moon",
    "Pisces",
    "illusion, dreams, the subconscious",
    "Things are not what they seem. Walk through the fog by intuition.",
    "confusion lifting, fears released, truth revealed",
    "The fog clears, and hidden fears or lies come to light.",
  ],
  [
    "The Sun",
    "the Sun",
    "joy, success, vitality",
    "Warmth, clarity and celebration: everything is bright.",
    "dimmed joy, passing clouds, overconfidence",
    "The sun is still there, only behind a cloud; or the ego is getting big.",
  ],
  [
    "Judgement",
    "Pluto, fire",
    "awakening, reckoning, a calling",
    "A call you cannot ignore. Rise, forgive, and answer it.",
    "self-doubt, ignoring the call, harsh self-judgement",
    "You hear the call but doubt yourself, or judge yourself too hard.",
  ],
  [
    "The World",
    "Saturn",
    "completion, wholeness, fulfilment",
    "A cycle completes. Celebrate, take it in, and get ready for the next one.",
    "incompletion, shortcuts, loose ends",
    "Almost there. Finish what is left before you move on.",
  ],
];

/** Each suit's cards in order: Ace to Ten, then Page, Knight, Queen, King. */
const MINORS: Readonly<Record<Suit, readonly Row[]>> = {
  cups: [
    [
      "new love, compassion, overflowing feelings",
      "Your cup runs over: a new love, a friendship, a fresh start of the heart.",
      "blocked feelings, emptiness, repression",
      "Love is held back, or you are pouring from an empty cup.",
    ],
    [
      "partnership, attraction, union",
      "A balanced bond between two equals.",
      "imbalance, breakup, miscommunication",
      "A connection that has fallen out of step.",
    ],
    [
      "friendship, celebration, community",
      "Raise a glass with your people.",
      "overindulgence, gossip, isolation",
      "Too much partying, or tension in the group.",
    ],
    [
      "apathy, contemplation, missed chances",
      "Bored or withdrawn, you do not see the cup being offered.",
      "new awareness, acceptance, re-engaging",
      "You look up and finally notice what is offered.",
    ],
    [
      "loss, grief, regret",
      "Mourning what spilled, while two cups still stand behind you.",
      "acceptance, moving on, forgiveness",
      "You turn to what is left and begin to heal.",
    ],
    [
      "nostalgia, childhood, innocence",
      "Sweet memories, old friends, the past coming back.",
      "stuck in the past, rose-tinted memories",
      "Living in yesterday instead of today.",
    ],
    [
      "choices, fantasy, illusion",
      "Many dreams, not all of them real. Choose with care.",
      "clarity, decisiveness, a reality check",
      "The haze lifts and you see which cup is real.",
    ],
    [
      "walking away, seeking more, disillusion",
      "Leaving behind what no longer fulfils you.",
      "fear of change, drifting, staying too long",
      "Afraid to go, or leaving without knowing why.",
    ],
    [
      "contentment, wishes granted, satisfaction",
      "The wish card: what you hoped for comes true.",
      "dissatisfaction, smugness, materialism",
      "You got what you wanted, and it does not feel right.",
    ],
    [
      "harmony, a happy family, emotional fulfilment",
      "Lasting happiness, love and home.",
      "broken harmony, disconnection, unrealistic ideals",
      "The picture-perfect home has cracks in it.",
    ],
    [
      "a creative spark, intuition, a sweet message",
      "A dreamy message or a happy emotional surprise.",
      "emotional immaturity, blocked creativity",
      "Moodiness, or feelings you do not know how to show.",
    ],
    [
      "romance, charm, following the heart",
      "An offer of love or of art, made with real feeling.",
      "moodiness, unrealistic ideals, jealousy",
      "All charm and no substance, or swept off by a mood.",
    ],
    [
      "compassion, empathy, intuition",
      "Caring, intuitive and wise about feelings.",
      "martyrdom, co-dependence, insecurity",
      "Giving away too much of yourself.",
    ],
    [
      "emotional balance, diplomacy, calm",
      "Calm waters: kind, wise and steady in feeling.",
      "manipulation, coldness, volatility",
      "Feelings bottled up, or used as weapons.",
    ],
  ],
  pentacles: [
    [
      "opportunity, prosperity, a new venture",
      "A seed of wealth: a job, money, or a chance to get healthy.",
      "a lost opportunity, poor planning, scarcity",
      "The chance slips through your fingers.",
    ],
    [
      "balance, juggling, adaptability",
      "Keeping many balls in the air, and smiling.",
      "overwhelm, disorganisation, dropped balls",
      "Something is about to fall.",
    ],
    [
      "teamwork, craft, collaboration",
      "Skilled work, done together.",
      "disharmony, sloppy work, going it alone",
      "The team or the craftsmanship falls short.",
    ],
    [
      "security, saving, control",
      "Holding on tight to what you have.",
      "greed, letting go, overspending",
      "The grip is too tight, or suddenly too loose.",
    ],
    [
      "hardship, poverty, isolation",
      "Out in the cold, though help is close if you look up.",
      "recovery, charity, improvement",
      "Things start to get better.",
    ],
    [
      "generosity, giving and receiving, charity",
      "Wealth flows both ways.",
      "debt, strings attached, inequality",
      "A gift with a price tag.",
    ],
    [
      "patience, a long-term view, investment",
      "The harvest is coming; keep tending.",
      "impatience, poor returns, wasted effort",
      "Work that is not paying off. Time to change course?",
    ],
    [
      "mastery, diligence, skill",
      "Practice, practice, practice.",
      "perfectionism, lack of focus, busywork",
      "Working hard on the wrong things.",
    ],
    [
      "luxury, self-sufficiency, reward",
      "Enjoying what you earned, on your own terms.",
      "overwork, hustle, setbacks",
      "Working so hard you cannot enjoy any of it.",
    ],
    [
      "legacy, family wealth, lasting success",
      "Abundance that lasts and is passed down.",
      "family disputes, financial loss, instability",
      "Money trouble in the family.",
    ],
    [
      "ambition, study, manifesting",
      "A diligent student with a new plan.",
      "procrastination, lack of progress",
      "The plan never leaves the page.",
    ],
    [
      "hard work, routine, reliability",
      "Slow and steady wins.",
      "boredom, laziness, stagnation",
      "Stuck in a rut.",
    ],
    [
      "nurturing, practicality, abundance",
      "Warm, grounded and resourceful, with home and work in balance.",
      "self-neglect, work-home imbalance",
      "Caring for everyone but yourself.",
    ],
    [
      "wealth, security, discipline",
      "Abundant and generous, through steady work.",
      "greed, stubbornness, materialism",
      "Money becomes the measure of everything.",
    ],
  ],
  swords: [
    [
      "clarity, breakthrough, truth",
      "A clear thought cuts through the confusion.",
      "confusion, misinformation, harsh words",
      "Muddled thinking, or words used as weapons.",
    ],
    [
      "stalemate, indecision, avoidance",
      "Blindfolded between two choices.",
      "overwhelm, too much information, a decision forced",
      "The blindfold slips: you cannot put the choice off any longer.",
    ],
    [
      "heartbreak, grief, a painful truth",
      "A sorrow that pierces. Let yourself feel it.",
      "healing, forgiveness, recovery",
      "The wound begins to close.",
    ],
    [
      "rest, recovery, contemplation",
      "Lay down your sword and rest.",
      "restlessness, burnout, stagnation",
      "You need the rest you are not taking.",
    ],
    [
      "conflict, winning at all costs, defeat",
      "A hollow win. Was it worth what it cost?",
      "reconciliation, making amends, regret",
      "The battle ends and bridges can be rebuilt.",
    ],
    [
      "transition, moving on, calmer waters",
      "Leaving troubles behind for a calmer shore.",
      "resistance, unfinished business, feeling stuck",
      "You cannot quite leave yet.",
    ],
    [
      "deception, strategy, getting away with it",
      "Sneaking off with what is not yours, or a clever plan.",
      "confession, conscience, getting caught",
      "The truth comes out.",
    ],
    [
      "restriction, feeling trapped, a victim mindset",
      "Bound by your own thoughts, and the bonds are loose.",
      "release, freedom, a new perspective",
      "You realise you can walk away.",
    ],
    [
      "anxiety, worry, nightmares",
      "Sleepless worry, bigger in your head than in life.",
      "hope, reaching out, despair easing",
      "Light after a long, dark night.",
    ],
    [
      "a painful ending, rock bottom, betrayal",
      "It cannot get worse; the only way now is up.",
      "recovery, regeneration, survival",
      "You get up, slowly.",
    ],
    [
      "curiosity, new ideas, watchfulness",
      "Eager to learn, to ask questions and to speak the truth.",
      "gossip, all talk, defensiveness",
      "Words without wisdom.",
    ],
    [
      "ambition, action, quick thinking",
      "Charging in with logic and speed.",
      "rashness, aggression, scattered thoughts",
      "Too fast and too sharp.",
    ],
    [
      "clarity, independence, honest boundaries",
      "Clear-eyed and direct, telling the truth with grace.",
      "coldness, bitterness, harsh judgement",
      "Truth without kindness.",
    ],
    [
      "intellect, authority, truth",
      "Fair, logical and principled.",
      "manipulation, tyranny, abuse of power",
      "Cold reason used to control others.",
    ],
  ],
  wands: [
    [
      "inspiration, a new venture, a spark",
      "A burst of creative fire: an idea or a passion wants to begin.",
      "delays, low motivation, a false start",
      "The spark sputters. Wait, or find what is in the way.",
    ],
    [
      "planning, decisions, the bigger picture",
      "The world in your hand. Plan your next bold move.",
      "fear of the unknown, poor planning",
      "Playing it safe, or not planning at all.",
    ],
    [
      "expansion, foresight, progress",
      "Your ships are coming in. Look ahead and expand.",
      "delays, obstacles, frustration",
      "Plans stall, or hopes run ahead of results.",
    ],
    [
      "celebration, home, harmony",
      "A joyful milestone, a homecoming, a reason to celebrate.",
      "tension at home, transition, cancelled plans",
      "The celebration is muted, or home feels unsettled.",
    ],
    [
      "competition, conflict, rivalry",
      "Clashing egos, and competition, healthy or not.",
      "avoiding conflict, a truce, inner conflict",
      "The fight ends, or it moves inside you.",
    ],
    [
      "victory, recognition, success",
      "Public success, and the praise that comes with it.",
      "ego, a fall from grace, no recognition",
      "Success goes to your head, or the applause never comes.",
    ],
    [
      "defence, perseverance, standing your ground",
      "Hold your position against the challengers.",
      "giving up, overwhelm, defensiveness",
      "You feel outnumbered and close to giving in.",
    ],
    [
      "speed, movement, swift news",
      "Things move fast: messages, travel, momentum.",
      "delays, frustration, slowing down",
      "The momentum stalls. Be patient.",
    ],
    [
      "resilience, persistence, a last stand",
      "Battered but standing: one more push.",
      "exhaustion, paranoia, stubbornness",
      "Too tired or too guarded to go on. Ask for help.",
    ],
    [
      "burden, responsibility, overload",
      "Carrying far too much on your own.",
      "delegating, release, collapse",
      "Put some of it down, or it will fall anyway.",
    ],
    [
      "curiosity, enthusiasm, a free spirit",
      "Exciting news, or a new passion to explore.",
      "scattered ideas, impatience, setbacks",
      "Plenty of ideas, little follow-through.",
    ],
    [
      "adventure, passion, impulsiveness",
      "Charge ahead with energy and charm.",
      "haste, recklessness, frustration",
      "Rushing in and burning out.",
    ],
    [
      "confidence, warmth, determination",
      "Magnetic, bold and generous: she owns the room.",
      "jealousy, insecurity, demands",
      "The fire turns on itself, or on others.",
    ],
    [
      "vision, leadership, enterprise",
      "A visionary leader who makes others want to act.",
      "impulsiveness, tyranny, impossible standards",
      "Leading by force, or setting goals nobody could reach.",
    ],
  ],
};

const NUMERALS = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
];

const RANKS = [
  "Ace",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Page",
  "Knight",
  "Queen",
  "King",
];

/** "Ace" → "A", "Seven" → "7", "Queen" → "Q": a minor card's corner. */
const SHORT_RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "P",
  "Kn",
  "Q",
  "K",
];

const idOf = (name: string) => name.toLowerCase().replaceAll(/[^a-z]+/gu, "-");

const readings = ([upKeywords, up, downKeywords, down]: Row) => ({
  reversed: { keywords: downKeywords, meaning: down },
  upright: { keywords: upKeywords, meaning: up },
});

/** The whole deck, in order: the major arcana, then Wands, Cups, Swords, Pentacles. */
export const DECK: readonly TarotCard[] = [
  ...MAJORS.map(([name, ruler, ...row], i) => ({
    id: idOf(name),
    label: NUMERALS[i] ?? String(i),
    name,
    ruler,
    suit: null,
    ...readings(row),
  })),
  ...SUITS.flatMap((suit) =>
    MINORS[suit].map((row, i) => {
      const name = `${RANKS[i]} of ${SUIT_INFO[suit].name}`;

      return {
        id: idOf(name),
        label: SHORT_RANKS[i] ?? String(i + 1),
        name,
        ruler: null,
        suit,
        ...readings(row),
      };
    })
  ),
];

export type DeckFilter = "all" | "major" | Suit;

/** The cards a filter and a search keep: by name or by keyword, either way up. */
export const cardsMatching = (
  filter: DeckFilter,
  search: string
): TarotCard[] => {
  const wanted = search.trim().toLowerCase();

  return DECK.filter((card) => {
    const inFilter =
      filter === "all" ||
      (filter === "major" ? card.suit === null : card.suit === filter);

    const text =
      `${card.name} ${card.upright.keywords} ${card.reversed.keywords}`.toLowerCase();

    return inFilter && (wanted === "" || text.includes(wanted));
  });
};

export interface Draw {
  card: TarotCard;
  reversed: boolean;
}

/**
 * One card from a shuffled deck, upright or reversed with even odds.
 * `random` gives 0 ≤ n < 1, like Math.random.
 */
export const drawCard = (random: () => number): Draw => {
  const card = DECK[Math.floor(random() * DECK.length)] ?? DECK[0];

  if (!card) {
    throw new Error("The deck is empty");
  }

  return { card, reversed: random() < 0.5 };
};

/** A fair 0 ≤ n < 1 from the browser's crypto, for drawing. */
export const cryptoRandom = (): number =>
  (crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) / 2 ** 32;
