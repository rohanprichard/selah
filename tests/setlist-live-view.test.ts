import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

const source = readFileSync("components/setlists/setlist-live-view.tsx", "utf8");

describe("the live setlist view", () => {
  test("uses the live-mode route helper", () => {
    expect(source).toContain('from "@/lib/setlist-live"');
    expect(source).toContain("getAdjacentEntryId");
  });

  test("does not read the window during render", () => {
    expect(source).not.toContain("window.matchMedia");
  });

  test("has visible previous and next controls", () => {
    expect(source).toContain('aria-label="Show previous song"');
    expect(source).toContain('aria-label="Show next song"');
  });
});
