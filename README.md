# Mini Games

Small games to play in the browser, at [minigames.irmahs.dev](https://minigames.irmahs.dev).

## Games

**Wheel of Fortune.** Make a wheel, fill it in and spin it. When it stops, it beeps and a popup names the slice it landed on.

Each tab is one of your wheels. A first visit opens two:

| Wheel | Starts with |
| --- | --- |
| Names | Four empty slots to type names into |
| Death | Asteroid impact, Supervolcano, Black smoke, Megaquake, Tsunami, Ice age, Solar flare, Plague, Drought, Wildfire, Flood |

**+ New wheel** adds another, up to eight, each with its own name and 2 to 16 slices. **Clear** empties the open wheel to four blank slots; **Reset** puts it back to how it started.

**Super Tic-Tac-Toe.** Nine games of tic-tac-toe, one on each planet, laid out as a tic-tac-toe board of their own. Pink 🌸 starts and Purple 🔮 follows. The square you take sends the other player to the planet in the same place; if that planet is already conquered or full, they may play on any planet. Three in a row on a planet conquers it, and three conquered planets in a row win the game. Two ways to play:

- **Same screen**: two people on one device. The game in progress is saved in the browser, so a reload picks it up where it stopped.
- **Online**: for anyone signed in to their irmahs.dev account. **Play online** puts you in a queue, and the first two people in it play each other in a room of their own; Pink is picked at random. If nobody moves for five minutes, the player whose turn it was loses. Nobody else turning up for five minutes ends the search. A reload or a dropped connection puts you back in your game.

Every online game counts on the **leaderboard**, which anyone can see, signed in or not:

| Result | Points |
| --- | --- |
| Win | 1 per square you placed, 5 per planet you claimed, and 25 for the victory |
| Draw | Your squares and planets, with no bonus |
| Defeat | −25, and nothing you placed counts; letting the clock run out on your turn is a defeat |

Nobody's total drops below 0. Players appear as first name and last initial, "Irma H.".

The Wheel of Fortune and the same-screen game keep everything in the browser's `localStorage`, until the visitor deletes it or clears their site data. Online games and the leaderboard live on the server.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173: the games, and the same-screen game
npm test
npm run build     # the site in dist/, the server in dist-server/
```

Online play needs the server, its database and the account service as well (Node 22+ and Docker):

```sh
cp .env.example .env
npm run db:up     # Postgres on localhost:5434, migrations applied
npm run dev:api   # the server on :3002; Vite forwards /api and /ws to it
```

and [irmahs-labs/auth](https://github.com/irmahs-labs/auth) running on `localhost:3001` (its README says how), so there is someone to sign in as. `TEST_DATABASE_URL=postgres://minigames:minigames@localhost:5434/minigames npm test` also runs the leaderboard's database tests, which are skipped otherwise.

The server (`server/`) is [Hono](https://hono.dev/) on Node. It serves the built site, `/api/me` and `/api/leaderboard`, and `/ws`, the WebSocket online games are played over. It learns who a socket belongs to from the shared irmahs.dev sign-in cookie, by asking the account service, and refuses sockets from any other site. The queue and the games in progress are kept in memory, so a deploy ends the games being played; finished games and totals go in its own Postgres database (`db/migrations/`, applied by [dbmate](https://github.com/amacneil/dbmate)). The rules in `src/games/super-tic-tac-toe/rules.ts` are the same code in the browser and on the server, which checks every move.

## Deploy

Merging to `main` deploys. The workflow SSHes to the irmahs.dev server and resets `/srv/minigames` to `main`; there, with `compose.prod.yaml`, Postgres starts, pending migrations run, and the site is rebuilt and started. It joins the shared `proxy` network as `minigames`, where it also reaches the account service as `auth:3001`. Caddy in [irmahs-labs/proxy](https://github.com/irmahs-labs/proxy) serves it at minigames.irmahs.dev, WebSockets included.

Secrets (Settings → Secrets and variables → Actions):

| Secret | What |
| --- | --- |
| `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST` | Organization level, shared with the other repos |
| `MINIGAMES_POSTGRES_PASSWORD` | The leaderboard database's password, `openssl rand -base64 32`. Read only when the database is first created |

### First setup (one time)

1. Cloudflare: `A` and `AAAA` records for `minigames` pointing at the server, **DNS only**.
2. On the server, as the admin user: `sudo mkdir /srv/minigames && sudo chown deploy:deploy /srv/minigames`.
3. Merge the `minigames.irmahs.dev` block in irmahs-labs/proxy's `caddy/Caddyfile`.
4. Add the `MINIGAMES_POSTGRES_PASSWORD` secret above.
5. Merge here; the deploy clones the repo into `/srv/minigames` and starts the database and the site.

## License

MIT
