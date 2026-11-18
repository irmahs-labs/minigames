// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Board } from "./board";
import { newGame } from "./rules";

// React's flag for act(), as a test runner sets it
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

afterEach(() => {
  document.body.innerHTML = "";
});

/** The board drawn with the starting position, White to move */
const show = (locked = false) => {
  const onMove = vi.fn();
  const page = document.createElement("div");

  document.body.append(page);
  act(() =>
    createRoot(page).render(
      <Board
        game={newGame()}
        theme="matcha"
        movable={["white"]}
        locked={locked}
        onMove={onMove}
      />
    )
  );

  const square = (name: string) => {
    const found = page.querySelector(`[data-square="${name}"]`);

    if (!(found instanceof HTMLButtonElement)) {
      throw new TypeError(`No square ${name}`);
    }

    return found;
  };

  const tap = (name: string) => act(() => square(name).click());

  return { onMove, page, square, tap };
};

describe("the board", () => {
  it("names every square and what stands on it", () => {
    const { square } = show();

    expect(square("d1").getAttribute("aria-label")).toBe(
      "d1, Cream Khun (king)"
    );
    expect(square("e8").getAttribute("aria-label")).toBe(
      "e8, Green Khun (king)"
    );
    expect(square("c4").getAttribute("aria-label")).toBe("c4, empty");
  });

  it("shows where a picked piece can go", () => {
    const { square, tap } = show();

    tap("c3");

    expect(square("c3").getAttribute("aria-pressed")).toBe("true");
    expect(square("c4").getAttribute("aria-label")).toBe("c4, empty, a move");
  });

  it("asks for a second tap before it plays", () => {
    const { onMove, page, tap } = show();

    tap("c3");
    tap("c4");
    expect(onMove).not.toHaveBeenCalled();
    expect(page.textContent).toContain("Tap c4 again to play there");

    tap("c4");
    expect(onMove).toHaveBeenCalledWith({ from: 18, to: 26 });
  });

  it("lets nothing move while locked", () => {
    const { onMove, square, tap } = show(true);

    tap("c3");
    tap("c4");
    tap("c4");

    expect(onMove).not.toHaveBeenCalled();
    expect(square("c3").getAttribute("aria-pressed")).toBe("false");
  });

  it("only picks the pieces of the side to move", () => {
    const { square, tap } = show();

    tap("c6");

    expect(square("c6").getAttribute("aria-pressed")).toBe("false");
  });
});
