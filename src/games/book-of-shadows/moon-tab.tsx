import { useMemo, useState } from "react";

import {
  formatClock,
  formatDay,
  formatMoment,
  formatMonth,
  inDays,
} from "./format";
import {
  PHASE_LORE,
  fullMoonName,
  moonMonth,
  moonNow,
  phaseOn,
  quartersBetween,
} from "./moon";
import { MoonGlyph } from "./moon-glyph";
import { dayKey, daysBetween, keyOf, wallTimeAt, weekdayOf } from "./time";
import { placementOf } from "./zodiac";

interface MoonTabProps {
  now: Date;
  timeZone: string;
  southern: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY = 86_400_000;

/** Tonight's Moon: its phase, its sign, and the next new and full moons. */
const Tonight = ({ now, timeZone, southern }: MoonTabProps) => {
  const today = dayKey(now, timeZone);
  const day = phaseOn(now, timeZone);
  const moon = moonNow(now);
  const { sign } = placementOf(moon.longitude);
  const ahead = quartersBetween(now, new Date(now.getTime() + 31 * DAY));
  const nextFull = ahead.find((quarter) => quarter.phase === "Full Moon");
  const nextNew = ahead.find((quarter) => quarter.phase === "New Moon");

  return (
    <section
      aria-labelledby="tonight-title"
      className="panel panel--book panel--narrow tonight"
    >
      <span className="legend">tonight.log</span>
      <MoonGlyph angle={moon.angle} size={150} southern={southern} />
      <h2 id="tonight-title" className="display page__title">
        {day.phase}
      </h2>
      <p className="tonight__stats">
        {Math.round(moon.illumination * 100)}% lit · day{" "}
        {Math.floor(moon.age) + 1} of 29.5 · in{" "}
        <span aria-hidden="true">{sign.glyph} </span>
        {sign.name}
      </p>
      <p className="tonight__lore">{PHASE_LORE[day.phase]}</p>

      <dl className="facts">
        {nextFull ? (
          <div>
            <dt>Next full moon</dt>
            <dd>
              {fullMoonName(nextFull.time, timeZone)},{" "}
              {formatMoment(nextFull.time, timeZone)} (
              {inDays(daysBetween(today, dayKey(nextFull.time, timeZone)))})
            </dd>
          </div>
        ) : null}
        {nextNew ? (
          <div>
            <dt>Next new moon</dt>
            <dd>
              {formatMoment(nextNew.time, timeZone)} (
              {inDays(daysBetween(today, dayKey(nextNew.time, timeZone)))})
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Moon in {sign.name}</dt>
          <dd>Feelings run {sign.keywords}.</dd>
        </div>
      </dl>
    </section>
  );
};

/** A month of moons, Monday first, with the exact phases picked out. */
const MoonCalendar = ({ now, timeZone, southern }: MoonTabProps) => {
  const current = wallTimeAt(now, timeZone);

  const [shown, setShown] = useState({
    month: current.month,
    year: current.year,
  });

  const today = dayKey(now, timeZone);

  const days = useMemo(
    () => moonMonth(shown.year, shown.month, timeZone),
    [shown, timeZone]
  );

  // Monday is 0: how many blank cells come before the 1st.
  const lead = (weekdayOf(keyOf(shown.year, shown.month, 1)) + 6) % 7;
  const exact = days.filter((day) => day.exact);

  const step = (by: number) =>
    setShown(({ year, month }) => {
      const index = year * 12 + (month - 1) + by;

      return { month: (index % 12) + 1, year: Math.floor(index / 12) };
    });

  return (
    <section
      aria-labelledby="calendar-title"
      className="panel panel--book panel--wide"
    >
      <span className="legend">moon-calendar.ics</span>
      <div className="month-nav">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous month"
          onClick={() => step(-1)}
        >
          ‹
        </button>
        <h2
          id="calendar-title"
          className="display book__title"
          aria-live="polite"
        >
          {formatMonth(shown.year, shown.month)}
        </h2>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next month"
          onClick={() => step(1)}
        >
          ›
        </button>
        {shown.year === current.year && shown.month === current.month ? null : (
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() =>
              setShown({ month: current.month, year: current.year })
            }
          >
            This month
          </button>
        )}
      </div>

      <ol className="moon-cal">
        {WEEKDAYS.map((weekday) => (
          <li key={weekday} aria-hidden="true" className="moon-cal__weekday">
            {weekday}
          </li>
        ))}
        {days.map((day, i) => (
          <li
            key={day.key}
            className={[
              "moon-cal__day",
              day.exact ? "moon-cal__day--exact" : "",
              day.key === today ? "moon-cal__day--today" : "",
            ].join(" ")}
            style={i === 0 ? { gridColumnStart: lead + 1 } : undefined}
          >
            <span className="moon-cal__num">
              {day.day}
              {day.key === today ? (
                <span className="sr-only"> (today)</span>
              ) : null}
            </span>
            <MoonGlyph angle={day.angle} size={26} southern={southern} />
            <span className={day.exact ? "moon-cal__phase" : "sr-only"}>
              {day.phase}
            </span>
          </li>
        ))}
      </ol>

      <ul className="phase-list">
        {exact.map((day) => (
          <li key={day.key}>
            <MoonGlyph angle={day.angle} size={20} southern={southern} />
            <span>
              <strong>
                {day.phase === "Full Moon" && day.exact
                  ? fullMoonName(day.exact, timeZone)
                  : day.phase}
              </strong>{" "}
              {formatDay(day.key, {
                day: "numeric",
                month: "short",
                weekday: "short",
              })}
              {day.exact ? `, ${formatClock(day.exact, timeZone)}` : ""}
            </span>
          </li>
        ))}
      </ul>
      <p className="hint">Times are in your time zone, {timeZone}.</p>
    </section>
  );
};

export const MoonTab = (props: MoonTabProps) => (
  <div className="layout">
    <Tonight {...props} />
    <MoonCalendar {...props} />
  </div>
);
