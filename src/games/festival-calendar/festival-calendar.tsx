import { useEffect, useMemo, useState } from "react";

import { FestivalCalendarIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { useCopy, useLanguage } from "../../lib/language";
import type { Language } from "../../lib/language";
import { Link } from "../../lib/router";
import { formatClock, formatDay, formatMonth } from "../book-of-shadows/format";
import { say } from "../book-of-shadows/french";
import { fullMoonName, moonMonth } from "../book-of-shadows/moon";
import type { MoonDay } from "../book-of-shadows/moon";
import { MoonGlyph } from "../book-of-shadows/moon-glyph";
import { PeriodNav } from "../book-of-shadows/period-nav";
import {
  dayKey,
  daysInMonth,
  keyOf,
  localTimeZone,
  wallTimeAt,
  weekdayOf,
} from "../book-of-shadows/time";
import { occasionsIn } from "./festivals";
import type { GroupId, Occasion } from "./festivals";
import {
  CALENDARS,
  flagOf,
  loadCalendars,
  saveCalendars,
  toggleCalendar,
} from "./groups";
import type { CalendarId } from "./groups";

const COPY = {
  en: {
    allGames: "all games",
    around: "Around the world",
    calendars: "Your calendars",
    empty: "Add a calendar to see its days.",
    more: (n: number) => `and ${n} more`,
    nothing: "Nothing in your calendars this month.",
    pick: "Pick the calendars to add; the month shows their days.",
    sub: "moons and festivals from around the world, month by month",
    times: (zone: string) => `Moon times are in your time zone, ${zone}.`,
    to: "to",
    today: " (today)",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  fr: {
    allGames: "tous les jeux",
    around: "Dans le monde entier",
    calendars: "Vos calendriers",
    empty: "Ajoutez un calendrier pour voir ses jours.",
    more: (n: number) => `et ${n} de plus`,
    nothing: "Rien dans vos calendriers ce mois-ci.",
    pick: "Choisissez les calendriers à ajouter ; le mois montre leurs jours.",
    sub: "lunes et fêtes du monde entier, mois par mois",
    times: (zone: string) =>
      `Les heures de la lune sont dans votre fuseau horaire, ${zone}.`,
    to: "au",
    today: " (aujourd’hui)",
    weekdays: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."],
  },
};

/** What to know about a calendar's dates, shown while it is added. */
const NOTES = new Map<CalendarId, Record<Language, string>>([
  [
    "islamic",
    {
      en: "Islamic dates follow Saudi Arabia’s Umm al-Qura calendar; where the new moon must be seen, they can fall a day later.",
      fr: "Les dates islamiques suivent le calendrier Umm al-Qura de l’Arabie saoudite ; là où l’on attend de voir la nouvelle lune, elles peuvent tomber un jour plus tard.",
    },
  ],
  [
    "jewish",
    {
      en: "Jewish festivals begin at sundown the evening before.",
      fr: "Les fêtes juives commencent au coucher du soleil, la veille.",
    },
  ],
  [
    "south-asia",
    {
      en: "Hindu dates are worked out for India from the Sun and the Moon, and can differ by a day from region to region.",
      fr: "Les dates hindoues sont calculées pour l’Inde d’après le Soleil et la Lune, et peuvent varier d’un jour selon la région.",
    },
  ],
]);

/** "Sat 10 Oct". */
const SHORT = { day: "numeric", month: "short", weekday: "short" } as const;

/** How many countries an entry names before folding the rest away. */
const SHOWN_COUNTRIES = 6;

/** How many festival marks a day shows before "+2". */
const SHOWN_MARKS = 3;

const isGroup = (id: CalendarId): id is GroupId => id !== "moon";

const regionNames = new Map<Language, Intl.DisplayNames>();

/** A country's name in the page's language: "KH" → "Cambodia", "Cambodge". */
const countryName = (country: string, language: Language) => {
  let names = regionNames.get(language);

  if (!names) {
    names = new Intl.DisplayNames([language], { type: "region" });
    regionNames.set(language, names);
  }

  return names.of(country) ?? country;
};

const Countries = ({ countries }: { countries: readonly string[] }) => {
  const language = useLanguage();
  const t = useCopy(COPY);

  if (countries.length === 0) {
    return <p className="occasion__countries">🌍 {t.around}</p>;
  }

  const named = countries
    .map((country) => ({ country, name: countryName(country, language) }))
    .toSorted((a, b) => a.name.localeCompare(b.name, language));

  const listed = (list: typeof named) =>
    list.map(({ country, name }) => `${flagOf(country)} ${name}`).join(", ");

  const rest = named.slice(SHOWN_COUNTRIES);

  return rest.length === 0 ? (
    <p className="occasion__countries">{listed(named)}</p>
  ) : (
    <details className="occasion__countries">
      <summary>
        {listed(named.slice(0, SHOWN_COUNTRIES))}, {t.more(rest.length)}
      </summary>
      {listed(rest)}
    </details>
  );
};

const OccasionItem = ({ occasion }: { occasion: Occasion }) => {
  const language = useLanguage();
  const t = useCopy(COPY);
  const { festival, start, end } = occasion;

  return (
    <li className="occasion">
      <span aria-hidden="true" className="occasion__emoji">
        {festival.emoji}
      </span>
      <div className="occasion__body">
        <p className="occasion__when">
          {start === end
            ? formatDay(start, SHORT)
            : `${formatDay(start, SHORT)} ${t.to} ${formatDay(end, SHORT)}`}
        </p>
        <h3 className="display occasion__name">
          {festival.name[language]}
          {festival.script ? (
            <span className="occasion__script"> {festival.script}</span>
          ) : null}
        </h3>
        <p className="occasion__about">{festival.about[language]}</p>
        {festival.local ? (
          <ul className="occasion__local">
            {festival.local.map((local) => (
              <li key={local.name}>
                <span aria-hidden="true">
                  {local.countries.map(flagOf).join("")}{" "}
                </span>
                <span className="sr-only">
                  {local.countries
                    .map((country) => countryName(country, language))
                    .join(", ")}
                  :{" "}
                </span>
                <strong>{local.name}</strong>
                {local.script ? ` ${local.script}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
        <Countries countries={festival.countries} />
        {festival.note ? (
          <p className="hint">{festival.note[language]}</p>
        ) : null}
      </div>
    </li>
  );
};

interface MonthProps {
  year: number;
  month: number;
  today: string;
  timeZone: string;
  moons: readonly MoonDay[] | null;
  occasions: readonly Occasion[];
}

/** The month's grid: each day with its moon and the marks of its festivals. */
const MonthGrid = ({
  year,
  month,
  today,
  moons,
  occasions,
}: Omit<MonthProps, "timeZone">) => {
  const language = useLanguage();
  const t = useCopy(COPY);
  const length = daysInMonth(year, month);
  // Monday is 0: how many blank cells come before the 1st.
  const lead = (weekdayOf(keyOf(year, month, 1)) + 6) % 7;

  return (
    <ol className="moon-cal">
      {t.weekdays.map((weekday) => (
        <li key={weekday} aria-hidden="true" className="moon-cal__weekday">
          {weekday}
        </li>
      ))}
      {Array.from({ length }, (_, i) => {
        const key = keyOf(year, month, i + 1);
        const moon = moons?.[i];

        const marks = occasions.filter(
          ({ start, end }) => start <= key && key <= end
        );

        const extra = marks.length - SHOWN_MARKS;

        return (
          <li
            key={key}
            className={[
              "moon-cal__day",
              moon?.exact ? "moon-cal__day--exact" : "",
              key === today ? "moon-cal__day--today" : "",
            ].join(" ")}
            style={i === 0 ? { gridColumnStart: lead + 1 } : undefined}
          >
            <span className="moon-cal__num">
              {i + 1}
              {key === today ? (
                <span className="sr-only">{t.today}</span>
              ) : null}
            </span>
            {moon ? (
              <>
                <MoonGlyph angle={moon.angle} size={22} />
                <span className={moon.exact ? "moon-cal__phase" : "sr-only"}>
                  {say(moon.phase)}
                </span>
              </>
            ) : null}
            {marks.length > 0 ? (
              <span className="cal-marks">
                <span aria-hidden="true">
                  {marks
                    .slice(0, SHOWN_MARKS)
                    .map((mark) => mark.festival.emoji)
                    .join("")}
                  {extra > 0 ? <small>+{extra}</small> : null}
                </span>
                <span className="sr-only">
                  {marks.map((mark) => mark.festival.name[language]).join(", ")}
                </span>
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};

/** The Festival Calendar: a month of moons and the festivals of the calendars added. */
const FestivalCalendar = ({ name }: GameProps) => {
  const t = useCopy(COPY);
  const language = useLanguage();
  const [chosen, setChosen] = useState<CalendarId[]>(loadCalendars);
  const timeZone = useMemo(() => localTimeZone(), []);
  const [now, setNow] = useState(() => new Date());

  // Once a minute, so today moves on at midnight.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const current = wallTimeAt(now, timeZone);
  const today = dayKey(now, timeZone);

  const [shown, setShown] = useState({
    month: current.month,
    year: current.year,
  });

  const groups = useMemo(() => new Set(chosen.filter(isGroup)), [chosen]);
  const withMoon = chosen.includes("moon");

  const occasions = useMemo(
    () => occasionsIn(shown.year, shown.month, groups),
    [shown, groups]
  );

  const moons = useMemo(
    () => (withMoon ? moonMonth(shown.year, shown.month, timeZone) : null),
    [withMoon, shown, timeZone]
  );

  const phases = moons?.filter((day) => day.exact) ?? [];
  const notes = chosen.flatMap((id) => NOTES.get(id)?.[language] ?? []);

  const toggle = (id: CalendarId) => {
    const next = toggleCalendar(chosen, id);

    setChosen(next);
    saveCalendars(next);
  };

  const step = (by: number) =>
    setShown(({ year, month }) => {
      const index = year * 12 + (month - 1) + by;

      return { month: (index % 12) + 1, year: Math.floor(index / 12) };
    });

  return (
    <>
      <Header
        icon={<FestivalCalendarIcon />}
        name={name}
        href="/festival-calendar"
      >
        <Link href="/" className="btn">
          <Icon name="back" size={16} />
          {t.allGames}
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub">{t.sub}</p>

        <div className="layout">
          <section
            aria-labelledby="calendars-title"
            className="panel panel--narrow cal-panel"
          >
            <span className="legend">calendars.ics</span>
            <h2 id="calendars-title" className="field-label">
              {t.calendars}
            </h2>
            <p className="hint">{t.pick}</p>
            <ul className="cal-kinds">
              {CALENDARS.map((calendar) => (
                <li key={calendar.id}>
                  <button
                    type="button"
                    className="chip cal-kind"
                    aria-pressed={chosen.includes(calendar.id)}
                    onClick={() => toggle(calendar.id)}
                  >
                    <span aria-hidden="true">{calendar.emoji}</span>
                    {calendar.name[language]}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="month-title"
            className="panel panel--wide cal-panel"
          >
            <span className="legend">month.cal</span>
            <PeriodNav
              id="month-title"
              unit="month"
              title={formatMonth(shown.year, shown.month)}
              atCurrent={
                shown.year === current.year && shown.month === current.month
              }
              onStep={step}
              onCurrent={() =>
                setShown({ month: current.month, year: current.year })
              }
            />

            <MonthGrid
              year={shown.year}
              month={shown.month}
              today={today}
              moons={moons}
              occasions={occasions}
            />

            {phases.length > 0 ? (
              <ul className="phase-list">
                {phases.map((day) => (
                  <li key={day.key}>
                    <MoonGlyph angle={day.angle} size={20} />
                    <span>
                      <strong>
                        {say(
                          day.phase === "Full Moon" && day.exact
                            ? fullMoonName(day.exact, timeZone)
                            : day.phase
                        )}
                      </strong>{" "}
                      {formatDay(day.key, SHORT)}
                      {day.exact ? `, ${formatClock(day.exact, timeZone)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {occasions.length > 0 ? (
              <ul className="occasions">
                {occasions.map((occasion) => (
                  <OccasionItem
                    key={`${occasion.festival.id}|${occasion.start}`}
                    occasion={occasion}
                  />
                ))}
              </ul>
            ) : (
              <p className="hint">
                {chosen.length === 0 ? t.empty : t.nothing}
              </p>
            )}

            {withMoon ? <p className="hint">{t.times(timeZone)}</p> : null}
            {notes.map((note) => (
              <p key={note} className="hint">
                {note}
              </p>
            ))}
          </section>
        </div>
      </main>
    </>
  );
};

export default FestivalCalendar;
