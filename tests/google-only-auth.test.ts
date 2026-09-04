import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

describe("the Google-only account flow", () => {
  test("sends password pages to Google sign-in", () => {
    const passwordPages = [
      "app/auth/forgot-password/page.tsx",
      "app/auth/update-password/page.tsx",
    ];

    for (const file of passwordPages) {
      const source = readFileSync(file, "utf8");

      expect(source).toContain('redirect("/auth/login")');
    }
  });

  test("does not accept email confirmation links", () => {
    const source = readFileSync("app/auth/confirm/route.ts", "utf8");

    expect(source).toContain("/auth/login");
    expect(source).not.toContain("verifyOtp");
  });

  test("does not keep password reset components", () => {
    for (const file of [
      "components/forgot-password-form.tsx",
      "components/update-password-form.tsx",
    ]) {
      expect(() => readFileSync(file, "utf8")).toThrow();
    }
  });
});
