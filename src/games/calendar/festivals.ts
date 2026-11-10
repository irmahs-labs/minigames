import type { Language } from "../../lib/language";
import { festivalsIn } from "../book-of-shadows/buddhist-calendar";
import type { FestivalId } from "../book-of-shadows/buddhist-calendar";
import { sabbatsIn } from "../book-of-shadows/sabbats";
import type { SabbatId } from "../book-of-shadows/sabbats";
import { keyOf, localTimeZone } from "../book-of-shadows/time";
import {
  daysOf,
  easter,
  lastTuesdayBefore,
  orthodoxEaster,
  qingming,
  shift,
  spanOf,
} from "./dates";
import type { CalendarSystem, Span } from "./dates";
import { holikaDahan, indianDay, keptOn, sankranti, tithiSpan } from "./hindu";
import type { Observance, TithiOf } from "./hindu";

/**
 * The festivals the calendar can show, in groups a visitor adds: by region
 * where a festival is a people's (East Asian, Latin American…), by faith
 * where it is a religion's (Islamic, Jewish, Christian). A festival many
 * countries keep is one entry, with each country's own name for it.
 *
 * Names are as they are said where the festival is kept, in Latin letters
 * the English or French way, with the name in its own script beside it.
 * Countries are UN member states, by their ISO 3166 codes.
 */

/** One line in each of the site's languages. */
export type Words = Record<Language, string>;

export type GroupId =
  | "east-asia"
  | "southeast-asia"
  | "south-asia"
  | "islamic"
  | "jewish"
  | "christian"
  | "latin-america"
  | "nowruz"
  | "africa"
  | "wheel";

/** What a country calls a festival it shares: "Seollal", 설날, in Korea. */
export interface LocalName {
  countries: readonly string[];
  name: string;
  script?: string;
}

export interface Festival {
  id: string;
  group: GroupId;
  emoji: string;
  /** Its name, as said where it is kept, or a shared name for one many places keep. */
  name: Words;
  /** Its name in its own script, when that isn't Latin: "春节". */
  script?: string;
  about: Words;
  /** Where it is kept; none for around the world. */
  countries: readonly string[];
  local?: readonly LocalName[];
  note?: Words;
  /** Its days in a Gregorian year: usually one span, none or two for a shorter calendar's. */
  spans: (year: number) => readonly Span[];
}

const words = (en: string, fr = en): Words => ({ en, fr });

// ── How each festival's days are found ──

/** The same Gregorian day every year. */
const fixed =
  (month: number, day: number, days = 1) =>
  (year: number) => [spanOf(keyOf(year, month, day), days)];

/** A day of another calendar's month: any of `months`, for Adar and Adar II. */
const onCalendar =
  (system: CalendarSystem, months: readonly string[], day: number, days = 1) =>
  (year: number) =>
    daysOf(system, year, months, day).map((start) => spanOf(start, days));

const chinese = (month: number, day: number, days = 1) =>
  onCalendar("chinese", [String(month)], day, days);

const islamic = (month: number, day: number, days = 1) =>
  onCalendar("islamic-umalqura", [String(month)], day, days);

const hebrew = (months: readonly string[], day: number, days = 1) =>
  onCalendar("hebrew", months, day, days);

const persian = (month: number, day: number, days = 1) =>
  onCalendar("persian", [String(month)], day, days);

const ethiopian = (month: number, day: number, days = 1) =>
  onCalendar("ethiopic", [String(month)], day, days);

/** Days from Easter Sunday: Good Friday is -2. */
const fromEaster =
  (offset: number, days = 1, orthodox = false) =>
  (year: number) => [
    spanOf(shift((orthodox ? orthodoxEaster : easter)(year), offset), days),
  ];

/** A tithi of a Hindu lunar month, on the day it holds at `at`. */
const hindu =
  (tithi: TithiOf, at: Observance, days = 1) =>
  (year: number) => {
    const span = tithiSpan(tithi, year);

    return span ? [spanOf(keptOn(span, at), days)] : [];
  };

/** The day in India the Sun enters a sidereal sign (0 Mesha … 9 Makara). */
const solar = (sign: number) => (year: number) => {
  const entry = sankranti(sign, new Date(Date.UTC(year, 0, 1)));

  return entry ? [spanOf(indianDay(entry))] : [];
};

/** A festival of Cambodia's Buddhist calendar. */
const khmer =
  (id: FestivalId, from = 0, days?: number) =>
  (year: number) =>
    festivalsIn(year)
      .filter((entry) => entry.festival.id === id)
      .map(({ start, end }) =>
        days === undefined
          ? { end, start: shift(start, from) }
          : spanOf(shift(start, from), days)
      );

/** Ramadan: from its first day to the eve of Eid al-Fitr. */
const ramadan = (year: number) =>
  daysOf("islamic-umalqura", year, ["9"], 1).flatMap((start) => {
    const eid = [
      ...daysOf("islamic-umalqura", year, ["10"], 1),
      ...daysOf("islamic-umalqura", year + 1, ["10"], 1),
    ].find((day) => day > start);

    return eid ? [{ end: shift(eid, -1), start }] : [];
  });

const sabbat = (id: SabbatId) => (year: number) =>
  sabbatsIn(year, false, localTimeZone())
    .filter((entry) => entry.sabbat.id === id)
    .map((entry) => spanOf(entry.key));

// ── Who keeps them ──

/** Countries where most people are Muslim. */
const MUSLIM = [
  "AF",
  "AL",
  "AE",
  "AZ",
  "BA",
  "BD",
  "BF",
  "BH",
  "BN",
  "DJ",
  "DZ",
  "EG",
  "GM",
  "GN",
  "ID",
  "IQ",
  "IR",
  "JO",
  "KG",
  "KM",
  "KW",
  "KZ",
  "LB",
  "LY",
  "MA",
  "ML",
  "MR",
  "MV",
  "MY",
  "NE",
  "NG",
  "OM",
  "PK",
  "QA",
  "SA",
  "SD",
  "SL",
  "SN",
  "SO",
  "SY",
  "TD",
  "TJ",
  "TM",
  "TN",
  "TR",
  "UZ",
  "YE",
];

/** Countries whose churches keep the old (Julian) calendar's feasts. */
const ORTHODOX = [
  "BG",
  "BY",
  "CY",
  "EG",
  "ER",
  "ET",
  "GE",
  "GR",
  "MD",
  "ME",
  "MK",
  "RO",
  "RS",
  "RU",
  "UA",
];

const HINDU = ["IN", "NP", "MU", "FJ", "GY", "TT", "SR"];

// ── The festivals ──

export const FESTIVALS: readonly Festival[] = [
  // East Asian
  {
    about: words(
      "The first day of the lunar year: family reunions, red envelopes, firecrackers and dumplings.",
      "Le premier jour de l’année lunaire : retrouvailles en famille, enveloppes rouges, pétards et raviolis."
    ),
    countries: ["CN", "KR", "KP", "VN", "SG", "MY", "ID", "BN", "PH"],
    emoji: "🧧",
    group: "east-asia",
    id: "lunar-new-year",
    local: [
      {
        countries: ["CN", "SG", "MY", "ID", "BN", "PH"],
        name: "Chūnjié",
        script: "春节",
      },
      { countries: ["KR", "KP"], name: "Seollal", script: "설날" },
      { countries: ["VN"], name: "Tết Nguyên Đán" },
    ],
    name: words("Lunar New Year", "Nouvel An lunaire"),
    spans: chinese(1, 1),
  },
  {
    about: words(
      "The first full moon of the year closes the New Year: lanterns, riddles and sweet rice balls.",
      "La première pleine lune de l’année clôt le Nouvel An : lanternes, devinettes et boulettes de riz sucrées."
    ),
    countries: ["CN", "KR", "VN", "SG", "MY"],
    emoji: "🏮",
    group: "east-asia",
    id: "lantern-festival",
    local: [
      { countries: ["CN", "SG", "MY"], name: "Yuánxiāo jié", script: "元宵节" },
      { countries: ["KR"], name: "Jeongwol Daeboreum", script: "정월 대보름" },
      { countries: ["VN"], name: "Tết Nguyên Tiêu" },
    ],
    name: words("Lantern Festival", "Fête des lanternes"),
    spans: chinese(1, 15),
  },
  {
    about: words(
      "Tomb-Sweeping Day: families tend their ancestors’ graves and walk out into the spring.",
      "La fête des tombes : les familles entretiennent les tombes des ancêtres et sortent goûter le printemps."
    ),
    countries: ["CN"],
    emoji: "🌿",
    group: "east-asia",
    id: "qingming",
    name: words("Qīngmíng"),
    script: "清明节",
    spans: (year) => {
      const day = qingming(year);

      return day ? [spanOf(day)] : [];
    },
  },
  {
    about: words(
      "Dragon-boat races and sticky rice dumplings wrapped in bamboo leaves, on the fifth day of the fifth month.",
      "Courses de bateaux-dragons et riz gluant en feuilles de bambou, le cinquième jour du cinquième mois."
    ),
    countries: ["CN", "KR", "VN", "SG", "MY"],
    emoji: "🐉",
    group: "east-asia",
    id: "dragon-boat",
    local: [
      { countries: ["CN", "SG", "MY"], name: "Duānwǔ jié", script: "端午节" },
      { countries: ["KR"], name: "Dano", script: "단오" },
      { countries: ["VN"], name: "Tết Đoan Ngọ" },
    ],
    name: words("Dragon Boat Festival", "Fête des bateaux-dragons"),
    spans: chinese(5, 5),
  },
  {
    about: words(
      "The night the weaver girl and the cowherd, two stars kept apart by the Milky Way, meet once a year.",
      "La nuit où la tisserande et le bouvier, deux étoiles séparées par la Voie lactée, se retrouvent une fois l’an."
    ),
    countries: ["CN", "KR"],
    emoji: "🌌",
    group: "east-asia",
    id: "qixi",
    local: [
      { countries: ["CN"], name: "Qīxī", script: "七夕" },
      { countries: ["KR"], name: "Chilseok", script: "칠석" },
    ],
    name: words("Double Seventh", "Double Sept"),
    spans: chinese(7, 7),
  },
  {
    about: words(
      "The gates of the underworld open: offerings and paper money are burnt for wandering spirits.",
      "Les portes de l’au-delà s’ouvrent : on brûle offrandes et papier-monnaie pour les esprits errants."
    ),
    countries: ["CN", "VN", "SG", "MY"],
    emoji: "👻",
    group: "east-asia",
    id: "ghost-festival",
    local: [
      {
        countries: ["CN", "SG", "MY"],
        name: "Zhōngyuán jié",
        script: "中元节",
      },
      { countries: ["VN"], name: "Lễ Vu Lan" },
    ],
    name: words("Ghost Festival", "Fête des fantômes"),
    spans: chinese(7, 15),
  },
  {
    about: words(
      "The harvest moon at its roundest: mooncakes, lanterns and family gathered to look at it.",
      "La lune des moissons dans toute sa rondeur : gâteaux de lune, lanternes et famille réunie pour la contempler."
    ),
    countries: ["CN", "KR", "KP", "VN", "JP", "SG", "MY"],
    emoji: "🥮",
    group: "east-asia",
    id: "mid-autumn",
    local: [
      { countries: ["CN", "SG", "MY"], name: "Zhōngqiū jié", script: "中秋节" },
      { countries: ["KR", "KP"], name: "Chuseok", script: "추석" },
      { countries: ["VN"], name: "Tết Trung Thu" },
      { countries: ["JP"], name: "Tsukimi", script: "月見" },
    ],
    name: words("Mid-Autumn Festival", "Fête de la mi-automne"),
    spans: chinese(8, 15),
  },
  {
    about: words(
      "The Japanese New Year: the first shrine visit, New Year cards and a feast of osechi.",
      "Le Nouvel An japonais : première visite au sanctuaire, cartes de vœux et festin d’osechi."
    ),
    countries: ["JP"],
    emoji: "🎍",
    group: "east-asia",
    id: "shogatsu",
    name: words("Shōgatsu"),
    script: "正月",
    spans: fixed(1, 1, 3),
  },
  {
    about: words(
      "The Doll Festival: tiers of dolls in court robes, for girls’ health and happiness.",
      "La fête des poupées : des gradins de poupées en habits de cour, pour la santé et le bonheur des filles."
    ),
    countries: ["JP"],
    emoji: "🎎",
    group: "east-asia",
    id: "hinamatsuri",
    name: words("Hinamatsuri"),
    script: "ひな祭り",
    spans: fixed(3, 3),
  },
  {
    about: words(
      "The Star Festival: wishes written on paper strips and hung on bamboo.",
      "La fête des étoiles : des vœux écrits sur des bandes de papier, suspendus aux bambous."
    ),
    countries: ["JP"],
    emoji: "🎋",
    group: "east-asia",
    id: "tanabata",
    name: words("Tanabata"),
    script: "七夕",
    spans: fixed(7, 7),
  },
  {
    about: words(
      "The ancestors come home: lanterns to guide them, bon dances, and fires to send them back.",
      "Les ancêtres rentrent à la maison : lanternes pour les guider, danses bon, et feux pour les renvoyer."
    ),
    countries: ["JP"],
    emoji: "🏮",
    group: "east-asia",
    id: "obon",
    name: words("Obon"),
    note: words(
      "Some parts of Japan keep it in mid-July.",
      "Certaines régions du Japon la fêtent mi-juillet."
    ),
    script: "お盆",
    spans: fixed(8, 13, 4),
  },
  {
    about: words(
      "The three games of men: wrestling, horse racing and archery, on the steppe.",
      "Les trois jeux virils : lutte, course de chevaux et tir à l’arc, sur la steppe."
    ),
    countries: ["MN"],
    emoji: "🏹",
    group: "east-asia",
    id: "naadam",
    name: words("Naadam"),
    script: "Наадам",
    spans: fixed(7, 11, 3),
  },

  // Southeast Asian and Buddhist
  {
    about: words(
      "The New Year of the Buddhist calendar: water thrown in blessing, temples, and sand stupas.",
      "Le Nouvel An du calendrier bouddhique : eau jetée en bénédiction, pagodes et stupas de sable."
    ),
    countries: ["KH", "TH", "LA", "MM"],
    emoji: "💦",
    group: "southeast-asia",
    id: "khmer-new-year",
    local: [
      { countries: ["KH"], name: "Choul Chnam Thmey", script: "ចូលឆ្នាំថ្មី" },
      { countries: ["TH"], name: "Songkran", script: "สงกรานต์" },
      { countries: ["LA"], name: "Pi Mai", script: "ປີໃໝ່" },
      { countries: ["MM"], name: "Thingyan", script: "သင်္ကြန်" },
    ],
    name: words("Water New Year", "Nouvel An de l’eau"),
    note: words(
      "As Cambodia counts it; Thailand and Laos keep 13 to 15 April.",
      "Selon le calcul cambodgien ; la Thaïlande et le Laos le fêtent du 13 au 15 avril."
    ),
    spans: khmer("khmer-new-year"),
  },
  {
    about: words(
      "The full moon of the Buddha’s birth, awakening and passing: lanterns, alms and candlelit walks around the temple.",
      "La pleine lune de la naissance, de l’Éveil et de la mort du Bouddha : lanternes, offrandes et processions aux chandelles."
    ),
    countries: [
      "KH",
      "TH",
      "LA",
      "MM",
      "LK",
      "NP",
      "BT",
      "MY",
      "SG",
      "ID",
      "VN",
    ],
    emoji: "☸️",
    group: "southeast-asia",
    id: "vesak",
    local: [
      { countries: ["KH"], name: "Visak Bochea", script: "វិសាខបូជា" },
      { countries: ["TH", "LA"], name: "Visakha Bucha", script: "วิสาขบูชา" },
      { countries: ["LK"], name: "Vesak", script: "වෙසක්" },
      { countries: ["NP"], name: "Buddha Jayanti" },
      { countries: ["ID"], name: "Waisak" },
    ],
    name: words("Vesak"),
    note: words(
      "As Cambodia counts it; some countries keep it a month later in some years.",
      "Selon le calcul cambodgien ; certains pays la fêtent un mois plus tard certaines années."
    ),
    spans: khmer("visak-bochea"),
  },
  {
    about: words(
      "The full moon when 1,250 monks came to the Buddha unbidden: candlelit walks around the temple.",
      "La pleine lune où 1 250 moines vinrent au Bouddha sans être appelés : processions aux chandelles."
    ),
    countries: ["KH", "TH", "LA"],
    emoji: "🕯️",
    group: "southeast-asia",
    id: "meak-bochea",
    local: [
      { countries: ["KH"], name: "Meak Bochea", script: "មាឃបូជា" },
      { countries: ["TH", "LA"], name: "Makha Bucha", script: "มาฆบูชา" },
    ],
    name: words("Meak Bochea"),
    spans: khmer("meak-bochea"),
  },
  {
    about: words(
      "The royal oxen plough the first furrow and choose what to eat, foretelling the year’s harvest.",
      "Les bœufs royaux tracent le premier sillon et choisissent leur repas, présageant la récolte de l’année."
    ),
    countries: ["KH"],
    emoji: "🐂",
    group: "southeast-asia",
    id: "royal-ploughing",
    name: words("Chrat Preah Neangkol"),
    script: "ច្រត់ព្រះនង្គ័ល",
    spans: khmer("royal-ploughing"),
  },
  {
    about: words(
      "Ancestors’ Day, the end of fifteen days of offerings: rice balls are taken to the pagoda for the dead.",
      "La fête des ancêtres, au bout de quinze jours d’offrandes : on porte des boulettes de riz à la pagode pour les morts."
    ),
    countries: ["KH"],
    emoji: "🍙",
    group: "southeast-asia",
    id: "pchum-ben",
    name: words("Pchum Ben"),
    script: "ភ្ជុំបិណ្ឌ",
    spans: khmer("pchum-ben"),
  },
  {
    about: words(
      "The Water Festival: boat races on the river as the Tonlé Sap turns, lit boats and moon-worship.",
      "La fête des eaux : courses de pirogues quand le Tonlé Sap s’inverse, bateaux illuminés et salut à la lune."
    ),
    countries: ["KH"],
    emoji: "🛶",
    group: "southeast-asia",
    id: "bon-om-touk",
    name: words("Bon Om Touk"),
    script: "បុណ្យអុំទូក",
    spans: khmer("bon-om-touk"),
  },
  {
    about: words(
      "The full moon of the twelfth month: little floats of banana leaf and candles set on the water.",
      "La pleine lune du douzième mois : de petits radeaux de feuille de bananier et de bougies posés sur l’eau."
    ),
    countries: ["TH", "MM"],
    emoji: "🪷",
    group: "southeast-asia",
    id: "loi-krathong",
    local: [
      { countries: ["TH"], name: "Loi Krathong", script: "ลอยกระทง" },
      { countries: ["MM"], name: "Tazaungdaing", script: "တန်ဆောင်တိုင်" },
    ],
    name: words("Loi Krathong"),
    spans: khmer("bon-om-touk", 1, 1),
  },

  // South Asian and Hindu
  {
    about: words(
      "The festival of lights: oil lamps, sweets and fireworks for Lakshmi on the new moon of Kartika.",
      "La fête des lumières : lampes à huile, douceurs et feux d’artifice pour Lakshmi, à la nouvelle lune de Kartika."
    ),
    countries: [...HINDU, "LK", "MY", "SG"],
    emoji: "🪔",
    group: "south-asia",
    id: "diwali",
    local: [
      {
        countries: ["IN", "FJ", "MU", "GY", "TT", "SR"],
        name: "Dīwālī",
        script: "दिवाली",
      },
      { countries: ["NP"], name: "Tihār", script: "तिहार" },
      { countries: ["LK", "MY", "SG"], name: "Deepavali", script: "தீபாவளி" },
    ],
    name: words("Dīwālī", "Divali"),
    script: "दिवाली",
    spans: hindu({ month: "Ashvin", tithi: 15, waxing: false }, "evening"),
  },
  {
    about: words(
      "The festival of colours: bonfires on the full moon’s eve, then everyone throws coloured powder.",
      "La fête des couleurs : feux de joie la veille de la pleine lune, puis tout le monde se lance de la poudre colorée."
    ),
    countries: HINDU,
    emoji: "🎨",
    group: "south-asia",
    id: "holi",
    local: [
      { countries: ["IN", "NP", "MU", "FJ"], name: "Holī", script: "होली" },
      { countries: ["GY", "TT", "SR"], name: "Phagwah" },
    ],
    name: words("Holī", "Holi"),
    script: "होली",
    spans: (year) => {
      const eve = holikaDahan(year);

      return eve ? [spanOf(shift(eve, 1))] : [];
    },
  },
  {
    about: words(
      "The great night of Shiva: fasting, a night-long vigil and offerings of milk and bilva leaves.",
      "La grande nuit de Shiva : jeûne, veillée toute la nuit et offrandes de lait et de feuilles de bilva."
    ),
    countries: ["IN", "NP", "MU"],
    emoji: "🔱",
    group: "south-asia",
    id: "maha-shivaratri",
    name: words("Mahā Śivarātri", "Maha Shivaratri"),
    script: "महाशिवरात्रि",
    spans: hindu({ month: "Magha", tithi: 14, waxing: false }, "midnight"),
  },
  {
    about: words(
      "Nine nights for the goddess Durga: fasting, prayer and garba dancing.",
      "Neuf nuits pour la déesse Durga : jeûne, prière et danses garba."
    ),
    countries: ["IN", "NP"],
    emoji: "💃",
    group: "south-asia",
    id: "navaratri",
    local: [
      { countries: ["IN"], name: "Navarātri", script: "नवरात्रि" },
      { countries: ["NP"], name: "Ghaṭasthāpanā", script: "घटस्थापना" },
    ],
    name: words("Navarātri", "Navaratri"),
    script: "नवरात्रि",
    spans: hindu({ month: "Ashvin", tithi: 1, waxing: true }, "sunrise", 9),
  },
  {
    about: words(
      "Durga’s five days: great clay goddesses in pandals, then carried to the river.",
      "Les cinq jours de Durga : de grandes déesses d’argile sous des pavillons, puis portées au fleuve."
    ),
    countries: ["IN", "BD"],
    emoji: "🙏",
    group: "south-asia",
    id: "durga-puja",
    name: words("Durgā Pūjā", "Durga Puja"),
    script: "দুর্গাপূজা",
    spans: hindu({ month: "Ashvin", tithi: 6, waxing: true }, "sunrise", 5),
  },
  {
    about: words(
      "The victory of good over evil: effigies of Ravana burnt, and in Nepal, tika and blessings from elders.",
      "La victoire du bien sur le mal : on brûle des effigies de Ravana, et au Népal, tika et bénédictions des aînés."
    ),
    countries: ["IN", "NP", "BD"],
    emoji: "🏹",
    group: "south-asia",
    id: "dussehra",
    local: [
      { countries: ["IN"], name: "Dashahrā", script: "दशहरा" },
      { countries: ["NP"], name: "Bijayā Dashamī", script: "विजया दशमी" },
      { countries: ["BD"], name: "Bijoya Dashomi", script: "বিজয়া দশমী" },
    ],
    name: words("Vijayadashamī", "Vijayadashami"),
    script: "विजयादशमी",
    spans: hindu({ month: "Ashvin", tithi: 10, waxing: true }, "afternoon"),
  },
  {
    about: words(
      "Sisters tie a thread on their brothers’ wrists, and brothers promise to look after them.",
      "Les sœurs nouent un fil au poignet de leurs frères, qui promettent de veiller sur elles."
    ),
    countries: ["IN", "NP", "MU"],
    emoji: "🧵",
    group: "south-asia",
    id: "raksha-bandhan",
    local: [
      { countries: ["IN", "MU"], name: "Rakṣā Bandhan", script: "रक्षा बन्धन" },
      { countries: ["NP"], name: "Janai Pūrṇimā", script: "जनै पूर्णिमा" },
    ],
    name: words("Rakṣā Bandhan", "Raksha Bandhan"),
    script: "रक्षा बन्धन",
    spans: hindu({ month: "Shravana", tithi: 15, waxing: true }, "midday"),
  },
  {
    about: words(
      "Krishna’s birthday: fasting until midnight, songs, and human pyramids breaking pots of curd.",
      "L’anniversaire de Krishna : jeûne jusqu’à minuit, chants, et pyramides humaines qui brisent des pots de lait caillé."
    ),
    countries: ["IN", "NP", "BD"],
    emoji: "🦚",
    group: "south-asia",
    id: "janmashtami",
    name: words("Janmāṣṭamī", "Janmashtami"),
    script: "जन्माष्टमी",
    spans: hindu({ month: "Shravana", tithi: 8, waxing: false }, "sunrise"),
  },
  {
    about: words(
      "Ganesha comes home for ten days, then is carried to the sea with drums and dancing.",
      "Ganesh s’installe dix jours à la maison, puis on le porte à la mer au son des tambours."
    ),
    countries: ["IN", "MU"],
    emoji: "🐘",
    group: "south-asia",
    id: "ganesh-chaturthi",
    name: words("Gaṇeśa Caturthī", "Ganesh Chaturthi"),
    script: "गणेश चतुर्थी",
    spans: hindu({ month: "Bhadrapada", tithi: 4, waxing: true }, "sunrise"),
  },
  {
    about: words(
      "The Sun enters Capricorn: the winter harvest, kites in the sky, and pots of sweet rice boiled over.",
      "Le Soleil entre dans le Capricorne : la récolte d’hiver, des cerfs-volants, et du riz sucré qui déborde de la marmite."
    ),
    countries: ["IN", "NP", "LK", "MY", "SG"],
    emoji: "🪁",
    group: "south-asia",
    id: "makar-sankranti",
    local: [
      { countries: ["IN"], name: "Makar Saṅkrānti", script: "मकर संक्रान्ति" },
      {
        countries: ["IN", "LK", "MY", "SG"],
        name: "Thai Pongal",
        script: "தைப் பொங்கல்",
      },
      { countries: ["NP"], name: "Māghe Saṅkrānti", script: "माघे संक्रान्ति" },
    ],
    name: words("Makar Sankranti"),
    spans: solar(9),
  },
  {
    about: words(
      "The Sun enters Aries and the solar year begins: the wheat harvest, new clothes and the temple.",
      "Le Soleil entre dans le Bélier et l’année solaire commence : moisson du blé, habits neufs et temple."
    ),
    countries: ["IN", "NP", "LK", "BD"],
    emoji: "🌾",
    group: "south-asia",
    id: "solar-new-year",
    local: [
      { countries: ["IN"], name: "Vaisākhī", script: "ਵਿਸਾਖੀ" },
      { countries: ["IN", "LK"], name: "Puthandu", script: "புத்தாண்டு" },
      { countries: ["LK"], name: "Aluth Avurudda", script: "අලුත් අවුරුද්ද" },
      { countries: ["NP"], name: "Nayā Barṣa", script: "नयाँ वर्ष" },
      { countries: ["BD"], name: "Pohela Boishakh", script: "পহেলা বৈশাখ" },
    ],
    name: words("South Asian New Year", "Nouvel An d’Asie du Sud"),
    note: words(
      "Bangladesh keeps it on 14 April every year.",
      "Le Bangladesh le fête le 14 avril chaque année."
    ),
    spans: solar(0),
  },

  // Islamic
  {
    about: words(
      "The first day of Muharram, and of the Hijri year.",
      "Le premier jour de Mouharram, et de l’année de l’Hégire."
    ),
    countries: MUSLIM,
    emoji: "🌙",
    group: "islamic",
    id: "hijri-new-year",
    name: words("Raʾs as-Sana al-Hijriyya", "Ras el-Am el-Hijri"),
    script: "رأس السنة الهجرية",
    spans: islamic(1, 1),
  },
  {
    about: words(
      "The tenth of Muharram: a day of fasting, and for Shia Muslims, of mourning for Husayn.",
      "Le dix de Mouharram : un jour de jeûne, et pour les chiites, de deuil pour Hussein."
    ),
    countries: MUSLIM,
    emoji: "💧",
    group: "islamic",
    id: "ashura",
    name: words("ʿĀshūrāʾ", "Achoura"),
    script: "عاشوراء",
    spans: islamic(1, 10),
  },
  {
    about: words(
      "The Prophet’s birthday: poems, processions and sweets.",
      "L’anniversaire du Prophète : poèmes, processions et douceurs."
    ),
    countries: MUSLIM,
    emoji: "🕌",
    group: "islamic",
    id: "mawlid",
    local: [
      { countries: ["MY", "BN"], name: "Maulidur Rasul" },
      { countries: ["ID"], name: "Maulid Nabi" },
      { countries: ["TR"], name: "Mevlid Kandili" },
    ],
    name: words("al-Mawlid an-Nabawī", "Mawlid an-Nabawi"),
    script: "المولد النبوي",
    spans: islamic(3, 12),
  },
  {
    about: words(
      "The night of the Prophet’s journey to Jerusalem and up through the heavens.",
      "La nuit du voyage du Prophète vers Jérusalem, puis à travers les cieux."
    ),
    countries: MUSLIM,
    emoji: "✨",
    group: "islamic",
    id: "isra-miraj",
    name: words("al-Isrāʾ wal-Miʿrāj", "Al-Isra wal-Miraj"),
    script: "الإسراء والمعراج",
    spans: islamic(7, 27),
  },
  {
    about: words(
      "The month of fasting from dawn to sunset, broken each evening with dates and the iftar.",
      "Le mois de jeûne de l’aube au coucher du soleil, rompu chaque soir par des dattes et l’iftar."
    ),
    countries: MUSLIM,
    emoji: "🌙",
    group: "islamic",
    id: "ramadan",
    name: words("Ramaḍān", "Ramadan"),
    script: "رمضان",
    spans: ramadan,
  },
  {
    about: words(
      "The Night of Power, when the Quran was first revealed, better than a thousand months.",
      "La Nuit du Destin, où le Coran fut révélé, meilleure que mille mois."
    ),
    countries: MUSLIM,
    emoji: "⭐",
    group: "islamic",
    id: "laylat-al-qadr",
    name: words("Laylat al-Qadr", "Laylat al-Qadr"),
    note: words(
      "Sought in the last ten nights of Ramadan; most keep the 27th.",
      "Recherchée dans les dix dernières nuits du ramadan ; la plupart veillent la 27e."
    ),
    script: "ليلة القدر",
    spans: islamic(9, 27),
  },
  {
    about: words(
      "The feast that ends Ramadan: prayers at dawn, new clothes, visits and sweets.",
      "La fête qui clôt le ramadan : prière à l’aube, habits neufs, visites et pâtisseries."
    ),
    countries: MUSLIM,
    emoji: "🎉",
    group: "islamic",
    id: "eid-al-fitr",
    local: [
      { countries: ["TR"], name: "Ramazan Bayramı" },
      { countries: ["ID"], name: "Idul Fitri, Lebaran" },
      { countries: ["MY", "BN"], name: "Hari Raya Aidilfitri" },
      { countries: ["SN", "GM"], name: "Korité" },
      {
        countries: ["AZ", "KZ", "UZ", "TJ", "TM", "KG"],
        name: "Ramazan Bayram",
      },
    ],
    name: words("ʿĪd al-Fiṭr", "Aïd el-Fitr"),
    script: "عيد الفطر",
    spans: islamic(10, 1, 3),
  },
  {
    about: words(
      "The day of the pilgrims’ prayer on Mount Arafat, and of fasting for those at home.",
      "Le jour de la prière des pèlerins sur le mont Arafat, et du jeûne pour ceux restés chez eux."
    ),
    countries: MUSLIM,
    emoji: "⛰️",
    group: "islamic",
    id: "arafah",
    name: words("Yawm ʿArafa", "Jour d’Arafat"),
    script: "يوم عرفة",
    spans: islamic(12, 9),
  },
  {
    about: words(
      "The feast of the sacrifice, remembering Abraham: a sheep shared with family, neighbours and the poor.",
      "La fête du sacrifice, en mémoire d’Abraham : un mouton partagé avec la famille, les voisins et les pauvres."
    ),
    countries: MUSLIM,
    emoji: "🐑",
    group: "islamic",
    id: "eid-al-adha",
    local: [
      { countries: ["TR", "AZ"], name: "Kurban Bayramı" },
      {
        countries: ["SN", "ML", "NE", "BF", "GN", "GM", "MR"],
        name: "Tabaski",
      },
      { countries: ["ID"], name: "Idul Adha" },
      { countries: ["MY", "BN"], name: "Hari Raya Haji" },
      { countries: ["PK", "BD"], name: "Bakra Eid" },
    ],
    name: words("ʿĪd al-Aḍḥā", "Aïd el-Kébir"),
    script: "عيد الأضحى",
    spans: islamic(12, 10, 4),
  },

  // Jewish
  {
    about: words(
      "The Jewish New Year: the shofar is blown, and apples are dipped in honey for a sweet year.",
      "Le Nouvel An juif : on sonne le chofar et on trempe des pommes dans le miel pour une année douce."
    ),
    countries: ["IL"],
    emoji: "🍎",
    group: "jewish",
    id: "rosh-hashanah",
    name: words("Rosh Hashanah", "Roch Hachana"),
    script: "ראש השנה",
    spans: hebrew(["Tishri"], 1, 2),
  },
  {
    about: words(
      "The Day of Atonement: twenty-five hours of fasting and prayer.",
      "Le Grand Pardon : vingt-cinq heures de jeûne et de prière."
    ),
    countries: ["IL"],
    emoji: "🕯️",
    group: "jewish",
    id: "yom-kippur",
    name: words("Yom Kippur", "Yom Kippour"),
    script: "יום כיפור",
    spans: hebrew(["Tishri"], 10),
  },
  {
    about: words(
      "The Feast of Booths: a week of meals in a leafy hut under the sky.",
      "La fête des Cabanes : une semaine de repas dans une hutte de feuillage, sous le ciel."
    ),
    countries: ["IL"],
    emoji: "🌿",
    group: "jewish",
    id: "sukkot",
    name: words("Sukkot", "Souccot"),
    script: "סוכות",
    spans: hebrew(["Tishri"], 15, 7),
  },
  {
    about: words(
      "Rejoicing in the Torah: its reading starts over, with dancing around the scrolls.",
      "La joie de la Torah : sa lecture recommence, et l’on danse autour des rouleaux."
    ),
    countries: ["IL"],
    emoji: "📜",
    group: "jewish",
    id: "simchat-torah",
    name: words("Simchat Torah", "Sim’hat Torah"),
    note: words(
      "As kept in Israel; elsewhere a day later.",
      "Comme en Israël ; ailleurs, un jour plus tard."
    ),
    script: "שמחת תורה",
    spans: hebrew(["Tishri"], 22),
  },
  {
    about: words(
      "The Festival of Lights: a candle more each night for eight nights, and food fried in oil.",
      "La fête des Lumières : une bougie de plus chaque soir pendant huit soirs, et des beignets frits."
    ),
    countries: ["IL"],
    emoji: "🕎",
    group: "jewish",
    id: "hanukkah",
    name: words("Hanukkah", "Hanoucca"),
    script: "חנוכה",
    spans: hebrew(["Kislev"], 25, 8),
  },
  {
    about: words(
      "The New Year of the Trees: trees planted and fruits of the land eaten.",
      "Le Nouvel An des arbres : on plante des arbres et on goûte les fruits du pays."
    ),
    countries: ["IL"],
    emoji: "🌳",
    group: "jewish",
    id: "tu-bishvat",
    name: words("Tu BiShvat", "Tou Bichvat"),
    script: "ט״ו בשבט",
    spans: hebrew(["Shevat"], 15),
  },
  {
    about: words(
      "Esther saves her people: costumes, the scroll read aloud, and gifts of food.",
      "Esther sauve son peuple : déguisements, lecture du rouleau et cadeaux de mets."
    ),
    countries: ["IL"],
    emoji: "🎭",
    group: "jewish",
    id: "purim",
    name: words("Purim", "Pourim"),
    script: "פורים",
    spans: hebrew(["Adar", "Adar II"], 14),
  },
  {
    about: words(
      "Passover, the way out of Egypt: the seder, matzah and the story told again.",
      "La Pâque juive, la sortie d’Égypte : le seder, la matsa et le récit raconté encore."
    ),
    countries: ["IL"],
    emoji: "🍷",
    group: "jewish",
    id: "pesach",
    name: words("Pesach", "Pessa’h"),
    note: words(
      "Seven days in Israel, eight elsewhere.",
      "Sept jours en Israël, huit ailleurs."
    ),
    script: "פסח",
    spans: hebrew(["Nisan"], 15, 7),
  },
  {
    about: words(
      "The Feast of Weeks, for the giving of the Torah: study through the night and dairy food.",
      "La fête des Semaines, pour le don de la Torah : étude toute la nuit et laitages."
    ),
    countries: ["IL"],
    emoji: "🌾",
    group: "jewish",
    id: "shavuot",
    name: words("Shavuot", "Chavouot"),
    script: "שבועות",
    spans: hebrew(["Sivan"], 6),
  },
  {
    about: words(
      "A fast in mourning for the two Temples of Jerusalem.",
      "Un jeûne en deuil des deux Temples de Jérusalem."
    ),
    countries: ["IL"],
    emoji: "🕯️",
    group: "jewish",
    id: "tisha-bav",
    name: words("Tisha B’Av", "Ticha Beav"),
    script: "תשעה באב",
    spans: hebrew(["Av"], 9),
  },

  // Christian
  {
    about: words(
      "The three kings reach Bethlehem: king cakes, and in Spain and Latin America, presents.",
      "Les Rois mages arrivent à Bethléem : galettes des rois, et en Espagne et en Amérique latine, des cadeaux."
    ),
    countries: [],
    emoji: "👑",
    group: "christian",
    id: "epiphany",
    local: [
      {
        countries: ["ES", "MX", "AR", "UY", "PY", "VE", "CO", "DO", "CU", "PE"],
        name: "Día de Reyes",
      },
    ],
    name: words("Epiphany", "Épiphanie"),
    spans: fixed(1, 6),
  },
  {
    about: words(
      "Ashes on the forehead begin the forty days of Lent.",
      "Les cendres sur le front ouvrent les quarante jours du carême."
    ),
    countries: [],
    emoji: "✝️",
    group: "christian",
    id: "ash-wednesday",
    name: words("Ash Wednesday", "Mercredi des Cendres"),
    spans: fromEaster(-46),
  },
  {
    about: words(
      "Jesus rides into Jerusalem: palms and olive branches blessed at church.",
      "Jésus entre à Jérusalem : palmes et rameaux d’olivier bénis à l’église."
    ),
    countries: [],
    emoji: "🌿",
    group: "christian",
    id: "palm-sunday",
    name: words("Palm Sunday", "Dimanche des Rameaux"),
    spans: fromEaster(-7),
  },
  {
    about: words(
      "The day of the crucifixion: fasting, the Stations of the Cross and processions.",
      "Le jour de la crucifixion : jeûne, chemin de croix et processions."
    ),
    countries: [],
    emoji: "✝️",
    group: "christian",
    id: "good-friday",
    name: words("Good Friday", "Vendredi saint"),
    spans: fromEaster(-2),
  },
  {
    about: words(
      "The resurrection: church bells, eggs and a family feast.",
      "La résurrection : cloches, œufs et repas de famille."
    ),
    countries: [],
    emoji: "🐣",
    group: "christian",
    id: "easter",
    name: words("Easter", "Pâques"),
    spans: fromEaster(0),
  },
  {
    about: words(
      "Jesus rises to heaven, forty days after Easter.",
      "Jésus monte au ciel, quarante jours après Pâques."
    ),
    countries: [],
    emoji: "☁️",
    group: "christian",
    id: "ascension",
    name: words("Ascension Day", "Ascension"),
    spans: fromEaster(39),
  },
  {
    about: words(
      "The Holy Spirit comes down on the apostles, fifty days after Easter.",
      "L’Esprit saint descend sur les apôtres, cinquante jours après Pâques."
    ),
    countries: [],
    emoji: "🕊️",
    group: "christian",
    id: "pentecost",
    name: words("Pentecost", "Pentecôte"),
    spans: fromEaster(49),
  },
  {
    about: words(
      "A day for all the saints, and for flowers on family graves.",
      "Un jour pour tous les saints, et des fleurs sur les tombes de famille."
    ),
    countries: [],
    emoji: "💐",
    group: "christian",
    id: "all-saints",
    name: words("All Saints’ Day", "Toussaint"),
    spans: fixed(11, 1),
  },
  {
    about: words(
      "The birth of Jesus: midnight mass, a tree, presents and a feast.",
      "La naissance de Jésus : messe de minuit, sapin, cadeaux et réveillon."
    ),
    countries: [],
    emoji: "🎄",
    group: "christian",
    id: "christmas",
    name: words("Christmas", "Noël"),
    spans: fixed(12, 25),
  },
  {
    about: words(
      "Christmas by the old calendar, thirteen days later.",
      "Noël selon l’ancien calendrier, treize jours plus tard."
    ),
    countries: ORTHODOX.filter(
      (country) => !["GR", "CY", "BG", "RO", "UA"].includes(country)
    ),
    emoji: "⭐",
    group: "christian",
    id: "orthodox-christmas",
    local: [
      { countries: ["RU", "BY"], name: "Rozhdestvo", script: "Рождество" },
      { countries: ["RS", "ME"], name: "Božić" },
      { countries: ["ET", "ER"], name: "Genna", script: "ገና" },
    ],
    name: words("Orthodox Christmas", "Noël orthodoxe"),
    spans: fixed(1, 7),
  },
  {
    about: words(
      "Easter by the old calendar: red eggs, a midnight service and bread for the feast.",
      "Pâques selon l’ancien calendrier : œufs rouges, office de minuit et pain de fête."
    ),
    countries: ORTHODOX,
    emoji: "🥚",
    group: "christian",
    id: "orthodox-easter",
    local: [
      { countries: ["GR", "CY"], name: "Páscha", script: "Πάσχα" },
      { countries: ["RU", "BY", "UA"], name: "Paskha", script: "Пасха" },
      { countries: ["RO", "MD"], name: "Paști" },
      { countries: ["ET", "ER"], name: "Fasika", script: "ፋሲካ" },
    ],
    name: words("Orthodox Easter", "Pâques orthodoxe"),
    spans: fromEaster(0, 1, true),
  },

  // Latin American
  {
    about: words(
      "Candlemas: tamales in Mexico, and dancers in Puno and Bolivia for the Virgin.",
      "La Chandeleur : tamales au Mexique, et danseurs à Puno et en Bolivie pour la Vierge."
    ),
    countries: ["MX", "PE", "BO"],
    emoji: "🕯️",
    group: "latin-america",
    id: "candelaria",
    name: words("Día de la Candelaria"),
    spans: fixed(2, 2),
  },
  {
    about: words(
      "The days before Lent: parades, samba schools, costumes and music in the streets.",
      "Les jours avant le carême : défilés, écoles de samba, costumes et musique dans les rues."
    ),
    countries: ["BR", "BO", "UY", "AR", "CO", "PA", "DO", "HT", "TT"],
    emoji: "🎭",
    group: "latin-america",
    id: "carnaval",
    name: words("Carnaval"),
    spans: fromEaster(-50, 4),
  },
  {
    about: words(
      "The Inca festival of the Sun at the winter solstice, played out again at Sacsayhuamán.",
      "La fête inca du Soleil au solstice d’hiver, rejouée à Sacsayhuamán."
    ),
    countries: ["PE", "BO", "EC"],
    emoji: "☀️",
    group: "latin-america",
    id: "inti-raymi",
    name: words("Inti Raymi"),
    spans: fixed(6, 24),
  },
  {
    about: words(
      "Saint John’s night, at the heart of June’s festivals: bonfires, square dances and corn.",
      "La nuit de la Saint-Jean, au cœur des fêtes de juin : feux de joie, quadrilles et maïs."
    ),
    countries: ["BR"],
    emoji: "🔥",
    group: "latin-america",
    id: "festa-junina",
    name: words("Festa Junina, São João"),
    spans: fixed(6, 24),
  },
  {
    about: words(
      "Chile’s national days: fondas, empanadas, cueca dancing and kites.",
      "Les fêtes nationales du Chili : fondas, empanadas, cueca et cerfs-volants."
    ),
    countries: ["CL"],
    emoji: "🇨🇱",
    group: "latin-america",
    id: "fiestas-patrias",
    name: words("Fiestas Patrias"),
    spans: fixed(9, 18, 2),
  },
  {
    about: words(
      "The Day of the Dead: altars of marigolds, photos and favourite foods to welcome the dead home.",
      "Le jour des Morts : autels de soucis, photos et plats préférés pour accueillir les défunts."
    ),
    countries: ["MX", "GT", "BO", "EC", "PE", "HN", "SV", "NI", "BR"],
    emoji: "💀",
    group: "latin-america",
    id: "dia-de-muertos",
    local: [
      { countries: ["MX", "HN", "SV", "NI"], name: "Día de los Muertos" },
      { countries: ["GT", "BO", "PE"], name: "Todos Santos" },
      { countries: ["EC"], name: "Día de los Difuntos" },
      { countries: ["BR"], name: "Finados" },
    ],
    name: words("Día de los Muertos"),
    spans: fixed(11, 1, 2),
  },
  {
    about: words(
      "The feast of Our Lady of Guadalupe: pilgrims walk to her basilica, with mariachis at dawn.",
      "La fête de Notre-Dame de Guadalupe : les pèlerins marchent jusqu’à sa basilique, avec des mariachis à l’aube."
    ),
    countries: ["MX"],
    emoji: "🌹",
    group: "latin-america",
    id: "guadalupe",
    name: words("Día de la Virgen de Guadalupe"),
    spans: fixed(12, 12),
  },
  {
    about: words(
      "Nine nights of Mary and Joseph knocking for shelter: songs, candles and a piñata.",
      "Neuf soirs où Marie et Joseph frappent aux portes : chants, bougies et piñata."
    ),
    countries: ["MX", "GT", "HN", "SV", "NI"],
    emoji: "🪅",
    group: "latin-america",
    id: "las-posadas",
    name: words("Las Posadas"),
    spans: fixed(12, 16, 9),
  },

  // Persian and Nowruz
  {
    about: words(
      "The Persian New Year at the spring equinox: a table of seven things starting with S, and visits for thirteen days.",
      "Le Nouvel An persan à l’équinoxe de printemps : une table de sept choses commençant par S, et des visites pendant treize jours."
    ),
    countries: [
      "IR",
      "AF",
      "AZ",
      "KZ",
      "KG",
      "TJ",
      "TM",
      "UZ",
      "IQ",
      "TR",
      "AL",
    ],
    emoji: "🌱",
    group: "nowruz",
    id: "nowruz",
    local: [
      { countries: ["IR", "AF"], name: "Nowruz", script: "نوروز" },
      { countries: ["AZ"], name: "Novruz" },
      { countries: ["KZ"], name: "Nauryz", script: "Наурыз" },
      { countries: ["UZ"], name: "Navroʻz" },
      { countries: ["TJ"], name: "Navrūz", script: "Наврӯз" },
      { countries: ["KG"], name: "Nooruz", script: "Нооруз" },
      { countries: ["IQ", "TR"], name: "Newroz" },
      { countries: ["AL"], name: "Sulltan Nevruzi" },
    ],
    name: words("Nowruz", "Norouz"),
    script: "نوروز",
    spans: persian(1, 1),
  },
  {
    about: words(
      "The eve of the year’s last Wednesday: jumping over bonfires to leave the year’s troubles behind.",
      "La veille du dernier mercredi de l’année : on saute par-dessus des feux pour y laisser les soucis de l’année."
    ),
    countries: ["IR"],
    emoji: "🔥",
    group: "nowruz",
    id: "chaharshanbe-suri",
    name: words("Chaharshanbe Suri", "Tchaharchanbé Souri"),
    script: "چهارشنبه‌سوری",
    spans: (year) =>
      daysOf("persian", year, ["1"], 1).map((nowruz) =>
        spanOf(lastTuesdayBefore(nowruz))
      ),
  },
  {
    about: words(
      "Nature Day, the thirteenth of the New Year: a picnic outdoors, and sprouts thrown into running water.",
      "Le jour de la nature, treizième de l’année : pique-nique dehors, et pousses jetées dans l’eau vive."
    ),
    countries: ["IR"],
    emoji: "🧺",
    group: "nowruz",
    id: "sizdah-bedar",
    name: words("Sizdah Bedar", "Sizdah Bedar"),
    script: "سیزده‌بدر",
    spans: persian(1, 13),
  },
  {
    about: words(
      "The longest night: staying up with pomegranates, watermelon and the poems of Hafez.",
      "La nuit la plus longue : on veille avec grenades, pastèque et poèmes de Hafez."
    ),
    countries: ["IR", "AF", "TJ"],
    emoji: "🍉",
    group: "nowruz",
    id: "yalda",
    local: [
      { countries: ["IR", "TJ"], name: "Shab-e Yalda", script: "شب یلدا" },
      { countries: ["AF"], name: "Shab-e Chelleh", script: "شب چله" },
    ],
    name: words("Shab-e Yalda", "Chab-é Yalda"),
    script: "شب یلدا",
    spans: persian(9, 30),
  },

  // African
  {
    about: words(
      "Ethiopian Christmas: a dawn mass in white, and genna, a hockey-like game.",
      "Le Noël éthiopien : messe à l’aube en blanc, et genna, un jeu proche du hockey."
    ),
    countries: ["ET", "ER"],
    emoji: "🎄",
    group: "africa",
    id: "genna",
    name: words("Genna"),
    script: "ገና",
    spans: ethiopian(4, 29),
  },
  {
    about: words(
      "The Amazigh New Year: a feast of couscous and the first day of the farming year.",
      "Le Nouvel An amazigh : un repas de couscous et le premier jour de l’année agricole."
    ),
    countries: ["DZ", "MA", "LY"],
    emoji: "🌾",
    group: "africa",
    id: "yennayer",
    name: words("Yennayer"),
    note: words(
      "Algeria keeps 12 January; Morocco 14 January.",
      "L’Algérie le fête le 12 janvier ; le Maroc le 14 janvier."
    ),
    script: "ⵢⴻⵏⵏⴰⵢⴻⵔ",
    spans: fixed(1, 12),
  },
  {
    about: words(
      "Epiphany, Ethiopian style: the arks of the churches carried to the water, and a mass baptism.",
      "L’Épiphanie à l’éthiopienne : les arches des églises portées à l’eau, et un grand baptême."
    ),
    countries: ["ET", "ER"],
    emoji: "💧",
    group: "africa",
    id: "timkat",
    name: words("Timkat", "Timkat"),
    script: "ጥምቀት",
    spans: ethiopian(5, 11),
  },
  {
    about: words(
      "Spring’s first breath, the day after Orthodox Easter: picnics, salted fish and coloured eggs.",
      "Le premier souffle du printemps, au lendemain de la Pâque orthodoxe : pique-niques, poisson salé et œufs colorés."
    ),
    countries: ["EG"],
    emoji: "🌸",
    group: "africa",
    id: "sham-el-nessim",
    name: words("Shamm an-Nasīm", "Cham el-Nessim"),
    script: "شم النسيم",
    spans: fromEaster(1, 1, true),
  },
  {
    about: words(
      "The Ethiopian New Year, after the rains: yellow meskel daisies, songs and bonfires.",
      "Le Nouvel An éthiopien, après les pluies : marguerites jaunes, chants et feux de joie."
    ),
    countries: ["ET", "ER"],
    emoji: "🌼",
    group: "africa",
    id: "enkutatash",
    name: words("Enkutatash", "Enkoutatash"),
    script: "እንቁጣጣሽ",
    spans: ethiopian(1, 1),
  },
  {
    about: words(
      "The finding of the True Cross: a great bonfire, the demera, lit at dusk.",
      "L’invention de la Vraie Croix : un grand bûcher, le demera, allumé au crépuscule."
    ),
    countries: ["ET", "ER"],
    emoji: "🔥",
    group: "africa",
    id: "meskel",
    name: words("Meskel", "Meskel"),
    script: "መስቀል",
    spans: ethiopian(1, 17),
  },
  {
    about: words(
      "Seven days of African heritage, a principle a day, with a candle lit for each.",
      "Sept jours d’héritage africain, un principe par jour, avec une bougie allumée pour chacun."
    ),
    countries: ["US"],
    emoji: "🕯️",
    group: "africa",
    id: "kwanzaa",
    name: words("Kwanzaa"),
    spans: fixed(12, 26, 7),
  },

  // The Wheel of the Year
  {
    about: words(
      "The fire festival halfway to spring: Brigid’s crosses and candles for the returning light.",
      "La fête du feu à mi-chemin du printemps : croix de Brigid et bougies pour la lumière qui revient."
    ),
    countries: [],
    emoji: "🕯️",
    group: "wheel",
    id: "imbolc",
    name: words("Imbolc"),
    spans: sabbat("imbolc"),
  },
  {
    about: words(
      "The spring equinox: day and night in balance, eggs and seeds.",
      "L’équinoxe de printemps : le jour et la nuit à égalité, œufs et graines."
    ),
    countries: [],
    emoji: "🌱",
    group: "wheel",
    id: "ostara",
    name: words("Ostara"),
    spans: sabbat("ostara"),
  },
  {
    about: words(
      "May Day’s fire festival: the maypole, flowers and bonfires.",
      "La fête du feu du 1er mai : le mât de mai, des fleurs et des feux de joie."
    ),
    countries: [],
    emoji: "🌸",
    group: "wheel",
    id: "beltane",
    name: words("Beltane"),
    spans: sabbat("beltane"),
  },
  {
    about: words(
      "Midsummer, the longest day: the Sun at its height.",
      "Le solstice d’été, le jour le plus long : le Soleil à son zénith."
    ),
    countries: [],
    emoji: "☀️",
    group: "wheel",
    id: "litha",
    name: words("Litha"),
    spans: sabbat("litha"),
  },
  {
    about: words(
      "The first harvest: the first loaf baked from the new grain.",
      "La première moisson : le premier pain cuit avec le grain nouveau."
    ),
    countries: [],
    emoji: "🍞",
    group: "wheel",
    id: "lughnasadh",
    name: words("Lughnasadh"),
    spans: sabbat("lughnasadh"),
  },
  {
    about: words(
      "The autumn equinox: the second harvest, and thanks given for it.",
      "L’équinoxe d’automne : la deuxième moisson, et merci pour elle."
    ),
    countries: [],
    emoji: "🍎",
    group: "wheel",
    id: "mabon",
    name: words("Mabon"),
    spans: sabbat("mabon"),
  },
  {
    about: words(
      "The witch’s new year, when the veil between the worlds is thinnest.",
      "Le Nouvel An des sorcières, quand le voile entre les mondes est le plus mince."
    ),
    countries: [],
    emoji: "🎃",
    group: "wheel",
    id: "samhain",
    name: words("Samhain"),
    spans: sabbat("samhain"),
  },
  {
    about: words(
      "The longest night, and the Sun’s rebirth: evergreens and the Yule log.",
      "La nuit la plus longue, et la renaissance du Soleil : sapins et bûche de Yule."
    ),
    countries: [],
    emoji: "🌲",
    group: "wheel",
    id: "yule",
    name: words("Yule"),
    spans: sabbat("yule"),
  },
];

/** A festival on its days of one year. */
export interface Occasion {
  festival: Festival;
  start: string;
  end: string;
}

/**
 * The festivals of the chosen groups with a day in a month, in order. A
 * festival that started the year before (Kwanzaa, Hanukkah) still counts.
 */
export const occasionsIn = (
  year: number,
  month: number,
  groups: ReadonlySet<GroupId>
): Occasion[] => {
  const first = keyOf(year, month, 1);
  const last = keyOf(year, month, 31);

  return FESTIVALS.filter((festival) => groups.has(festival.group))
    .flatMap((festival) =>
      [year - 1, year].flatMap((y) =>
        festival.spans(y).map((span) => ({ ...span, festival }))
      )
    )
    .filter(({ start, end }) => start <= last && end >= first)
    .toSorted(
      (a, b) =>
        a.start.localeCompare(b.start) ||
        a.festival.id.localeCompare(b.festival.id)
    );
};
