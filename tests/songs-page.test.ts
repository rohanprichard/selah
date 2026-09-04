import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

const source = readFileSync("app/songs/page.tsx", "utf8");

describe("the song library page", () => {
  test("uses the song-library parameter helper", () => {
    expect(source).toContain('from "@/lib/song-library"');
  });

  test("shows the song results without a search prompt", () => {
    expect(source).not.toContain("function SearchPrompt");
    expect(source).not.toContain("!hasFilters ?");
  });
});
