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

`server/scores.test.ts` and `server/notes.test.ts` run only with `TEST_DATABASE_URL` set (after `npm run db:up`, `postgres://minigames@localhost:5434/minigames`); the Database workflow runs them in CI.

The PostToolUse hook in `.claude/hooks/ultracite.sh` runs Ultracite and the typecheck on every file you edit.

## What this is

Mini Games, at minigames.irmahs.dev: a hub of small browser games, a Vite + React site served by a small Node server. A game that remembers anything for one visitor keeps it in their `localStorage`, read through a zod schema (`src/lib/storage.ts`) so a damaged or old value falls back to the defaults instead of breaking the page.

The server (`server/`, Hono on Node) serves the built site, `/api`, and `/ws`, the WebSocket Super Tic-Tac-Toe is played over online, with its leaderboard and the hub's sticky board in Postgres:

- Who someone is comes only from the shared irmahs.dev sign-in cookie, asked of the account service (irmahs-labs/auth) by `server/session.ts`; never from anything the browser sends. `/ws` refuses any `Origin` but the site's own, since the cookie is shared by every `*.irmahs.dev` page.
- The hub's sticky board (`src/board/`, `server/notes.ts`, tables `hub_sticky_notes` and `hub_sticky_note_votes`) is anonymous: a note's poster is kept only to hold them to 5 notes up at once, and a voter only to keep them to one vote a note; neither ever leaves the server. Where a note sits is the visitor's own, in their `localStorage`, never on the server: down the hub's side margins on a wide screen (`src/board/sides.ts`, which must match `.page`'s width and padding), on the corkboard in the panel otherwise (`src/board/layout.ts`). Notes come down after a day, and an hourly sweep deletes them. Posting is signed in and own `Origin` only. Only admins take notes down: `askAdminAccess` in `server/session.ts` asks the account service's `GET /api/access/alma-housila`, reusing Alma Housila's `APP_ACCESS` list; never decide who is an admin in this repo.
- The server is the referee: `server/lobby.ts` runs the queue, the rooms and their five-minute clocks in memory, and checks every move with the same `rules.ts` the browser uses. Scoring is `src/games/super-tic-tac-toe/scoring.ts`.
- The schema is the dbmate migrations in `db/migrations/`. Every table is named after its game's slug in snake_case (`super_tic_tac_toe_players`), or `hub_` for the hub's own (`hub_sticky_notes`), so the shared database says whose each table is. Booster Potion's tables went with it to Realms: `20261117120000_drop_booster_potion_tables.sql` dropped them here. Never edit a migration that is already merged: add a new one with `npm run db:new -- <name>`, with a matching `-- migrate:down`.

**Moved to Realms.** The Book of Shadows, Booster Potion (now Potion Brewing) and Spell Creator moved to Realms (irmahs-labs/realms, realms.irmahs.dev) on 2026-11-16. `src/moved.tsx` answers their old addresses (`/book-of-shadows`, `/booster-potion`, `/spell-creator`) by sending the visitor to the same page there; the Book of Shadows' carries the book saved under `minigames:book-of-shadows:v1` in the address's fragment, `#book=` and its JSON in base64url, the format Realms' `carry-over.ts` reads. Never put it in a query string.

**Moved to the landing page.** The Festival Calendar moved to irmahs.dev (irmahs-labs/landing-page), beside the apps, on 2026-11-16; `src/moved.tsx` sends `/festival-calendar` there.

## Languages

The site reads in English or French. The choice is `src/lib/language.ts`: kept in localStorage and in a `lang` cookie on `irmahs.dev` that every irmahs.dev app reads and writes, so one pick carries across the apps; the header's EN/FR pill (`src/components/language-toggle.tsx`) switches it. Every string a visitor sees has both versions, in a `COPY = { en, fr }` object beside the component that shows it (`useCopy(COPY)`), and a game's `name` and `blurb` in `GAMES` are `{ en, fr }`. The server's refusals stay English sentences and `src/lib/server-words.ts` gives each its French.

## Adding a game

1. Put it in its own folder, `src/games/<slug>/`, with a default-exported screen component, its words in English and French.
2. Add an entry to `GAMES` in `src/games.ts`, with its icon from `src/components/app-icons.tsx` and what's `inside` it (a few short `{ en, fr }` names, its modes or parts, shown as pills on its card). The hub lists it, two cards a row, and `/<slug>` routes to it; it loads only when opened.
3. Keep its rules (spinning, scoring, state changes) in plain functions next to it with Vitest tests, apart from the React code.

A game marked `nested` in `GAMES` also owns the pages under `/<slug>/`. Quizzes is one: each quiz is a `Quiz` (`src/games/quizzes/quiz.ts`) in `QUIZZES` (`all-quizzes.ts`), at `/quizzes/<slug>`, its answers giving points to its results; the most points wins, a tie going to the first result alphabetically by its English name. Its last result is kept in `localStorage`, one key per quiz. A quiz with a `profile` (the witch quiz, for the Book of Shadows on Realms) is also kept on a signed-in visitor's account: finished signed in, it is saved at once; an older result only when they press "put it on…"; and they can take it off. That is `quizzes_results` (`server/quiz-results.ts`), through `GET`, `PUT` and `DELETE /api/quizzes/<slug>/result` (writes signed in, own `Origin` only, 20 a minute, and only results the quiz could give: `keepable` in `account-result.ts`). Realms' server reads it with `GET`, passing the visitor's cookie, over the shared `proxy` network as `http://minigames:3000`; the answer names each result in both languages, so Realms needs no copy of the quiz. A quiz without a `profile`, like the life partner quiz, never leaves the browser.

The Arena (`src/games/the-arena/`) is a last-one-standing simulator: the visitor names contestants in up to 12 districts of up to 4 (`cast.ts`, kept in `localStorage`), and the games play out Day 1, Night 1, Day 2… until one is left, or, when district-mates may win together, until everyone left is from one district (`simulation.ts`, every day taking at least one life). What can happen is `events.ts`: lines with places for one to three contestants, who dies and at whose hand, in English and French, written to fit anyone (no "he" or "she", no French word agreeing with one). It is its own game, not any book's or film's: keep their names, places and characters out of it.

## Names

The name people see is `APP_NAME` in `src/lib/brand.ts`. The image, the network alias, the database and the server folder are all `minigames` (`/srv/minigames`).

## Design

The site is styled in Cute Matcha's app look (the _Apps_ section of Irma's Cute Matcha design system), in Light Matcha and Dark Matcha (a mid-tone matcha page, cards a step lighter, and the header, buttons and fields a darker well, with near-black outlines and shadows in both themes). Colours are the system's role tokens, named by job (`ground`, `panel`, `header`, `raised`, `text`, `text-muted`, `accent`, `pop`, `strong`, `selected`, …), at the top of `src/styles.css`: Light Matcha on `:root`, Dark Matcha on `:root[data-theme="dark"]`. Pick a token by what the thing is, never a hex: the primary button is `pop`, the yellow accent kept for the one call to action on a screen (48px tall, sinking into its hard shadow when pressed), a chosen option or a switch that is on is `selected`, legends are `strong`. The inline script in `index.html` sets `data-theme` before the first paint, from the visitor's saved choice or else the device's setting, and `src/lib/theme.ts` keeps it (the header's sun/moon toggle saves a choice).

Every game opens with `GameHeader` (`src/components/game-header.tsx`), so the header stays uncluttered and says where you are: the game's icon and name ("Mini Games · by Irma HS" under it), a way back to every game and the shared pills; a game with pages of its own (Quizzes, from `pages` in `GAMES`) has them as tabs under it, the open one lifted in lime. On a phone (600px and under) the tabs give way to a ☰ button that opens a side drawer (a native `<dialog>`) with every game and every quiz. A quiz's tab name is in `GAMES` so the header never loads the quizzes; a test keeps the two in step. Every page opens with the **Header** (`src/components/header.tsx`): its 40px app icon (`src/components/app-icons.tsx`, in fixed Light Matcha colours with a `text` rim), its name in Fredoka with "by Irma HS" under it, the page's own buttons in the middle, then the theme toggle and the **account pill** (`src/components/account-button.tsx`): "sign in" with Google's mark, or the person's picture and first name, linking to the IrmaHS Labs account page. It asks `auth.irmahs.dev` who is signed in from the browser (`src/lib/session.ts`); on localhost the service doesn't answer, so the pill shows "sign in". Fredoka sets titles and panel names, Nunito Sans everything else. Panels are flat, with a 2px outline and a filename on a `strong` pill (`.legend`), always with an extension that exists (`.exe`, `.log`, `.csv`, `.txt`, `.epub`, …); only the one action to press next (`.btn--primary`) carries the hard shadow. Every page closes with the **Footer** (`src/components/footer.tsx`, rendered by `App`): "more apps at irmahs.dev", the one thing the Header doesn't say. Corners are concentric: panels and game cards are `--radius-panel` (20px) with 16px of padding on top and 12px elsewhere, and what sits inside takes `--radius-field` (8px). A game card is the link itself, with an arrow at the end of its name and no "play" label. Screen icons (`src/lib/icon.tsx`) are a 24 grid at 2px. App icons draw with only three colours, as the Book of Shadows' does: the lime tile (`#d4dd9c`, with its lighter green `#afc584` for details), the cream `#fff3cf` and the dark green `#2f3b34`; never yellow, gold, red or another lime. The favicon is the Mini Games die, `public/favicon.svg`.

## Deploy

Merging to `main` runs `.github/workflows/deploy.yml`, which SSHes to the server as `deploy`, resets `/srv/minigames` to `main`, and with `compose.prod.yaml` starts Postgres, runs pending migrations and rebuilds the site's container. It needs the `MINIGAMES_POSTGRES_PASSWORD` secret. The shared Caddy in `irmahs-labs/proxy` routes `minigames.irmahs.dev` to it. `compose.yaml` is for local development only: a database and dbmate.
