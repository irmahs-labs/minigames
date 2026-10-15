# Mini Games

Small games to play in the browser, at [minigames.irmahs.dev](https://minigames.irmahs.dev).

## Games

**Wheel of Fortune.** Make a wheel, fill it in and spin it. When it stops, it beeps and a popup names the slice it landed on.

Each tab is one of your wheels: it starts as "Wheel 1" with four empty slots to type names into, and you can add up to eight, each with its own name and 2 to 16 slices. **Reset** clears the open wheel back to four empty slots. To start from something, fill a wheel with an example:

| Example | Slices |
| --- | --- |
| Promotion | Free, 10% off, 20% off, 50% off, Free shipping, Buy one get one, Mystery gift, Try again |
| Death | Asteroid impact, Supervolcano, Black smoke, Megaquake, Tsunami, Ice age, Solar flare, Plague, Drought, Wildfire, Flood |
| Luck | Good and bad omens in turn: Four-leaf clover, Black cat, Horseshoe, Broken mirror, Shooting star, Under a ladder, Lucky penny, Friday the 13th |

Everything is saved in the browser's `localStorage` and stays until the visitor deletes it or clears their site data. Nothing is sent anywhere.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173
npm test
npm run build     # the static site in dist/
```

There is no backend: the site is plain files, served in production by a small Caddy container (`Dockerfile`, `deploy/Caddyfile`).

## Deploy

Merging to `main` deploys. The workflow SSHes to the irmahs.dev server, resets `/srv/minigames` to `main`, and rebuilds the container, which joins the shared `proxy` network as `minigames`. Caddy in [irmahs-labs/proxy](https://github.com/irmahs-labs/proxy) serves it at minigames.irmahs.dev.

It uses the same three Actions secrets as the other repos: `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST`.

### First setup (one time)

1. Cloudflare: `A` and `AAAA` records for `minigames` pointing at the server, **DNS only**.
2. On the server, as the admin user: `sudo mkdir /srv/minigames && sudo chown deploy:deploy /srv/minigames`.
3. Merge the `minigames.irmahs.dev` block in irmahs-labs/proxy's `caddy/Caddyfile`.
4. Merge here; the deploy clones the repo into `/srv/minigames` and starts the container.

## License

MIT
