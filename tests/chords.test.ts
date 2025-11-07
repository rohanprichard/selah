import { describe, expect, it } from "vitest";

import { buildChordDisplay, parseLyrics, transposeLines } from "@/lib/chords";

describe("parseLyrics", () => {
  it("extracts chords and lyrics positions", () => {
    const lines = parseLyrics("[G]Amazing [C]grace");
    expect(lines).toHaveLength(1);
    expect(lines[0].lyrics).toBe("Amazing grace");
    expect(lines[0].chords).toEqual([
      { chord: "G", position: 0 },
      { chord: "C", position: 8 },
    ]);
  });
});

describe("transposeLines", () => {
  it("transposes chords by semitones", () => {
    const lines = parseLyrics("[G]Amazing");
    const transposed = transposeLines(lines, 2);
    expect(transposed[0].chords[0].chord).toBe("A");
  });
});

describe("buildChordDisplay", () => {
  it("aligns chords above lyrics", () => {
    const lines = parseLyrics("[G]Amazing [C]grace");
    const display = buildChordDisplay(lines[0]);
    expect(display.trim()).toBe("G       C");
  });
});

