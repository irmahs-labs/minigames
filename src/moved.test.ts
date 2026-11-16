import { describe, expect, it } from "vitest";

import { REALMS, bookFragment, movedTo } from "./moved";

/** Reads a fragment back as Realms does (its carry-over.ts). */
const readBack = (fragment: string) => {
  const text = fragment
    .slice("#book=".length)
    .replaceAll("-", "+")
    .replaceAll("_", "/");

  return new TextDecoder().decode(
    Uint8Array.from(atob(text), (char) => char.codePointAt(0) ?? 0)
  );
};

describe("movedTo", () => {
  it("sends each moved game to its page on Realms", () => {
    expect(movedTo("/booster-potion", null)).toBe(
      `${REALMS}/book-of-shadows/potion-brewing`
    );
    expect(movedTo("/spell-creator", null)).toBe(
      `${REALMS}/book-of-shadows/spell-creator`
    );
    expect(movedTo("/book-of-shadows", null)).toBe(`${REALMS}/book-of-shadows`);
  });

  it("carries the saved book along to the Book of Shadows only", () => {
    const saved = JSON.stringify({ profile: { name: "Zoé" } });

    expect(movedTo("/book-of-shadows", saved)).toBe(
      `${REALMS}/book-of-shadows${bookFragment(saved)}`
    );
    expect(movedTo("/spell-creator", saved)).toBe(
      `${REALMS}/book-of-shadows/spell-creator`
    );
  });

  it("leaves every other page here", () => {
    expect(movedTo("/quizzes/witch", null)).toBeNull();
    expect(movedTo("/wheel-of-fortune", null)).toBeNull();
  });
});

describe("bookFragment", () => {
  it("keeps the book exactly, accents and all, in base64url", () => {
    const saved = JSON.stringify({ profile: { name: "Zoé Ðặng ✨" } });
    const fragment = bookFragment(saved);

    expect(fragment).toMatch(/^#book=[\w-]+$/u);
    expect(readBack(fragment)).toBe(saved);
  });

  it("carries nothing when there is no book, or none worth reading", () => {
    expect(bookFragment(null)).toBe("");
    expect(bookFragment("")).toBe("");
    expect(bookFragment("{broken")).toBe("");
    expect(bookFragment("[1, 2]")).toBe("");
    expect(bookFragment('"text"')).toBe("");
  });
});
