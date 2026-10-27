import { daysUntil, festivalsFrom } from "./festivals";
import type { FestivalDays } from "./festivals";
import { FULL_DAY, formatDay, inDays } from "./format";

/** "Monday, 23 November", or "Monday, 23 November to Wednesday, 25 November". */
const festivalDays = ({ start, end }: FestivalDays): string =>
  start === end
    ? formatDay(start, FULL_DAY)
    : `${formatDay(start, FULL_DAY)} to ${formatDay(end, FULL_DAY)}`;

/** The lunar festivals of the year ahead, each with its sisters elsewhere. */
export const FestivalsPanel = ({ today }: { today: string }) => {
  const coming = festivalsFrom(today);

  return (
    <section
      aria-labelledby="festivals-title"
      className="panel panel--book panel--wide"
    >
      <span className="legend">festivals.csv</span>
      <p className="kicker">The year ahead</p>
      <h2 id="festivals-title" className="display book__title">
        Lunar festivals
      </h2>
      <ol className="sabbats">
        {coming.map((entry, i) => {
          const { festival } = entry;

          return (
            <li
              key={festival.id}
              className={i === 0 ? "sabbat sabbat--next" : "sabbat"}
            >
              <p className="sabbat__when">
                {festivalDays(entry)}
                {i === 0 ? (
                  <span className="badge">
                    {inDays(daysUntil(entry, today))}
                  </span>
                ) : null}
              </p>
              <h3 className="display sabbat__name">
                <span aria-hidden="true">{festival.emoji}</span> {festival.name}
              </h3>
              <p className="sabbat__also">In Cambodia: {festival.khmer}.</p>
              <p>{festival.about}</p>
              <p className="sabbat__also">
                <strong>Also:</strong> {festival.sisters}.
              </p>
            </li>
          );
        })}
      </ol>
      <p className="hint">
        The Lunar New Year keeps the Chinese calendar; the rest keep the
        Buddhist lunar calendar Cambodia shares with Thailand, Laos, Myanmar and
        Sri Lanka. Dates are Cambodia’s, from the Khmer calendar; its neighbours
        keep the same full moons, at times a day apart.
      </p>
    </section>
  );
};
