import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { BookOfShadowsIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { useLanguage } from "../../lib/language";
import { Link } from "../../lib/router";
import { ChartTab } from "./chart-tab";
import { chartMatch, lunarMatch, numbersMatch } from "./compat";
import { MatchPanel, MatchSummary, NoMatch, firstNameOf } from "./compat-panel";
import { EightBallTab } from "./eight-ball-tab";
import { tr } from "./french";
import { lunarYearOf } from "./lunar-zodiac";
import { LunarZodiacTab } from "./lunar-zodiac-tab";
import { MoonTab } from "./moon-tab";
import { NeedsBirth } from "./needs-birth";
import { NumbersTab } from "./numbers-tab";
import {
  EMPTY_PROFILE,
  TABS,
  birthNumbers,
  chartFor,
  loadState,
  readBirth,
  saveState,
} from "./profile";
import type { BookState, Profile, Tab } from "./profile";
import { BirthDetails, WitchCard } from "./profile-tab";
import { SabbatsTab } from "./sabbats-tab";
import { SkyTab } from "./sky-tab";
import { TarotTab } from "./tarot-tab";
import { localTimeZone, wallTimeAt } from "./time";
import { DailyCard, TodayPanel } from "./today-panel";

const TAB_NAMES = {
  en: {
    chart: "Birth chart",
    "eight-ball": "Magic 8 Ball",
    "lunar-zodiac": "Lunar Zodiac",
    moon: "Moon",
    numbers: "Numerology",
    profile: "Profile",
    sabbats: "Sabbats",
    sky: "Sky",
    tarot: "Tarot",
  },
  fr: {
    chart: "Thème astral",
    "eight-ball": "Boule magique",
    "lunar-zodiac": "Zodiaque lunaire",
    moon: "Lune",
    numbers: "Numérologie",
    profile: "Profil",
    sabbats: "Sabbats",
    sky: "Ciel",
    tarot: "Tarot",
  },
} satisfies Record<"en" | "fr", Record<Tab, string>>;

/** How often "now" moves on. */
const REFRESH_MS = 10 * 60_000;

/** The pages that compare you with someone else, and how they name it. */
const MATCHES = {
  chart: {
    label: ["Birth chart", "Thème astral"],
    legend: "chart-match.csv",
    title: ["Your charts, side by side", "Vos thèmes, côte à côte"],
  },
  "lunar-zodiac": {
    label: ["Lunar Zodiac", "Zodiaque lunaire"],
    legend: "animals-match.csv",
    title: ["Your animals together", "Vos animaux ensemble"],
  },
  numbers: {
    label: ["Numerology", "Numérologie"],
    legend: "numbers-match.csv",
    title: ["Your numbers together", "Vos nombres ensemble"],
  },
} as const;

type MatchTab = keyof typeof MATCHES;

const MATCH_TABS: readonly MatchTab[] = ["chart", "numbers", "lunar-zodiac"];

const BookOfShadows = ({ name }: GameProps) => {
  const [state, setState] = useState<BookState>(loadState);
  // Every line of the book reads the page's language as it renders.
  const language = useLanguage();
  const french = language === "fr";
  // Every "today" in the book is this moment, moved on now and then so a
  // book left open past midnight turns the page.
  const [now, setNow] = useState(() => new Date());
  const timeZone = localTimeZone();
  const thisYear = wallTimeAt(now, timeZone).year;
  const { profile, partner, southern, tab } = state;

  useEffect(() => saveState(state), [state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), REFRESH_MS);

    return () => window.clearInterval(timer);
  }, []);

  const birth = useMemo(
    () => readBirth(profile, timeZone),
    [profile, timeZone]
  );

  const theirBirth = useMemo(
    () => readBirth(partner, timeZone),
    [partner, timeZone]
  );

  const chart = useMemo(() => (birth ? chartFor(birth) : null), [birth]);

  const theirChart = useMemo(
    () => (theirBirth ? chartFor(theirBirth) : null),
    [theirBirth]
  );

  const theirName = firstNameOf(partner.name);

  // How you match someone else, three ways, once both have a birth date.
  const matches = useMemo(() => {
    if (!birth || !chart || !theirBirth || !theirChart) {
      return null;
    }

    return {
      chart: chartMatch(chart, theirChart, theirName, french),
      "lunar-zodiac": lunarMatch(
        lunarYearOf(birth.day),
        lunarYearOf(theirBirth.day),
        french
      ),
      numbers: numbersMatch(
        birthNumbers(birth, profile.name, thisYear),
        birthNumbers(theirBirth, partner.name, thisYear),
        theirName,
        french
      ),
    };
  }, [
    birth,
    chart,
    theirBirth,
    theirChart,
    theirName,
    profile.name,
    partner.name,
    thisYear,
    french,
  ]);

  const open = (next: Tab) =>
    setState((current) => ({ ...current, tab: next }));

  const editor = (key: "profile" | "partner") => (fields: Partial<Profile>) =>
    setState((current) => ({
      ...current,
      [key]: { ...current[key], ...fields },
    }));

  const clearer = (key: "profile" | "partner") => () =>
    setState((current) => ({ ...current, [key]: { ...EMPTY_PROFILE } }));

  /** A page of yours, and how you match the other person on it. */
  const withMatch = (page: MatchTab, reading: ReactNode) => (
    <>
      {reading}
      {matches ? (
        <MatchPanel
          legend={MATCHES[page].legend}
          title={tr(MATCHES[page].title[0], MATCHES[page].title[1])}
          match={matches[page]}
          name={theirName}
        />
      ) : (
        <NoMatch onOpen={() => open("profile")} />
      )}
    </>
  );

  const panel = () => {
    switch (tab) {
      case "moon": {
        return <MoonTab now={now} timeZone={timeZone} southern={southern} />;
      }

      case "sabbats": {
        return (
          <SabbatsTab
            now={now}
            timeZone={timeZone}
            southern={southern}
            onSouthern={(on) =>
              setState((current) => ({ ...current, southern: on }))
            }
          />
        );
      }

      case "sky": {
        return <SkyTab now={now} timeZone={timeZone} />;
      }

      case "tarot": {
        return <TarotTab />;
      }

      case "eight-ball": {
        return <EightBallTab />;
      }

      case "chart": {
        return chart ? (
          withMatch("chart", <ChartTab chart={chart} />)
        ) : (
          <NeedsBirth onOpen={() => open("profile")} />
        );
      }

      case "numbers": {
        return birth ? (
          withMatch(
            "numbers",
            <NumbersTab birth={birth} name={profile.name} thisYear={thisYear} />
          )
        ) : (
          <NeedsBirth onOpen={() => open("profile")} />
        );
      }

      case "lunar-zodiac": {
        const page = (
          <LunarZodiacTab
            birth={birth}
            birthTime={profile.birthTime}
            now={now}
            timeZone={timeZone}
            onOpenProfile={() => open("profile")}
          />
        );

        return birth ? withMatch("lunar-zodiac", page) : page;
      }

      default: {
        return (
          <>
            <div className="layout">
              <TodayPanel
                now={now}
                timeZone={timeZone}
                southern={southern}
                language={language}
              />
              <DailyCard
                now={now}
                pull={state.dailyCard}
                onPull={(pull) =>
                  setState((current) => ({ ...current, dailyCard: pull }))
                }
              />
            </div>
            <BirthDetails
              who="you"
              profile={profile}
              onChange={editor("profile")}
              onClear={clearer("profile")}
            />
            <WitchCard
              who="you"
              profile={profile}
              birth={birth}
              chart={chart}
              thisYear={thisYear}
            />
            <MatchSummary
              name={theirName}
              rows={
                matches &&
                MATCH_TABS.map((entry) => ({
                  label: tr(MATCHES[entry].label[0], MATCHES[entry].label[1]),
                  match: matches[entry],
                  onOpen: () => open(entry),
                }))
              }
            />
            <BirthDetails
              who="partner"
              profile={partner}
              onChange={editor("partner")}
              onClear={clearer("partner")}
            />
            <WitchCard
              who="partner"
              profile={partner}
              birth={theirBirth}
              chart={theirChart}
              thisYear={thisYear}
            />
          </>
        );
      }
    }
  };

  return (
    <>
      <Header icon={<BookOfShadowsIcon />} name={name} href="/book-of-shadows">
        <Link href="/" className="btn">
          <Icon name="back" size={16} />
          {tr("all games", "tous les jeux")}
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub">
          {tr(
            "your moons, sabbats, stars, numbers and cards, in one book",
            "vos lunes, sabbats, étoiles, nombres et cartes, dans un seul livre"
          )}
        </p>

        <nav
          aria-label={tr("Pages of the book", "Pages du livre")}
          className="picker picker--scroll"
        >
          {TABS.map((entry) => (
            <button
              key={entry}
              type="button"
              className="picker__option"
              aria-pressed={entry === tab}
              onClick={() => open(entry)}
            >
              {TAB_NAMES[language][entry]}
            </button>
          ))}
        </nav>

        {panel()}
      </main>
    </>
  );
};

export default BookOfShadows;
