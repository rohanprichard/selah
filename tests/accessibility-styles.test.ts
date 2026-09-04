import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

const styles = readFileSync("app/globals.css", "utf8");

describe("global access styles", () => {
  test("shows a keyboard focus indicator", () => {
    expect(styles).toContain("focus-visible");
  });

  test("reduces motion when the device requests it", () => {
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });
});
