import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { packPronunciations } from "./src/games/spell-creator/pronunciations.ts";
import { APP_NAME } from "./src/lib/brand.ts";

const PRONUNCIATIONS = "virtual:pronunciations";

export default defineConfig({
  build: {
    // Spell Creator's dictionary is one 1.5 MB chunk (about 550 kB as served,
    // compressed), loaded only by that game; everything else is far smaller.
    chunkSizeWarningLimit: 1600,
  },
  plugins: [
    react(),
    // The tab title comes from the same constant as the in-app name, written
    // into the HTML itself so it is right before any script runs.
    {
      name: "app-name",
      transformIndexHtml: {
        handler: (html) => html.replaceAll("%APP_NAME%", APP_NAME),
        order: "pre",
      },
    },
    // Spell Creator's dictionary, packed from the CMU Pronouncing Dictionary
    // at build time. Only the game imports it, so it loads with the game.
    {
      async load(id) {
        if (id !== `\0${PRONUNCIATIONS}`) {
          return null;
        }

        const { dictionary } = await import("cmu-pronouncing-dictionary");

        return `export default ${JSON.stringify(packPronunciations(dictionary))};`;
      },
      name: "pronunciations",
      resolveId: (id) => (id === PRONUNCIATIONS ? `\0${id}` : null),
    },
  ],
  server: {
    // `npm run dev:api` serves /api and /ws on 3002; the browser only ever
    // sees 5173, so the session cookie and every request stay same-origin,
    // as in production.
    proxy: {
      "/api": "http://localhost:3002",
      "/ws": { target: "ws://localhost:3002", ws: true },
    },
  },
  test: {
    environment: "jsdom",
  },
});
