import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

describe("the proxy entry point", () => {
  test("exports the Next.js proxy function", () => {
    const source = readFileSync("proxy.ts", "utf8");

    expect(source).toContain("export async function proxy");
  });
});
