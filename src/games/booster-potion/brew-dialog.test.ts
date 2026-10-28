import { describe, expect, it } from "vitest";

import type { FoundPage } from "./api";
import { bylinesOf, neededOf, sharedView } from "./brew-dialog";

const page: FoundPage = {
  at: "2026-10-28T10:00:00.000Z",
  by: "Alexandre L.",
  ingredients: ["Jujube", "Dried ginger"],
  last: null,
  name: "Autumn Hearth",
  note: "",
  others: 0,
  source: "https://example.com",
  state: "found",
  yours: true,
};

describe("bylinesOf", () => {
  it("dates the first brew, and says when nobody has brewed it since", () => {
    expect(bylinesOf(page)).toEqual({
      first: "First brewed by Alexandre L. on 28 Oct 2026",
      last: "Last brewed by no one",
    });
  });

  it("counts the others and names the last brewer", () => {
    expect(
      bylinesOf({
        ...page,
        last: { at: "2026-10-29T10:00:00.000Z", name: "Ben C." },
        others: 3,
      })
    ).toEqual({
      first: "First brewed by Alexandre L. on 28 Oct 2026, and 3 more",
      last: "Last brewed by Ben C. on 29 Oct 2026",
    });
  });
});

describe("neededOf", () => {
  it("counts the kinds a potion still needs", () => {
    expect(neededOf(["spice"])).toBe("a spice");
    expect(neededOf(["fruit", "dried spice"])).toBe(
      "a fruit and a dried spice"
    );
    expect(neededOf(["fruit", "fruit", "sweetener"])).toBe(
      "two fruits and a sweetener"
    );
  });
});

const mystery = (shared: number, missing: string[]) =>
  sharedView({
    closest: { missing, name: "Ember's Embrace", needs: 4, shared },
    size: 4,
    type: "mystery",
    wrongForm: null,
  }).lines;

describe("the mystery hint", () => {
  it("says how many are in the closest potion, and the kinds it still needs", () => {
    expect(mystery(2, ["fruit", "spice"])).toEqual([
      "2 of these 4 are in Ember's Embrace. It still needs a fruit and a spice.",
    ]);
    expect(mystery(3, ["spice"])).toEqual([
      "So close! 3 of these 4 are in Ember's Embrace. It still needs a spice.",
    ]);
  });
});
