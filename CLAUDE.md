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
npm run lint      # typecheck (tsc -b)
npm test          # vitest
npm run build     # the static site in dist/
```

`npm run check` runs Ultracite (oxlint + oxfmt) and is report-only; the PostToolUse hook in `.claude/hooks/ultracite.sh` runs it on every file you edit.

## What this is

Mini Games, at minigames.irmahs.dev: a hub of small browser games. It is a static Vite + React site with no backend and no database. A game that remembers anything keeps it in the visitor's `localStorage`, read through a zod schema (`src/lib/storage.ts`) so a damaged or old value falls back to the defaults instead of breaking the page.

## Adding a game

1. Put it in its own folder, `src/games/<slug>/`, with a default-exported screen component.
2. Add an entry to `GAMES` in `src/games.ts`. The hub lists it and `/<slug>` routes to it; it loads only when opened.
3. Keep its rules (spinning, scoring, state changes) in plain functions next to it with Vitest tests, apart from the React code.

## Names

The name people see is `APP_NAME` in `src/lib/brand.ts`. The image, the network alias and the server folder are all `minigames` (`/srv/minigames`).

## Design

The site is styled in Sleek Matcha, the app look of Irma's Cute Matcha design system, in its dark version as drawn for the Matcha Wheel: the tokens at the top of `src/styles.css`, Abril Fatface for names and Lato for everything else, 2px near-black outlines, raised panels with a filename on a lime pill (`.legend`), and lime with ink text for whatever is selected. Only the one action to press next in an area (`.btn--primary`) carries the hard shadow. The logo is `public/favicon.svg`.

## Deploy

Merging to `main` runs `.github/workflows/deploy.yml`, which SSHes to the server as `deploy`, resets `/srv/minigames` to `main` and rebuilds the container. The shared Caddy in `irmahs-labs/proxy` routes `minigames.irmahs.dev` to it.
