import { describe, expect, it } from "vitest";

import { GUITAR_CHORDS, getGuitarChord } from "@/lib/guitar-chords";

describe("getGuitarChord", () => {
  it("returns shapes for common chords", () => {
    expect(getGuitarChord("C")?.name).toBe("C");
    expect(getGuitarChord("G")?.name).toBe("G");
    expect(getGuitarChord("D")?.name).toBe("D");
    expect(getGuitarChord("Am")?.name).toBe("Am");
    expect(getGuitarChord("Em")?.name).toBe("Em");
  });

  it("returns null for unknown chords", () => {
    expect(getGuitarChord("Zmaj13")).toBeNull();
  });

  it("normalizes 'min' suffix to 'm'", () => {
    expect(getGuitarChord("Amin")?.name).toBe("Am");
  });

  it("falls back to the base chord when given a slash chord", () => {
    expect(getGuitarChord("C/G")?.name).toBe("C");
  });
});

describe("GUITAR_CHORDS", () => {
  it("has a positions array of six strings for each chord", () => {
    for (const chord of Object.values(GUITAR_CHORDS)) {
      expect(chord.positions).toHaveLength(6);
      for (const position of chord.positions) {
        expect(position.string).toBeGreaterThanOrEqual(1);
        expect(position.string).toBeLessThanOrEqual(6);
      }
    }
  });

  it("includes barre metadata for the F chord", () => {
    expect(GUITAR_CHORDS.F.barres).toEqual([{ fret: 1, fromString: 6, toString: 1 }]);
  });
});
