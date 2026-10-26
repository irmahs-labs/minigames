import { useEffect, useMemo, useState } from "react";

import { BookOfShadowsIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { Link } from "../../lib/router";
import { ChartTab } from "./chart-tab";
import { MoonTab } from "./moon-tab";
import { NumbersTab } from "./numbers-tab";
import {
  EMPTY_PROFILE,
  TABS,
  chartFor,
  loadState,
  readBirth,
  saveState,
} from "./profile";
import type { BookState, Tab } from "./profile";
import { BirthDetails, WitchCard } from "./profile-tab";
import { SabbatsTab } from "./sabbats-tab";
import { SkyTab } from "./sky-tab";
import { localTimeZone, wallTimeAt } from "./time";

const TAB_NAMES: Record<Tab, string> = {
  chart: "Birth chart",
  moon: "Moon",
  numbers: "Numerology",
  profile: "Profile",
  sabbats: "Sabbats",
  sky: "Sky",
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
  const { profile, southern, tab } = state;

  useEffect(() => saveState(state), [state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), REFRESH_MS);

    return () => window.clearInterval(timer);
  }, []);

  const birth = useMemo(
    () => readBirth(profile, timeZone),
    [profile, timeZone]
  );

  const chart = useMemo(() => (birth ? chartFor(birth) : null), [birth]);

  const open = (next: Tab) =>
    setState((current) => ({ ...current, tab: next }));

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

      case "chart": {
        return chart ? (
          <ChartTab chart={chart} />
        ) : (
          <NeedsBirth onOpen={() => open("profile")} />
        );
      }

      case "numbers": {
        return birth ? (
          <NumbersTab birth={birth} name={profile.name} thisYear={thisYear} />
        ) : (
          <NeedsBirth onOpen={() => open("profile")} />
        );
      }

      default: {
        return (
          <div className="layout">
            <WitchCard
              profile={profile}
              birth={birth}
              chart={chart}
              thisYear={thisYear}
            />
            <BirthDetails
              profile={profile}
              onChange={(fields) =>
                setState((current) => ({
                  ...current,
                  profile: { ...current.profile, ...fields },
                }))
              }
              onClear={() =>
                setState((current) => ({
                  ...current,
                  profile: { ...EMPTY_PROFILE },
                }))
              }
            />
          </div>
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
          your moons, sabbats, stars and numbers, in one book
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
