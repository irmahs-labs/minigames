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

**Booster Potion.** A potion-mixing game, from [Wellness Witch](https://github.com/irmahs/WellnessWitch). Its 115 potions are real wellness shots, teas and tonics, each cut down to its two to four core ingredients and linked to the recipe it comes from: ginger and turmeric shots, beet and green shots, switchel, fire cider and oxymels, jamu, golden milk, masala chai, guk po (pu-erh with chrysanthemum), kadha, sorrel, yuja-cha, jujube and goji teas, agua frescas and more. Every ingredient is in at least two potions. Put any two to four ingredients in the cauldron and brew. A few come more than one way, and you pick which in the cauldron: ginger fresh or dried (a ginger shot takes fresh, a ginger tea dried), turmeric fresh or powder, cinnamon as a stick or powder, mint fresh or dried, wheatgrass fresh or powder. Every ingredient has a one-line tip on what it is known for ("Ginger: eases nausea, with anti-inflammatory compounds"), shown when you hover it and under it in the cauldron. The teas go by their colour as China names them: white, green, red (what English calls black tea) and black (dark, aged tea such as pu-erh), and each tip names two that are easy to buy. The right mix makes a potion, with a fact or a caution about it, like cooking elderberries. Anything else is a Mystery Potion, with a hint: the form to change when only that is wrong, or else how many of the ingredients are in the closest potion nobody has found yet, its name, and the kinds of ingredient it still needs ("2 of these 4 are in Ember's Embrace. It still needs a fruit and a spice.").

There is one grimoire, the recipe book, shared by everyone. Brewing takes an irmahs.dev account: the first person to brew a potion puts their name and the date on its page ("First brewed by Irma H. on 28 Oct 2026, and 3 more", which opens the list of everyone who brewed it), under it the latest brew by anyone ("Last brewed by Ben C. on 29 Oct 2026", or "Last brewed by no one"), and anyone can read the grimoire, signed in or not. Its corner shows the last brew by anyone ("Last brew: Ben C., Ember's Embrace, 5 min ago"), and it refreshes every 30 seconds. A page lists its ingredients shelf by shelf, alphabetically on each. Pages nobody has found yet show only the kinds of ingredient they take. The server brews, so the recipes never reach the browser, and it takes at most 30 brews a minute from anyone.

Booster Potion can also be played solo: **My own grimoire** keeps a grimoire of your own on your irmahs.dev account, on every device. Its pages unlock only when you brew them, its hints point at the potions you have still to find, each page shows the day you found it, and **Start over** empties it. Solo brews never go in the shared grimoire.

**Book of Shadows.** A witch's profile, worked out in the browser from [Astronomy Engine](https://github.com/cosinekitty/astronomy)'s ephemeris. Nine pages, yours first:

- **Profile**:
  - **Today**: the Moon's phase and sign, the next sabbat, the lunar year (Year of the Fire Horse, 丙午) and the next lunar festival, and the sky: where the Sun and the Moon are, which planets are retrograde and until when, the next retrograde to start and the next eclipse.
  - **Card of the day**: one tarot card, pulled once a day; the day turns at midnight Paris time, wherever you are.
  - **Your details**, in a row across the page: name, birth date, time and place. Type a town and pick it from the list: the built-in places come up at once, and any other town on the Earth is looked up as you type ([Open-Meteo](https://open-meteo.com/en/docs/geocoding-api)'s free geocoding, no key), which fills in its coordinates and time zone. Only the town's name is sent; the coordinates can still be typed in by hand.
  - **The witch card** drawn from them: your Sun, Moon and rising signs, your craft (Candle, Green, Storm or Sea Witch, from the element your chart leans on), your life path, your Lunar zodiac animal, the moon you were born under, the sabbat season of your birthday, and your elements.
  - **Your soulmate**: a second person's details and their own witch card, and how you match on the next three pages.
- **Birth chart**: the chart as a wheel and a table, every planet's sign, degree and whole-sign house, and what your Sun, Moon and rising say. Without a birth time there is no rising sign or houses, and the card says when the Moon changed signs that day. With someone else on the profile: your charts side by side (synastry), their Suns' elements and the aspects between your Suns, Moons, Venuses, Marses and Mercuries, as a score and its reasons.
- **Numerology**: Pythagorean life path, expression, soul urge, personality, birthday and maturity numbers, master numbers kept, and your personal year. With someone else: how your life paths and your names' numbers get on (the 1-5-7, 2-4-8 and 3-6-9 families).
- **Lunar Zodiac**: Shēngxiào (生肖), the Chinese zodiac. Your animal and element, kept simple to your calendar year (with a note when tradition, which turns the year at the Lunar New Year or in Cambodia at Khmer New Year, says otherwise), your inner animal from your birth hour, your best matches and your clash; this year's animal, and when the Lunar New Year (worked out from the new moons and the solar terms, on Beijing time) and Khmer New Year fall; all twelve with their Earthly Branches, Khmer names and years; and the ten Heavenly Stems (天干) with their elements, images and years, this year's, your year's and your day master (the stem of the day you were born) picked out. With someone else: your animals (trines, secret friends, clashes) and your elements together.
- **Moon**: tonight's moon (its phase, how much is lit, its sign, its Buddhist lunar date, and the next full and new moons) and a month of moons, with the exact phases on their days and each full moon's traditional name (Harvest, Hunter's, Blue…), in your own time zone. The month is also the Buddhist lunar calendar as Cambodia keeps it (Chhankitek, from [`@thyrith/momentkh`](https://github.com/ThyrithSor/momentkh)): each day's lunar date, the holy days (Thngai Sel), and the festivals (the Lunar New Year, Meak Bochea, Khmer New Year, Visak Bochea, Royal Ploughing, Pchum Ben and Bon Om Touk) on their days.
- **Sabbats**: the Wheel of the Year, turned to today, and the eight sabbats of any year with their dates, what each is, how to keep it, its colours and symbols. The solstices and equinoxes are the days they fall on where you are; the fire festivals keep their traditional days, with the day the Sun is really halfway alongside. A switch turns the wheel round for the southern hemisphere.
- **Sky**: where every planet is today and which are retrograde, then a year's retrogrades, from the day each planet stations to the day it turns direct, and its eclipses.
- **Tarot**: all 78 cards of a Rider–Waite–Smith deck, each read upright and reversed. **Draw a card** at the top, or choose one a step at a time (major or minor arcana; for a minor card the suit; the card; then upright or reversed), and read it. A guide explains how to read them: the arcana, the suits and their elements, the numbers, the court cards.
- **Magic 8 Ball**: ask a yes-or-no question and shake. On a phone, shake the phone itself (an iPhone asks once for motion access); anywhere, flick the ball with a finger or the mouse, or press **Shake the ball**. The ball is drawn in 3D: drag it to turn it and look at it from any side. Shaken, it tumbles, rolls its window up to you, and the die floats up with one of the classic twenty answers.

## The sticky board

Under the games, the hub has a **sticky board**: anyone signed in to their irmahs.dev account can stick a note on it, in lemon, matcha, strawberry, taro, blue or white, for everyone to read. Notes are up to 200 characters and never show who wrote them. Each comes down a day after it went up, and the server deletes it, with who wrote it, within the hour after. Everyone can have 5 notes up at a time.

On a wide screen the notes hang in the empty margins either side of the games, starting in columns against them, newest first; on a narrower window or a phone they sit on a corkboard under the games instead. Anyone can drag them about, within the margins or on the corkboard: with the mouse, by the tape on top on a touch screen, or with the arrow keys on the tape. Where you put the notes is kept in your browser (`localStorage`), so only you see your arrangement. Anyone signed in can give a note a thumbs up or down, one each per note, which they can change or take back; everyone sees the counts, never who voted.

Mini Games admins can take a note down before then. An admin is anyone the account service lets into Alma Housila: its `alma-housila` list in the `APP_ACCESS` secret (in irmahs-labs/auth) is reused, so the secret needs nothing new. The server asks the account service's `GET /api/access/alma-housila` with the visitor's cookie, and only a yes counts. Adding someone to Alma Housila makes them a Mini Games admin too.

## Where things are kept

The Wheel of Fortune, the same-screen game and the Book of Shadows (both people's birth details and the card of the day included) keep everything in the browser's `localStorage`, until the visitor deletes it or clears their site data. Online games, the leaderboard, the Booster Potion recipe book and the sticky board live on the server.

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

and [irmahs-labs/auth](https://github.com/irmahs-labs/auth) running on `localhost:3001` (its README says how), so there is someone to sign in as. `TEST_DATABASE_URL=postgres://minigames:minigames@localhost:5434/minigames npm test` also runs the leaderboard's, the recipe book's and the sticky board's database tests, which are skipped otherwise.

The server (`server/`) is [Hono](https://hono.dev/) on Node. It serves the built site, `/api/me`, `/api/leaderboard`, `/api/potions` (the shared recipe book), `/api/potions/brewers`, `/api/potions/brew`, `/api/potions/solo` and `/api/potions/solo/brew` (each player's own book), `/api/board`, `/api/board/notes` and `/api/board/notes/:id/vote` (the sticky board), and `/ws`, the WebSocket online games are played over. It learns who a socket belongs to from the shared irmahs.dev sign-in cookie, by asking the account service, and refuses sockets from any other site. The queue and the games in progress are kept in memory, so a deploy ends the games being played; finished games and totals go in its own Postgres database (`db/migrations/`, applied by [dbmate](https://github.com/amacneil/dbmate)). The rules in `src/games/super-tic-tac-toe/rules.ts` are the same code in the browser and on the server, which checks every move. Booster Potion's recipes, `src/games/booster-potion/recipes.ts`, are read only by the server, which brews.

## Deploy

Merging to `main` deploys. The workflow SSHes to the irmahs.dev server and resets `/srv/minigames` to `main`; there, with `compose.prod.yaml`, Postgres starts, pending migrations run, and the site is rebuilt and started. It joins the shared `proxy` network as `minigames`, where it also reaches the account service as `auth:3001`. Caddy in [irmahs-labs/proxy](https://github.com/irmahs-labs/proxy) serves it at minigames.irmahs.dev, WebSockets included.

Secrets (Settings → Secrets and variables → Actions):

| Secret | What |
| --- | --- |
| `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST` | Organization level, shared with the other repos |
| `MINIGAMES_POSTGRES_PASSWORD` | The database's password (the leaderboard, the recipe book and the sticky board), `openssl rand -base64 32`. Read only when the database is first created |

### First setup (one time)

1. Cloudflare: `A` and `AAAA` records for `minigames` pointing at the server, **DNS only**.
2. On the server, as the admin user: `sudo mkdir /srv/minigames && sudo chown deploy:deploy /srv/minigames`.
3. Merge the `minigames.irmahs.dev` block in irmahs-labs/proxy's `caddy/Caddyfile`.
4. Add the `MINIGAMES_POSTGRES_PASSWORD` secret above.
5. Merge here; the deploy clones the repo into `/srv/minigames` and starts the database and the site.

## License

MIT
