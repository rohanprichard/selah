import { describe, expect, test } from "vitest";

import { parseSongLibraryParams } from "@/lib/song-library";

describe("parseSongLibraryParams", () => {
  test("uses the first page and no key for invalid values", () => {
    expect(parseSongLibraryParams({ page: "-2", key: "bad" })).toMatchObject({ page: 1, key: "" });
  });

  test("trims the query and keeps a valid page", () => {
    expect(parseSongLibraryParams({ q: " Grace ", page: "2" })).toMatchObject({ query: "Grace", page: 2 });
  });

  test("accepts a valid musical key", () => {
    expect(parseSongLibraryParams({ key: "D" })).toMatchObject({ key: "D" });
  });
});
