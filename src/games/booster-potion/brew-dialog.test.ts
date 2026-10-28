import { describe, expect, it } from "vitest";

import type { FoundPage } from "./api";
import { bylinesOf } from "./brew-dialog";

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
