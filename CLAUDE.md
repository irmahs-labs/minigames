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

`server/scores.test.ts` runs only with `TEST_DATABASE_URL` set (after `npm run db:up`, `postgres://minigames:minigames@localhost:5434/minigames`); the Database workflow runs it in CI.

The PostToolUse hook in `.claude/hooks/ultracite.sh` runs Ultracite and the typecheck on every file you edit.

## What this is

Mini Games, at minigames.irmahs.dev: a hub of small browser games, a Vite + React site served by a small Node server. A game that remembers anything for one visitor keeps it in their `localStorage`, read through a zod schema (`src/lib/storage.ts`) so a damaged or old value falls back to the defaults instead of breaking the page.

The server (`server/`, Hono on Node) serves the built site, `/api`, and `/ws`, the WebSocket Super Tic-Tac-Toe is played over online, with its leaderboard in Postgres:

- Who someone is comes only from the shared irmahs.dev sign-in cookie, asked of the account service (irmahs-labs/auth) by `server/session.ts`; never from anything the browser sends. `/ws` refuses any `Origin` but the site's own, since the cookie is shared by every `*.irmahs.dev` page.
- The server is the referee: `server/lobby.ts` runs the queue, the rooms and their five-minute clocks in memory, and checks every move with the same `rules.ts` the browser uses. Scoring is `src/games/super-tic-tac-toe/scoring.ts`.
- The schema is the dbmate migrations in `db/migrations/`. Never edit a migration that is already merged: add a new one with `npm run db:new -- <name>`, with a matching `-- migrate:down`.

## Adding a game

1. Put it in its own folder, `src/games/<slug>/`, with a default-exported screen component.
2. Add an entry to `GAMES` in `src/games.ts`. The hub lists it and `/<slug>` routes to it; it loads only when opened.
3. Keep its rules (spinning, scoring, state changes) in plain functions next to it with Vitest tests, apart from the React code.

## Names

The name people see is `APP_NAME` in `src/lib/brand.ts`. The image, the network alias, the database and the server folder are all `minigames` (`/srv/minigames`).

## Design

The site is styled in Cute Matcha's app look (the _Apps_ section of Irma's Cute Matcha design system), in Light Matcha and Dark Matcha (a mid-tone matcha page, cards a step lighter, and the header, buttons and fields a darker well, with near-black outlines and shadows in both themes). Colours are the system's role tokens, named by job (`ground`, `panel`, `header`, `raised`, `text`, `text-muted`, `accent`, `strong`, `selected`, …), at the top of `src/styles.css`: Light Matcha on `:root`, Dark Matcha on `:root[data-theme="dark"]`. Pick a token by what the thing is, never a hex: the primary button is `accent`, a chosen option or a switch that is on is `selected`, legends are `strong`. The inline script in `index.html` sets `data-theme` before the first paint, from the visitor's saved choice or else the device's setting, and `src/lib/theme.ts` keeps it (the header's sun/moon toggle saves a choice).

Every page opens with the **Header** (`src/components/header.tsx`): its 40px app icon (`src/components/app-icons.tsx`, in fixed Light Matcha colours with a `text` rim), its name in Fredoka with "by Irma HS" under it, the page's own buttons in the middle, then the theme toggle and the **account pill** (`src/components/account-button.tsx`): "sign in" with Google's mark, or the person's picture and first name, linking to the IrmaHS Labs account page. It asks `auth.irmahs.dev` who is signed in from the browser (`src/lib/session.ts`); on localhost the service doesn't answer, so the pill shows "sign in". Fredoka sets titles and panel names, Nunito Sans everything else. Panels are flat, with a 2px outline and a filename on a `strong` pill (`.legend`); only the one action to press next (`.btn--primary`) carries the hard shadow. The favicon is the Mini Games die, `public/favicon.svg`.

## Deploy

Merging to `main` runs `.github/workflows/deploy.yml`, which SSHes to the server as `deploy`, resets `/srv/minigames` to `main`, and with `compose.prod.yaml` starts Postgres, runs pending migrations and rebuilds the site's container. It needs the `MINIGAMES_POSTGRES_PASSWORD` secret. The shared Caddy in `irmahs-labs/proxy` routes `minigames.irmahs.dev` to it. `compose.yaml` is for local development only: a database and dbmate.
