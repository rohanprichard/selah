import { describe, expect, it } from "vitest";

import {
  KEY_OPTIONS,
  MUSICAL_KEYS,
  SECTION_TYPES,
  normalizeMusicalKey,
} from "@/lib/constants/music";

describe("normalizeMusicalKey", () => {
  it("returns valid keys unchanged", () => {
    expect(normalizeMusicalKey("C")).toBe("C");
    expect(normalizeMusicalKey("F#")).toBe("F#");
  });

  it("normalizes enharmonic equivalents", () => {
    expect(normalizeMusicalKey("Db")).toBe("C#");
    expect(normalizeMusicalKey("Eb")).toBe("D#");
    expect(normalizeMusicalKey("Gb")).toBe("F#");
    expect(normalizeMusicalKey("Ab")).toBe("G#");
    expect(normalizeMusicalKey("Bb")).toBe("A#");
  });

  it("returns undefined for invalid keys", () => {
    expect(normalizeMusicalKey("H")).toBeUndefined();
    expect(normalizeMusicalKey("Xb")).toBeUndefined();
  });

  it("returns undefined for null or undefined input", () => {
    expect(normalizeMusicalKey(null)).toBeUndefined();
    expect(normalizeMusicalKey(undefined)).toBeUndefined();
    expect(normalizeMusicalKey("")).toBeUndefined();
  });

  it("trims whitespace before normalizing", () => {
    expect(normalizeMusicalKey(" C# ")).toBe("C#");
  });
});

describe("SECTION_TYPES", () => {
  it("contains all expected section types", () => {
    expect(SECTION_TYPES).toEqual([
      "verse",
      "chorus",
      "pre-chorus",
      "bridge",
      "refrain",
      "intro",
      "outro",
      "instrumental",
      "tag",
      "label",
    ]);
  });
});

describe("KEY_OPTIONS", () => {
  it("has an entry for every musical key", () => {
    expect(KEY_OPTIONS).toHaveLength(MUSICAL_KEYS.length);
    for (const key of MUSICAL_KEYS) {
      expect(KEY_OPTIONS.some((option) => option.value === key)).toBe(true);
    }
  });

  it("labels sharp keys with their flat equivalent", () => {
    const dSharp = KEY_OPTIONS.find((option) => option.value === "D#");
    expect(dSharp?.label).toBe("D# / Eb");
  });
});
