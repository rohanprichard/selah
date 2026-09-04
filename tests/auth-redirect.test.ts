import { describe, expect, test } from "vitest";

import { getAuthCallbackUrl } from "@/lib/auth-redirect";

describe("getAuthCallbackUrl", () => {
  test("keeps a local destination", () => {
    expect(getAuthCallbackUrl("https://selah.example", "/setlists/today")).toBe(
      "https://selah.example/auth/callback?next=%2Fsetlists%2Ftoday",
    );
  });

  test("uses the song library for an unsafe destination", () => {
    expect(getAuthCallbackUrl("https://selah.example", "//bad.example")).toBe(
      "https://selah.example/auth/callback?next=%2Fmy-songs",
    );
  });
});
