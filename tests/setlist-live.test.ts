import { describe, expect, test } from "vitest";

import { getAdjacentEntryId, getLiveSetlistPath } from "@/lib/setlist-live";

describe("getAdjacentEntryId", () => {
  test("selects the first entry when no entry is current", () => {
    expect(getAdjacentEntryId(["a", "b"], null, 1)).toBe("a");
  });

  test("moves to the next entry", () => {
    expect(getAdjacentEntryId(["a", "b"], "a", 1)).toBe("b");
  });

  test("keeps the last entry when next would exceed the list", () => {
    expect(getAdjacentEntryId(["a", "b"], "b", 1)).toBe("b");
  });

  test("moves to the previous entry", () => {
    expect(getAdjacentEntryId(["a", "b"], "b", -1)).toBe("a");
  });

  test("keeps the first entry when previous would exceed the list", () => {
    expect(getAdjacentEntryId(["a", "b"], "a", -1)).toBe("a");
  });
});

describe("getLiveSetlistPath", () => {
  test("creates an authenticated live-mode path", () => {
    expect(getLiveSetlistPath({ setlistId: "set", currentEntryId: "a" })).toBe(
      "/setlists/set?live=true&current=a",
    );
  });

  test("creates a shared live-mode path", () => {
    expect(getLiveSetlistPath({ shareToken: "share", currentEntryId: null })).toBe(
      "/s/share?live=true",
    );
  });
});
