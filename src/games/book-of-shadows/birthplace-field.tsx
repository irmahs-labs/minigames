import { useEffect, useState } from "react";

import { searchPlaces } from "./place-search";
import { localMatches, plain } from "./places";
import type { Place } from "./places";
import { MAX_PLACE } from "./profile";
import type { Profile } from "./profile";

/** How long typing must pause before the search goes out. */
const PAUSE_MS = 300;

interface BirthplaceFieldProps {
  /** Its ids' prefix, so two forms on one page keep theirs apart. */
  idPrefix: string;
  profile: Profile;
  onChange: (fields: Partial<Profile>) => void;
}

type Search = "idle" | "searching" | "offline";

/** The line under the field: where the place is, or how the search goes. */
const statusOf = ({
  count,
  picked,
  profile,
  search,
  wanted,
}: {
  count: number;
  picked: boolean;
  profile: Profile;
  search: Search;
  wanted: boolean;
}): string => {
  if (picked) {
    return `📍 ${profile.lat}, ${profile.lon} · ${profile.timeZone}`;
  }

  if (!wanted) {
    return "Pick your town from the list to fill in where and when.";
  }

  if (search === "searching") {
    return "Looking for places…";
  }

  if (search === "offline") {
    return "The search is out of reach: pick from the list, or type the coordinates below.";
  }

  return count === 0
    ? "No town by that name yet: keep typing, or check the spelling."
    : "Pick your town from the list to fill in where and when.";
};

/**
 * The birthplace: type a town and pick it from the list under the field,
 * which fills in its coordinates and time zone. The places on the built-in
 * list come up at once; any other town on the Earth is looked up as you
 * type (Open-Meteo), and only the town's name leaves the browser.
 */
export const BirthplaceField = ({
  idPrefix,
  profile,
  onChange,
}: BirthplaceFieldProps) => {
  const [open, setOpen] = useState(false);
  const [found, setFound] = useState<Place[]>([]);
  const [search, setSearch] = useState<Search>("idle");
  const query = profile.place;

  const picked =
    profile.lat !== "" && profile.lon !== "" && profile.timeZone !== "";

  const wanted = open && !picked && plain(query).length >= 2;

  useEffect(() => {
    if (!wanted) {
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setSearch("searching");

      const places = await searchPlaces(query, controller.signal);

      if (!controller.signal.aborted) {
        setFound(places ?? []);
        setSearch(places === null ? "offline" : "idle");
      }
    }, PAUSE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, wanted]);

  const local = wanted ? localMatches(query) : [];
  const listed = new Set(local.map((place) => plain(place.name)));

  const options = [
    ...local,
    ...(wanted ? found : []).filter((place) => !listed.has(plain(place.name))),
  ];

  const pick = (place: Place) => {
    onChange({
      lat: String(place.lat),
      lon: String(place.lon),
      place: place.name,
      timeZone: place.timeZone,
    });
    setOpen(false);
  };

  return (
    <div className="stack birthplace">
      <label className="field-label" htmlFor={`${idPrefix}-place`}>
        Birthplace
      </label>
      <input
        id={`${idPrefix}-place`}
        className="field"
        value={query}
        maxLength={MAX_PLACE}
        autoComplete="off"
        placeholder="Start typing a town"
        aria-describedby={`${idPrefix}-place-status`}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        onChange={(event) => {
          // A new name means a new place: its old coordinates go with it.
          onChange({
            lat: "",
            lon: "",
            place: event.target.value,
            timeZone: "",
          });
          setOpen(true);
        }}
      />
      {options.length > 0 ? (
        <ul className="birthplace__options" aria-label="Places that match">
          {options.map((place) => (
            <li key={`${place.name}-${place.lat}-${place.lon}`}>
              <button
                type="button"
                className="birthplace__option"
                onClick={() => pick(place)}
              >
                <span>{place.name}</span>
                <span className="birthplace__zone">{place.timeZone}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p id={`${idPrefix}-place-status`} className="hint" aria-live="polite">
        {statusOf({ count: options.length, picked, profile, search, wanted })}
      </p>
    </div>
  );
};
