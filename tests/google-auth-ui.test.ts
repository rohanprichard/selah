import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

const files = ["components/login-form.tsx", "components/sign-up-form.tsx"];

describe("the Google sign-in interface", () => {
  test("uses the shared Google sign-in button", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");

      expect(source).toContain("GoogleAuthButton");
    }
  });

  test("does not show password or email sign-in fields", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");

      expect(source).not.toContain("signInWithPassword");
      expect(source).not.toContain("signUp({");
      expect(source).not.toContain('type="password"');
      expect(source).not.toContain("signInWithOtp");
    }
  });
});
