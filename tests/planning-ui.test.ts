import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

const hero = readFileSync("components/hero.tsx", "utf8");
const setlistPage = readFileSync("app/setlists/page.tsx", "utf8");
const createSetlistForm = readFileSync("components/setlists/create-setlist-form.tsx", "utf8");

describe("planning user interface", () => {
  test("uses factual landing-page copy", () => {
    expect(hero).not.toContain("The new standard for worship teams");
    expect(hero).not.toContain("Trusted by worship leaders worldwide");
  });

  test("introduces the setlist workspace before the form", () => {
    expect(setlistPage).toContain("Plan a service with your team");
  });

  test("connects each setlist label to its field", () => {
    expect(createSetlistForm).toContain('htmlFor="setlist-title"');
    expect(createSetlistForm).toContain('id="setlist-description"');
  });
});
