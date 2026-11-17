// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GAMES } from "../games";
import { QUIZZES } from "../games/quizzes/all-quizzes";
import { GameHeader } from "./game-header";

// The account pill asks who is signed in: nobody, here
vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue(Response.json({ account: null }))
);

// React's flag for act(), as a test runner sets it
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

afterEach(() => {
  document.body.innerHTML = "";
});

/** The header as the page draws it, to look through. */
const drawn = (slug: string, here?: string) => {
  const page = document.createElement("div");

  document.body.append(page);
  act(() => createRoot(page).render(<GameHeader slug={slug} here={here} />));

  return page;
};

const hrefs = (links: NodeListOf<Element>) =>
  [...links].map((link) => link.getAttribute("href"));

describe("GameHeader", () => {
  it("names the game, with a tab of its own and the way back before it", () => {
    const page = drawn("the-arena");

    expect(page.querySelector("h1")?.textContent).toBe("The Arena");
    expect(hrefs(page.querySelectorAll(".game-tabs a"))).toEqual([
      "/",
      "/the-arena",
    ]);
    expect(
      page.querySelector('.game-tabs [aria-current="page"]')?.textContent
    ).toBe("The Arena");
  });

  it("keeps the header to the game's name and the shared pills", () => {
    const back = [
      ...drawn("the-arena").querySelectorAll("header a[href='/']"),
    ].filter((link) => !link.closest("dialog"));

    expect(back).toEqual([]);
  });

  it("gives Quizzes a tab per quiz, the open one marked", () => {
    const page = drawn("quizzes", "what-type-of-witch");

    expect(hrefs(page.querySelectorAll(".game-tabs a"))).toEqual([
      "/",
      "/quizzes",
      "/quizzes/what-type-of-witch",
      "/quizzes/are-they-your-life-partner",
    ]);
    expect(
      page
        .querySelector('.game-tabs [aria-current="page"]')
        ?.getAttribute("href")
    ).toBe("/quizzes/what-type-of-witch");
  });

  it("lists every game and every quiz in the phone's menu", () => {
    const menu = hrefs(
      drawn("wheel-of-fortune").querySelectorAll(".game-drawer a")
    );

    for (const game of GAMES) {
      expect(menu).toContain(`/${game.slug}`);
    }

    expect(menu).toContain("/quizzes/are-they-your-life-partner");
  });
});

describe("the Quizzes tabs", () => {
  it("name every quiz there is, and nothing else", () => {
    const quizzes = GAMES.find((game) => game.slug === "quizzes");

    expect(
      quizzes?.pages?.filter((page) => page.slug).map((page) => page.slug)
    ).toEqual(QUIZZES.map((quiz) => quiz.slug));
  });
});
