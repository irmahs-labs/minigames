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

Nobody's total drops below 0. Players appear as first name and the initials of the names after it, "Irma H." or, with two last names, "Irma HS.".

**Ouk Chaktrang.** Cambodian chess, as [PyChess](https://www.pychess.org/variants/cambodian) plays it: the Khun (king), the Neang (lady), two Koul (generals), two Seh (horses), two Tuk (boats) and eight Trey (fish), with the Khun's one leap, the Neang's first double step, Trey flipped on the sixth rank, and the counting rules. Tap a piece to see where it can go, tap a square and tap it again to play there, or drag the piece; a square turns red when your piece could be taken there, and a capture crunches. Two sets of pieces: Matcha, and Yeak vs Tevada. Three ways to play: against the bot (easy, medium or hard, in your browser), on one screen, or online with the same queue as Super Tic-Tac-Toe. Online games count on its own leaderboard: each capture is worth its piece (Tuk 5, Seh 3, Koul 3, Neang or flipped Trey 2, Trey 1), a win adds 30, and a defeat takes 25 off but you keep your captures.

**Moved to Realms.** The Book of Shadows, Booster Potion (now Potion Brewing) and Spell Creator moved to [Realms](https://realms.irmahs.dev) on 2026-11-16, in its Book of Shadows. Their old addresses here (`/book-of-shadows`, `/booster-potion`, `/spell-creator`) send visitors to the same page there (`src/moved.tsx`); the Book of Shadows' address carries the visitor's saved book along in the address's fragment (`#book=…`, never sent to a server), which Realms keeps when its own book is still blank. The recipe books were copied across by Realms' `scripts/import-potions.sh`; their tables here were dropped on 2026-11-17.

**Moved to the landing page.** The Festival Calendar moved to [irmahs.dev](https://irmahs.dev) the same day, into the slot beside the apps (irmahs-labs/landing-page). Its old address here, `/festival-calendar`, sends visitors there. Calendars picked here stay in this site's browser storage and don't carry over.

**Magic 8 Ball** (`/magic-8-ball`). Ask a yes-or-no question and shake. On a phone, shake the phone itself (an iPhone asks once for motion access); anywhere, flick the ball with a finger or the mouse, or press **Shake the ball**. The ball is drawn in 3D: drag it to turn it and look at it from any side. Shaken, it tumbles, rolls its window up to you, and the die floats up with one of the classic twenty answers. It came over from the Book of Shadows on Realms.

**Quizzes.** Personality quizzes, each at its own address under `/quizzes`. The first is **What type of witch are you?**: thirty-two questions, six answers each, and sixteen witches (green, hedge, kitchen, cottage, sea, fire, storm, moon, cosmic, crystal, fairy, love, chaos, grey, eclectic and tech, the tinkering kind). Each answer gives 2 points to the witch it describes best, and most give 1 to another it leans towards. Every witch is worth 35 points over all the answers, and never twice in one question, so each has the same chance. The witch with the most points is yours; on a tie, the first alphabetically by its English name. The result shows a pie of your mix, biggest first: up to eight slices, the rest folded into "Others", with a legend that names every witch and its share. Take it again as often as you like; the last result is kept in the browser and shown when you come back.

## The sticky board

Under the games, the hub has a **sticky board**: anyone signed in to their irmahs.dev account can stick a note on it, in lemon, matcha, strawberry, taro, blue or white, for everyone to read. Notes are up to 200 characters and never show who wrote them. Each comes down a day after it went up, and the server deletes it, with who wrote it, within the hour after. Everyone can have 5 notes up at a time.

On a wide screen the notes hang in the empty margins either side of the games, starting in columns against them, newest first; on a narrower window or a phone they sit on a corkboard under the games instead. Anyone can drag them about, within the margins or on the corkboard: with the mouse, by the tape on top on a touch screen, or with the arrow keys on the tape. Where you put the notes is kept in your browser (`localStorage`), so only you see your arrangement. Anyone signed in can give a note a thumbs up or down, one each per note, which they can change or take back; everyone sees the counts, never who voted.

Mini Games admins can take a note down before then. An admin is anyone the account service lets into Alma Housila: its `alma-housila` list in the `APP_ACCESS` secret (in irmahs-labs/auth) is reused, so the secret needs nothing new. The server asks the account service's `GET /api/access/alma-housila` with the visitor's cookie, and only a yes counts. Adding someone to Alma Housila makes them a Mini Games admin too.

## Where things are kept

The Wheel of Fortune, the same-screen game and the quizzes' last results keep everything in the browser's `localStorage`, until the visitor deletes it or clears their site data. Online games, the leaderboard and the sticky board live on the server, and so does a signed-in visitor's witch quiz result, so it can show on their Book of Shadows on [Realms](https://realms.irmahs.dev); they can take it off from the quiz's result. The life partner quiz's result never leaves the browser.

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

and [irmahs-labs/auth](https://github.com/irmahs-labs/auth) running on `localhost:3001` (its README says how), so there is someone to sign in as. `TEST_DATABASE_URL=postgres://minigames@localhost:5434/minigames npm test` also runs the leaderboard's and the sticky board's database tests, which are skipped otherwise. The local database has no password: it only answers this machine. One made before it went passwordless still asks for one; `npm run db:reset` rebuilds it.

The server (`server/`) is [Hono](https://hono.dev/) on Node. It serves the built site, `/api/me`, `/api/leaderboard`, `/api/quizzes/:slug/result` (a quiz result kept on an account, for Realms), `/api/board`, `/api/board/notes` and `/api/board/notes/:id/vote` (the sticky board), and `/ws`, the WebSocket online games are played over. It learns who a socket belongs to from the shared irmahs.dev sign-in cookie, by asking the account service, and refuses sockets from any other site. The queue and the games in progress are kept in memory, so a deploy ends the games being played; finished games and totals go in its own Postgres database (`db/migrations/`, applied by [dbmate](https://github.com/amacneil/dbmate)). The rules in `src/games/super-tic-tac-toe/rules.ts` are the same code in the browser and on the server, which checks every move.

## Deploy

Merging to `main` deploys. The workflow SSHes to the irmahs.dev server and resets `/srv/minigames` to `main`; there, with `compose.prod.yaml`, Postgres starts, pending migrations run, and the site is rebuilt and started. It joins the shared `proxy` network as `minigames`, where it also reaches the account service as `auth:3001`. Caddy in [irmahs-labs/proxy](https://github.com/irmahs-labs/proxy) serves it at minigames.irmahs.dev, WebSockets included.

Secrets (Settings → Secrets and variables → Actions):

| Secret | What |
| --- | --- |
| `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST` | Organization level, shared with the other repos |
| `MINIGAMES_POSTGRES_PASSWORD` | The database's password (the leaderboard and the sticky board), `openssl rand -base64 32`. Read only when the database is first created |

### First setup (one time)

1. Cloudflare: `A` and `AAAA` records for `minigames` pointing at the server, **DNS only**.
2. On the server, as the admin user: `sudo mkdir /srv/minigames && sudo chown deploy:deploy /srv/minigames`.
3. Merge the `minigames.irmahs.dev` block in irmahs-labs/proxy's `caddy/Caddyfile`.
4. Add the `MINIGAMES_POSTGRES_PASSWORD` secret above.
5. Merge here; the deploy clones the repo into `/srv/minigames` and starts the database and the site.

## License

MIT
