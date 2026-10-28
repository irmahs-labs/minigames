import { describe, expect, it } from "vitest";

import {
  bookOf,
  brew,
  clueOf,
  foundPageOf,
  shelvedPartsOf,
  soloBookOf,
} from "./brewing";
import { RECIPES } from "./recipes";
import type { Recipe } from "./recipes";
import { EMPTY, choose, setForm } from "./rules";
import type { Selection } from "./rules";

const pick = (...names: string[]) => {
  let selection: Selection = EMPTY;

  for (const name of names) {
    selection = choose(selection, name);
  }

  return selection;
};

const NOBODY = new Set<string>();

const bookOfOne = () =>
  soloBookOf(new Map([["Ember's Embrace", "2026-10-22T12:00:00.000Z"]]));

const EVERYTHING = new Set(RECIPES.map((recipe) => recipe.name));

const recipe = (name: string): Recipe => {
  const found = RECIPES.find((r) => r.name === name);

  if (!found) {
    throw new Error(`No recipe called ${name}`);
  }

  return found;
};

describe("brew", () => {
  it("makes the potion whose ingredients are in, in any order", () => {
    expect(brew(pick("Cayenne", "Ginger", "Lime", "Apple"), NOBODY)).toEqual({
      recipe: recipe("Ember's Embrace"),
      type: "potion",
    });
  });

  it("makes a shot with fresh ginger and a tea with dried", () => {
    const shot = pick("Lemon", "Ginger", "Honey");
    const tea = setForm(shot, "Ginger", "dried");

    expect(brew(shot, NOBODY)).toMatchObject({
      recipe: { name: "Bright Spark" },
    });
    expect(brew(tea, NOBODY)).toMatchObject({
      recipe: { name: "Fireside Tea" },
    });
  });

  it("makes a potion someone else found first", () => {
    expect(
      brew(pick("Apple", "Lime", "Ginger", "Cayenne"), EVERYTHING)
    ).toEqual({ recipe: recipe("Ember's Embrace"), type: "potion" });
  });

  it("says which form to change when only the forms are wrong", () => {
    // Autumn Hearth takes dried ginger; this is fresh.
    expect(brew(pick("Jujube", "Ginger"), NOBODY)).toMatchObject({
      type: "mystery",
      wrongForm: { name: "Autumn Hearth", wanted: ["Dried ginger"] },
    });
  });

  it("hints at the unfound potion sharing the most ingredients", () => {
    // Apple, Lime and Ginger are in Ember's Embrace; Mint is not.
    expect(brew(pick("Apple", "Lime", "Ginger", "Mint"), NOBODY)).toEqual({
      closest: {
        missing: ["spice"],
        name: "Ember's Embrace",
        needs: 4,
        shared: 3,
      },
      size: 4,
      type: "mystery",
      wrongForm: null,
    });
  });

  it("leaves potions somebody has found out of the hint", () => {
    const found = new Set(["Ember's Embrace"]);

    expect(
      brew(pick("Apple", "Lime", "Ginger", "Mint"), found)
    ).not.toMatchObject({ closest: { name: "Ember's Embrace" } });
  });

  it("gives no hint when every potion is found", () => {
    expect(brew(pick("Kale", "Mango", "Rosemary"), EVERYTHING)).toEqual({
      closest: null,
      size: 3,
      type: "mystery",
      wrongForm: null,
    });
  });
});

describe("the book's pages", () => {
  it("lists ingredients shelf by shelf, alphabetically on each", () => {
    expect(
      shelvedPartsOf(recipe("Spice Road")).map((part) => part.name)
    ).toEqual(["Black tea", "Cardamom", "Cinnamon", "Ginger"]);
    expect(
      shelvedPartsOf(recipe("Ember's Embrace")).map((part) => part.name)
    ).toEqual(["Apple", "Lime", "Cayenne", "Ginger"]);
  });

  it("gives a locked page the kinds and forms it takes, and nothing more", () => {
    expect(clueOf(recipe("Autumn Hearth"))).toBe("fruit + dried spice");
  });

  it("gives a found page the recipe and who brewed it", () => {
    expect(
      foundPageOf(recipe("Autumn Hearth"), {
        at: "2026-10-28T09:00:00.000Z",
        by: "Irma H.",
        count: 3,
        last: { at: "2026-10-29T09:00:00.000Z", name: "Ben C." },
        yours: true,
      })
    ).toEqual({
      at: "2026-10-28T09:00:00.000Z",
      by: "Irma H.",
      ingredients: ["Jujube", "Dried ginger"],
      last: { at: "2026-10-29T09:00:00.000Z", name: "Ben C." },
      name: "Autumn Hearth",
      note: "Daechu saenggang-cha, Korea's jujube and ginger tea.",
      others: 2,
      source:
        "https://www.uclahealth.org/simms-mann-center/recipes/jujube-ginger-tea",
      state: "found",
      yours: true,
    });
  });

  it("lists every recipe in order, locked until someone brews it", () => {
    const pages = bookOf(
      new Map([
        [
          "Ember's Embrace",
          {
            at: "2026-10-28T09:00:00.000Z",
            by: "Ana L.",
            count: 1,
            last: null,
            yours: false,
          },
        ],
      ])
    );

    expect(pages).toHaveLength(RECIPES.length);
    expect(pages[0]).toMatchObject({ by: "Ana L.", state: "found" });
    expect(pages[1]).toEqual({
      clue: clueOf(recipe("Spark of the Hearth")),
      state: "locked",
    });
    expect(JSON.stringify(pages[1])).not.toContain("Spark of the Hearth");
  });

  it("gives a player's own book the day they found each page", () => {
    const pages = bookOfOne();

    expect(pages[0]).toMatchObject({
      foundAt: "2026-10-22T12:00:00.000Z",
      name: "Ember's Embrace",
      state: "found",
    });
    expect(pages[1]).toMatchObject({ state: "locked" });
  });
});
