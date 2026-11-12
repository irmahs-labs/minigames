# CLAUDE.md

## Git branches

Always pull before making changes: run `git fetch origin` and start from the latest `origin/main` before the first edit.

- On a branch whose PR is open, bring it up to date with `origin/main` first
- On `main`, or on a branch whose PR is already merged, create a new branch from `origin/main` instead

Always name the branch after the feature or fix it contains, never a random or generated name.

- Format: `<type>/<feature-name>` in lowercase kebab-case
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`
- Examples: `feat/wheel-of-encounters`, `fix/wheel-label-overflow`, `docs/claude-md`
- If the session assigns a generic branch (for example `claude/<random-words>`), create a feature-named branch instead and push there

## Pull requests

- Never push to `main`. Every change goes in through a pull request.
- Open the PR and stop there: never merge it, not even when CI is green. Irma reviews and clicks merge.
- Deploys run on merge to `main`. Re-run a deploy only when Irma asks.

## Checks before pushing

```sh
npm run check     # Ultracite (oxlint + oxfmt); CI fails on it
npm run typecheck # tsc -b
npm test          # vitest
npm run build     # the site in dist/, the server in dist-server/
```

`server/scores.test.ts`, `server/potions.test.ts` and `server/notes.test.ts` run only with `TEST_DATABASE_URL` set (after `npm run db:up`, `postgres://minigames@localhost:5434/minigames`); the Database workflow runs them in CI.

The PostToolUse hook in `.claude/hooks/ultracite.sh` runs Ultracite and the typecheck on every file you edit.

## What this is

Mini Games, at minigames.irmahs.dev: a hub of small browser games, a Vite + React site served by a small Node server. A game that remembers anything for one visitor keeps it in their `localStorage`, read through a zod schema (`src/lib/storage.ts`) so a damaged or old value falls back to the defaults instead of breaking the page.

The server (`server/`, Hono on Node) serves the built site, `/api`, and `/ws`, the WebSocket Super Tic-Tac-Toe is played over online, with its leaderboard, Booster Potion's shared recipe book and the hub's sticky board in Postgres:

- Who someone is comes only from the shared irmahs.dev sign-in cookie, asked of the account service (irmahs-labs/auth) by `server/session.ts`; never from anything the browser sends. `/ws` refuses any `Origin` but the site's own, since the cookie is shared by every `*.irmahs.dev` page.
- Booster Potion brews on the server (`POST /api/potions/brew`, signed in, own `Origin` only, 30 a minute): `src/games/booster-potion/recipes.ts` and `brewing.ts` are server-only, so the page never carries the answers. Never import them from the game's React code; `npm run build` must leave no recipe name in `dist/assets`. Who brewed what is `server/potions.ts`: the shared book in `booster_potion_brews`, each player's own solo book in `booster_potion_solo_brews` (`/api/potions/solo`).
- The hub's sticky board (`src/board/`, `server/notes.ts`, tables `hub_sticky_notes` and `hub_sticky_note_votes`) is anonymous: a note's poster is kept only to hold them to 5 notes up at once, and a voter only to keep them to one vote a note; neither ever leaves the server. Where a note sits is the visitor's own, in their `localStorage`, never on the server: down the hub's side margins on a wide screen (`src/board/sides.ts`, which must match `.page`'s width and padding), on the corkboard in the panel otherwise (`src/board/layout.ts`). Notes come down after a day, and an hourly sweep deletes them. Posting is signed in and own `Origin` only. Only admins take notes down: `askAdminAccess` in `server/session.ts` asks the account service's `GET /api/access/alma-housila`, reusing Alma Housila's `APP_ACCESS` list; never decide who is an admin in this repo.
- The server is the referee: `server/lobby.ts` runs the queue, the rooms and their five-minute clocks in memory, and checks every move with the same `rules.ts` the browser uses. Scoring is `src/games/super-tic-tac-toe/scoring.ts`.
- The schema is the dbmate migrations in `db/migrations/`. Every table is named after its game's slug in snake_case (`super_tic_tac_toe_players`, `booster_potion_brews`), or `hub_` for the hub's own (`hub_sticky_notes`), so the shared database says whose each table is. Never edit a migration that is already merged: add a new one with `npm run db:new -- <name>`, with a matching `-- migrate:down`.

## Languages

The site reads in English or French. The choice is `src/lib/language.ts`: kept in localStorage and in a `lang` cookie on `irmahs.dev` that every irmahs.dev app reads and writes, so one pick carries across the apps; the header's EN/FR pill (`src/components/language-toggle.tsx`) switches it. Every string a visitor sees has both versions, in a `COPY = { en, fr }` object beside the component that shows it (`useCopy(COPY)`), and a game's `name` and `blurb` in `GAMES` are `{ en, fr }`. The server's refusals stay English sentences and `src/lib/server-words.ts` gives each its French. Booster Potion's notes are `noteFr` beside `note` in the server-only recipes; its ingredients and clues are read back in French from `pantry-fr.ts`. The Book of Shadows' data stays in English, and `french.ts` (one file per topic in `french/`) gives each line its French through `say`; its own words use `tr(english, french)`.

Spell Creator (`src/games/spell-creator/`) is the one game in English only, because its spells rhyme in English: its own words are English, marked `lang="en"`, and in French a note says so; its `GAMES` entry and the way back to the hub are still in both. It hears words through the CMU Pronouncing Dictionary (the `cmu-pronouncing-dictionary` package), which `vite.config.ts` packs at build time into the `virtual:pronunciations` module (`pronunciations.ts`); only the game loads it (`dictionary.ts`). The tiers are `spell.ts`, the rhymes `rhyme.ts`.

## Adding a game

1. Put it in its own folder, `src/games/<slug>/`, with a default-exported screen component, its words in English and French.
2. Add an entry to `GAMES` in `src/games.ts`. The hub lists it and `/<slug>` routes to it; it loads only when opened.
3. Keep its rules (spinning, scoring, state changes) in plain functions next to it with Vitest tests, apart from the React code.

A game marked `nested` in `GAMES` also owns the pages under `/<slug>/`. Quizzes is one: each quiz is a `Quiz` (`src/games/quizzes/quiz.ts`) in `QUIZZES` (`all-quizzes.ts`), at `/quizzes/<slug>`, its answers giving points to its results; the most points wins, a tie going to the first result alphabetically by its English name. Its last result is kept in `localStorage`, one key per quiz.

Festival Calendar (`src/games/festival-calendar/`) shows a month of the calendars a visitor adds (kept in `localStorage`): the Moon's phases, and festivals in groups, by region (East Asian, Latin American…) or by faith (Islamic, Jewish, Christian). Each festival is one entry in `FESTIVALS` (`festivals.ts`), named as it is said where it is kept, with each country's own name for a shared one and its countries as ISO codes of UN member states. Its days come from the browser's own calendars through Intl (Islamic Umm al-Qura, Hebrew, Persian, Ethiopian: `dates.ts`), the Chinese calendar worked out from the Sun and the Moon as Beijing keeps it (`chinese.ts`; Intl's puts some new years a day off, and browsers disagree), the Easter computus, the Hindu lunisolar calendar worked out with astronomy-engine for India (`hindu.ts`), and the Book of Shadows' own moon and Buddhist calendar, which it imports. The Book of Shadows' moon calendar no longer marks festivals: they are the Festival Calendar's. Each festival's card adds it to the visitor's own calendar once, all day, never repeating (`add-to-calendar.ts`): on an iPhone from an .ics the server sends (`GET /api/festival-calendar/<id>/<first day>.ics`, which takes only a festival and its first day, checks it against the days it works out itself, a day or two either way, so it never sends an event of anyone else's making; Safari won't open an .ics made in the page), on Android through a Google Calendar link (its app can't read an .ics), and elsewhere as an .ics made in the page.

## Names

The name people see is `APP_NAME` in `src/lib/brand.ts`. The image, the network alias, the database and the server folder are all `minigames` (`/srv/minigames`).

## Design

The site is styled in Cute Matcha's app look (the _Apps_ section of Irma's Cute Matcha design system), in Light Matcha and Dark Matcha (a mid-tone matcha page, cards a step lighter, and the header, buttons and fields a darker well, with near-black outlines and shadows in both themes). Colours are the system's role tokens, named by job (`ground`, `panel`, `header`, `raised`, `text`, `text-muted`, `accent`, `pop`, `strong`, `selected`, …), at the top of `src/styles.css`: Light Matcha on `:root`, Dark Matcha on `:root[data-theme="dark"]`. Pick a token by what the thing is, never a hex: the primary button is `pop`, the yellow accent kept for the one call to action on a screen (48px tall, sinking into its hard shadow when pressed), a chosen option or a switch that is on is `selected`, legends are `strong`. The inline script in `index.html` sets `data-theme` before the first paint, from the visitor's saved choice or else the device's setting, and `src/lib/theme.ts` keeps it (the header's sun/moon toggle saves a choice).

Every page opens with the **Header** (`src/components/header.tsx`): its 40px app icon (`src/components/app-icons.tsx`, in fixed Light Matcha colours with a `text` rim), its name in Fredoka with "by Irma HS" under it, the page's own buttons in the middle, then the theme toggle and the **account pill** (`src/components/account-button.tsx`): "sign in" with Google's mark, or the person's picture and first name, linking to the IrmaHS Labs account page. It asks `auth.irmahs.dev` who is signed in from the browser (`src/lib/session.ts`); on localhost the service doesn't answer, so the pill shows "sign in". Fredoka sets titles and panel names, Nunito Sans everything else. Panels are flat, with a 2px outline and a filename on a `strong` pill (`.legend`), always with an extension that exists (`.exe`, `.log`, `.csv`, `.txt`, `.epub`, …); only the one action to press next (`.btn--primary`) carries the hard shadow. Every page closes with the **Footer** (`src/components/footer.tsx`, rendered by `App`): "more apps at irmahs.dev", the one thing the Header doesn't say. Corners are concentric: panels and game cards are `--radius-panel` (20px) with 16px of padding on top and 12px elsewhere, and what sits inside takes `--radius-field` (8px). A game card is the link itself, with an arrow at the end of its name and no "play" label. Screen icons (`src/lib/icon.tsx`) are a 24 grid at 2px. The favicon is the Mini Games die, `public/favicon.svg`.

## Deploy

Merging to `main` runs `.github/workflows/deploy.yml`, which SSHes to the server as `deploy`, resets `/srv/minigames` to `main`, and with `compose.prod.yaml` starts Postgres, runs pending migrations and rebuilds the site's container. It needs the `MINIGAMES_POSTGRES_PASSWORD` secret. The shared Caddy in `irmahs-labs/proxy` routes `minigames.irmahs.dev` to it. `compose.yaml` is for local development only: a database and dbmate.
