import { memo } from "react";

import { cryptoRandom } from "../../lib/random";
import { daysUntil, nextFestival } from "./buddhist-calendar";
import { FULL_DAY, formatDay, inDays } from "./format";
import { ELEMENT_LORE, cycleName, lunarYearOf, yearName } from "./lunar-zodiac";
import { PHASE_LORE, moonNow, phaseOn } from "./moon";
import { MoonGlyph } from "./moon-glyph";
import { loreFor } from "./retrograde-lore";
import { nextSabbat } from "./sabbats";
import { SignName } from "./sign-name";
import {
  PLANET_GLYPHS,
  eclipsesBetween,
  longitudeOf,
  retrogradesBetween,
} from "./sky";
import { pullDailyCard, todaysCard } from "./tarot";
import type { DailyPull } from "./tarot";
import { TarotBack, TarotFace } from "./tarot-face";
import { DAY, dayKey, daysBetween } from "./time";
import { placementOf } from "./zodiac";

type Sky = ReturnType<typeof workOutSky>;

const workOutSky = (today: string) => {
  const moment = new Date(`${today}T12:00:00Z`);

  const periods = retrogradesBetween(
    moment,
    new Date(moment.getTime() + 60 * DAY)
  );

  return {
    coming: periods.find((period) => period.start.time > moment) ?? null,
    eclipse:
      eclipsesBetween(moment, new Date(moment.getTime() + 90 * DAY))[0] ?? null,
    now: periods.filter(
      (period) => period.start.time <= moment && moment < period.end.time
    ),
  };
};

const skies = new Map<string, Sky>();

/**
 * The sky on a day, at noon UTC: the retrogrades under way, the next one
 * to start within two months, and the next eclipse within three. Worked
 * out once a day, since it takes a moment.
 */
const skyOn = (today: string): Sky => {
  const known = skies.get(today);

  if (known) {
    return known;
  }

  const sky = workOutSky(today);

  skies.set(today, sky);

  return sky;
};

interface TodayProps {
  now: Date;
  timeZone: string;
  southern: boolean;
}

/**
 * Today, at a glance: the Moon, the next sabbat, the lunar year and its
 * next festival, and the sky (where the lights are, what is retrograde,
 * what is coming).
 */
const Today = ({ now, timeZone, southern }: TodayProps) => {
  const today = dayKey(now, timeZone);
  const day = phaseOn(now, timeZone);
  const moon = moonNow(now);
  const sabbat = nextSabbat(today, southern, timeZone);
  const lunar = lunarYearOf(today);
  const festival = nextFestival(today);

  const sky = skyOn(today);

  return (
    <section
      aria-labelledby="today-title"
      className="panel panel--book panel--wide today"
    >
      <span className="legend">today.log</span>
      <h2 id="today-title" className="display book__title">
        Today, {formatDay(today, FULL_DAY)}
      </h2>
      <div className="today__grid">
        <div className="today__item">
          <MoonGlyph angle={moon.angle} size={54} southern={southern} />
          <div className="stack">
            <h3 className="field-label">The Moon</h3>
            <p className="display today__big">{day.phase}</p>
            <p>
              {Math.round(moon.illumination * 100)}% lit, in{" "}
              <SignName longitude={moon.longitude} />.
            </p>
            <p className="today__lore">{PHASE_LORE[day.phase]}</p>
          </div>
        </div>
        {sabbat ? (
          <div className="today__item">
            <span aria-hidden="true" className="today__icon">
              🕯️
            </span>
            <div className="stack">
              <h3 className="field-label">Next sabbat</h3>
              <p className="display today__big">{sabbat.sabbat.name}</p>
              <p>
                {formatDay(sabbat.key, { day: "numeric", month: "long" })},{" "}
                {inDays(daysBetween(today, sabbat.key))}.
              </p>
              <p className="today__lore">{sabbat.sabbat.also}</p>
            </div>
          </div>
        ) : null}
        <div className="today__item">
          <span aria-hidden="true" className="today__icon">
            {lunar.animal.emoji}
          </span>
          <div className="stack">
            <h3 className="field-label">Lunar year</h3>
            <p className="display today__big">{yearName(lunar)}</p>
            <p>
              {cycleName(lunar)}: {lunar.polarity} {lunar.element},{" "}
              {ELEMENT_LORE[lunar.element]}.
            </p>
            {festival ? (
              <p className="today__lore">
                Next festival: {festival.festival.emoji}{" "}
                {festival.festival.name},{" "}
                {formatDay(festival.start, { day: "numeric", month: "long" })},{" "}
                {inDays(daysUntil(festival, today))}.
              </p>
            ) : null}
          </div>
        </div>
        <div className="today__item today__item--sky">
          <span aria-hidden="true" className="today__icon glyph">
            {PLANET_GLYPHS.Sun}
          </span>
          <div className="stack">
            <h3 className="field-label">The sky</h3>
            <p>
              The Sun is in <SignName longitude={longitudeOf("Sun", now)} />,
              the Moon in <SignName longitude={moon.longitude} />.
            </p>
            {sky.now.length === 0 ? (
              <p>No planet is retrograde.</p>
            ) : (
              <ul className="today__list">
                {sky.now.map((period) => (
                  <li key={period.planet}>
                    <strong>
                      <span aria-hidden="true" className="glyph">
                        {PLANET_GLYPHS[period.planet]}
                      </span>{" "}
                      {period.planet} retrograde
                    </strong>{" "}
                    in {placementOf(period.start.longitude).sign.name}, until{" "}
                    {formatDay(dayKey(period.end.time, timeZone))}.{" "}
                    <span className="today__lore">
                      {loreFor(period).join(" ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {sky.coming ? (
              <p>
                Coming: {sky.coming.planet} turns retrograde on{" "}
                {formatDay(dayKey(sky.coming.start.time, timeZone))} in{" "}
                {placementOf(sky.coming.start.longitude).sign.name}.
              </p>
            ) : null}
            {sky.eclipse ? (
              <p>
                Next eclipse: {sky.eclipse.body === "Sun" ? "solar" : "lunar"},{" "}
                {formatDay(dayKey(sky.eclipse.peak, timeZone))}, in{" "}
                {placementOf(sky.eclipse.longitude).sign.name}.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

// Memoized: typing in the birth details re-renders the profile, never today.
export const TodayPanel = memo(Today);

/**
 * The card of the day: face down until it is pulled, then the same card
 * all day. The day turns at midnight in Paris, wherever you are.
 */
export const DailyCard = ({
  now,
  pull,
  onPull,
}: {
  now: Date;
  pull: DailyPull | null;
  onPull: (pull: DailyPull) => void;
}) => {
  const drawn = todaysCard(pull, now);
  const reading = drawn?.reversed ? drawn.card.reversed : drawn?.card.upright;

  return (
    <section
      aria-labelledby="daily-title"
      aria-live="polite"
      className="panel panel--book panel--narrow daily"
    >
      <span className="legend">card-of-the-day.png</span>
      <h2 id="daily-title" className="display book__title">
        Card of the day
      </h2>
      <div className="daily__card">
        {drawn ? (
          <TarotFace card={drawn.card} reversed={drawn.reversed} width={110} />
        ) : (
          <TarotBack width={110} />
        )}
      </div>
      {drawn ? (
        <div className="stack daily__reading">
          <p className="display today__big">
            {drawn.card.name}
            {drawn.reversed ? ", reversed" : ""}
          </p>
          <p className="tarot-side__keywords">{reading?.keywords}</p>
          <p>{reading?.meaning}</p>
          <p className="hint">Your next card comes at midnight, Paris time.</p>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onPull(pullDailyCard(pull, now, cryptoRandom))}
          >
            Pull today’s card
          </button>
          <p className="hint">
            One card a day: no pulling again until tomorrow.
          </p>
        </>
      )}
    </section>
  );
};
