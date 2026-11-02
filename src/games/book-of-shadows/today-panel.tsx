import { memo } from "react";

import { cryptoRandom } from "../../lib/random";
import { daysUntil, nextFestival } from "./buddhist-calendar";
import { FULL_DAY, formatDay, inDays } from "./format";
import { say, tr } from "./french";
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

/** Ends with a full stop, unless the date already does: "12 déc.". */
const sentence = (text: string) => (text.endsWith(".") ? text : `${text}.`);

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
  /** The page's language, so the memoized panel turns with it. */
  language: string;
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
        {tr("Today", "Aujourd’hui")}, {formatDay(today, FULL_DAY)}
      </h2>
      <div className="today__grid">
        <div className="today__item">
          <MoonGlyph angle={moon.angle} size={54} southern={southern} />
          <div className="stack">
            <h3 className="field-label">{tr("The Moon", "La Lune")}</h3>
            <p className="display today__big">{say(day.phase)}</p>
            <p>
              {tr(
                `${Math.round(moon.illumination * 100)}% lit, in`,
                `Éclairée à ${Math.round(moon.illumination * 100)} %, en`
              )}{" "}
              <SignName longitude={moon.longitude} />.
            </p>
            <p className="today__lore">{say(PHASE_LORE[day.phase])}</p>
          </div>
        </div>
        {sabbat ? (
          <div className="today__item">
            <span aria-hidden="true" className="today__icon">
              🕯️
            </span>
            <div className="stack">
              <h3 className="field-label">
                {tr("Next sabbat", "Prochain sabbat")}
              </h3>
              <p className="display today__big">{say(sabbat.sabbat.name)}</p>
              <p>
                {formatDay(sabbat.key, { day: "numeric", month: "long" })},{" "}
                {inDays(daysBetween(today, sabbat.key))}.
              </p>
              <p className="today__lore">{say(sabbat.sabbat.also)}</p>
            </div>
          </div>
        ) : null}
        <div className="today__item">
          <span aria-hidden="true" className="today__icon">
            {lunar.animal.emoji}
          </span>
          <div className="stack">
            <h3 className="field-label">{tr("Lunar year", "Année lunaire")}</h3>
            <p className="display today__big">{yearName(lunar)}</p>
            <p>
              {cycleName(lunar)}
              {tr(": ", " : ")}
              {lunar.polarity} {say(lunar.element)},{" "}
              {say(ELEMENT_LORE[lunar.element])}.
            </p>
            {festival ? (
              <p className="today__lore">
                {tr("Next festival: ", "Prochaine fête : ")}
                {festival.festival.emoji} {say(festival.festival.name)},{" "}
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
            <h3 className="field-label">{tr("The sky", "Le ciel")}</h3>
            <p>
              {tr("The Sun is in", "Le Soleil est en")}{" "}
              <SignName longitude={longitudeOf("Sun", now)} />,{" "}
              {tr("the Moon in", "la Lune en")}{" "}
              <SignName longitude={moon.longitude} />.
            </p>
            {sky.now.length === 0 ? (
              <p>
                {tr(
                  "No planet is retrograde.",
                  "Aucune planète n’est rétrograde."
                )}
              </p>
            ) : (
              <ul className="today__list">
                {sky.now.map((period) => (
                  <li key={period.planet}>
                    <strong>
                      <span aria-hidden="true" className="glyph">
                        {PLANET_GLYPHS[period.planet]}
                      </span>{" "}
                      {tr(
                        `${period.planet} retrograde`,
                        `${say(period.planet)} rétrograde`
                      )}
                    </strong>{" "}
                    {tr("in", "en")}{" "}
                    {say(placementOf(period.start.longitude).sign.name)},{" "}
                    {tr("until", "jusqu’au")}{" "}
                    {sentence(formatDay(dayKey(period.end.time, timeZone)))}{" "}
                    <span className="today__lore">
                      {loreFor(period).map(say).join(" ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {sky.coming ? (
              <p>
                {tr(
                  `Coming: ${sky.coming.planet} turns retrograde on`,
                  `À venir : ${say(sky.coming.planet)} devient rétrograde le`
                )}{" "}
                {formatDay(dayKey(sky.coming.start.time, timeZone))}{" "}
                {tr("in", "en")}{" "}
                {say(placementOf(sky.coming.start.longitude).sign.name)}.
              </p>
            ) : null}
            {sky.eclipse ? (
              <p>
                {tr("Next eclipse: ", "Prochaine éclipse : ")}
                {sky.eclipse.body === "Sun"
                  ? tr("solar", "solaire")
                  : tr("lunar", "lunaire")}
                , {formatDay(dayKey(sky.eclipse.peak, timeZone))},{" "}
                {tr("in", "en")}{" "}
                {say(placementOf(sky.eclipse.longitude).sign.name)}.
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
        {tr("Card of the day", "Carte du jour")}
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
            {say(drawn.card.name)}
            {drawn.reversed ? tr(", reversed", ", renversée") : ""}
          </p>
          <p className="tarot-side__keywords">
            {reading ? say(reading.keywords) : null}
          </p>
          <p>{reading ? say(reading.meaning) : null}</p>
          <p className="hint">
            {tr(
              "Your next card comes at midnight, Paris time.",
              "Votre prochaine carte arrive à minuit, heure de Paris."
            )}
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onPull(pullDailyCard(pull, now, cryptoRandom))}
          >
            {tr("Pull today’s card", "Tirer la carte du jour")}
          </button>
          <p className="hint">
            {tr(
              "One card a day: no pulling again until tomorrow.",
              "Une carte par jour : pas de nouveau tirage avant demain."
            )}
          </p>
        </>
      )}
    </section>
  );
};
