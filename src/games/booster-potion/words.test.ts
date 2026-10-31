import { describe, expect, it } from "vitest";

import { clueLabel, countedKind, ingredientName, partLabel } from "./words";

describe("the game's words in French", () => {
  it("names the ingredients, in their forms", () => {
    expect(ingredientName("Lemon", "fr")).toBe("Citron");
    expect(partLabel("Fresh ginger", "fr")).toBe("Gingembre frais");
    expect(partLabel("Dried mint", "fr")).toBe("Menthe séchée");
    expect(partLabel("Turmeric powder", "fr")).toBe("Curcuma en poudre");
    expect(partLabel("Apple cider vinegar", "fr")).toBe("Vinaigre de cidre");
  });

  it("reads a clue shelf by shelf", () => {
    expect(clueLabel("fruit + dried spice + sweetener", "fr")).toBe(
      "fruit + épice séchée + sucrant"
    );
    expect(clueLabel("fresh herb + tea", "fr")).toBe("herbe fraîche + thé");
  });

  it("leaves English as the server wrote it", () => {
    expect(partLabel("Fresh ginger", "en")).toBe("Fresh ginger");
    expect(clueLabel("fruit + dried spice", "en")).toBe("fruit + dried spice");
  });
});

describe("counting shelves in French", () => {
  it("agrees the article and the plural with the shelf", () => {
    expect(countedKind("dried spice", 1)).toBe("une épice séchée");
    expect(countedKind("fruit", 2)).toBe("deux fruits");
    expect(countedKind("fresh herb", 2)).toBe("deux herbes fraîches");
    expect(countedKind("spice", 3)).toBe("trois épices");
  });
});
