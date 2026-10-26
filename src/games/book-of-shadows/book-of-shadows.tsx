import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { BookOfShadowsIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { Link } from "../../lib/router";
import { ChartTab } from "./chart-tab";
import { chartMatch, lunarMatch, numbersMatch } from "./compat";
import { MatchPanel, MatchSummary, NoMatch, firstNameOf } from "./compat-panel";
import { EightBallTab } from "./eight-ball-tab";
import { lunarYearOf } from "./lunar-zodiac";
import { LunarZodiacTab } from "./lunar-zodiac-tab";
import { MoonTab } from "./moon-tab";
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

const TAB_NAMES: Record<Tab, string> = {
  chart: "Birth chart",
  "eight-ball": "Magic 8 Ball",
  "lunar-zodiac": "Lunar Zodiac",
  moon: "Moon",
  numbers: "Numerology",
  profile: "Profile",
  sabbats: "Sabbats",
  sky: "Sky",
  tarot: "Tarot",
};

/** How often "now" moves on. */
const REFRESH_MS = 10 * 60_000;

/** What a tab that needs a birth date shows without one. */
const NeedsBirth = ({ onOpen }: { onOpen: () => void }) => (
  <section className="panel panel--book empty">
    <span className="legend">locked.txt</span>
    <h2 className="display page__title">This page is still blank</h2>
    <p className="page__sub">It needs your birth date, on your profile.</p>
    <button type="button" className="btn btn--primary" onClick={onOpen}>
      Fill in your profile
    </button>
  </section>
);

const BookOfShadows = ({ name }: GameProps) => {
  const [state, setState] = useState<BookState>(loadState);
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
  const withMatch = (page: ReactNode, match: ReactNode) => (
    <>
      {page}
      {theirBirth ? match : <NoMatch onOpen={() => open("profile")} />}
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
          withMatch(
            <ChartTab chart={chart} />,
            theirChart ? (
              <MatchPanel
                legend="chart-match.csv"
                title="Your charts, side by side"
                match={chartMatch(chart, theirChart, theirName)}
                name={theirName}
              />
            ) : null
          )
        ) : (
          <NeedsBirth onOpen={() => open("profile")} />
        );
      }

      case "numbers": {
        return birth ? (
          withMatch(
            <NumbersTab
              birth={birth}
              name={profile.name}
              thisYear={thisYear}
            />,
            theirBirth ? (
              <MatchPanel
                legend="numbers-match.csv"
                title="Your numbers together"
                match={numbersMatch(
                  birthNumbers(birth, profile.name, thisYear),
                  birthNumbers(theirBirth, partner.name, thisYear),
                  theirName
                )}
                name={theirName}
              />
            ) : null
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

        return birth
          ? withMatch(
              page,
              theirBirth ? (
                <MatchPanel
                  legend="animals-match.csv"
                  title="Your animals together"
                  match={lunarMatch(
                    lunarYearOf(birth.day),
                    lunarYearOf(theirBirth.day)
                  )}
                  name={theirName}
                />
              ) : null
            )
          : page;
      }

      default: {
        return (
          <>
            <div className="layout">
              <TodayPanel now={now} timeZone={timeZone} southern={southern} />
              <DailyCard
                now={now}
                pull={state.dailyCard}
                onPull={(pull) =>
                  setState((current) => ({ ...current, dailyCard: pull }))
                }
              />
            </div>
            <div className="layout">
              <WitchCard
                profile={profile}
                birth={birth}
                chart={chart}
                thisYear={thisYear}
              />
              <BirthDetails
                who="you"
                profile={profile}
                onChange={editor("profile")}
                onClear={clearer("profile")}
              />
            </div>
            <div className="layout">
              <MatchSummary
                name={theirName}
                rows={
                  birth && theirBirth
                    ? [
                        {
                          label: "Birth chart",
                          match:
                            chart && theirChart
                              ? chartMatch(chart, theirChart, theirName)
                              : null,
                          onOpen: () => open("chart"),
                        },
                        {
                          label: "Numerology",
                          match: numbersMatch(
                            birthNumbers(birth, profile.name, thisYear),
                            birthNumbers(theirBirth, partner.name, thisYear),
                            theirName
                          ),
                          onOpen: () => open("numbers"),
                        },
                        {
                          label: "Lunar Zodiac",
                          match: lunarMatch(
                            lunarYearOf(birth.day),
                            lunarYearOf(theirBirth.day)
                          ),
                          onOpen: () => open("lunar-zodiac"),
                        },
                      ]
                    : null
                }
              />
              <BirthDetails
                who="partner"
                profile={partner}
                onChange={editor("partner")}
                onClear={clearer("partner")}
              />
            </div>
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
          all games
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub">
          your moons, sabbats, stars, numbers and cards, in one book
        </p>

        <nav aria-label="Pages of the book" className="picker picker--scroll">
          {TABS.map((entry) => (
            <button
              key={entry}
              type="button"
              className="picker__option"
              aria-pressed={entry === tab}
              onClick={() => open(entry)}
            >
              {TAB_NAMES[entry]}
            </button>
          ))}
        </nav>

        {panel()}
      </main>
    </>
  );
};

export default BookOfShadows;
