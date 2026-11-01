import { describe, expect, it } from "vitest";
import { hamsterMarkup } from "../src/art/hamster";

// The rig finds the hamster's parts by name, so the drawing must keep them.
describe("hamster drawing", () => {
  const svg = hamsterMarkup();

  it("has every part the rig moves", () => {
    for (const part of ["head", "ear", "tail", "eye", "pupil", "swirl", "pouch", "tummy", "mouth", "leg-0", "leg-1", "leg-2", "leg-3"]) {
      expect(svg).toContain(`data-part="${part}"`);
    }
  });

  it("has every expression and prop the rig shows or hides", () => {
    for (const id of ["ham-body", "eye-open", "eye-closed", "eye-happy", "eye-grumpy", "eye-swirl", "held-bean", "question"]) {
      expect(svg).toContain(`id="${id}"`);
    }
  });

  it("draws the head facing the viewer and in profile, with every expression in both", () => {
    expect(svg).toContain('id="head-front"');
    expect(svg).toContain('id="head-side"');
    for (const style of ["open", "closed", "happy", "grumpy", "swirl"]) {
      expect(svg.match(new RegExp(`data-eye="${style}"`, "g"))?.length).toBe(2);
    }
  });

  it("gives every turning or scaling part a pivot", () => {
    const parts = [...svg.matchAll(/data-part="([^"]+)"( data-pivot="[-\d. ]+")?/g)];
    const unpivoted = parts.filter((m) => !m[2] && m[1] !== "pupil").map((m) => m[1]);
    expect(unpivoted).toEqual([]);
  });
});
