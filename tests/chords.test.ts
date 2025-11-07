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

  it("transposes slash chords", () => {
    const lines = parseLyrics("[G/B]Line");
    const up = transposeLines(lines, 1);
    expect(up[0].chords[0].chord).toBe("G#/C");

    const down = transposeLines(lines, -2);
    expect(down[0].chords[0].chord).toBe("F/A");
  });

  it("transposes extended chords with bass", () => {
    const lines = parseLyrics("[Gmaj7/B]Line");
    const up = transposeLines(lines, 1);
    expect(up[0].chords[0].chord).toBe("G#maj7/C");

    const down = transposeLines(lines, -1);
    expect(down[0].chords[0].chord).toBe("F#maj7/A#");
  });
});

describe("buildChordDisplay", () => {
  it("aligns chords above lyrics", () => {
    const lines = parseLyrics("[G]Amazing [C]grace");
    const display = buildChordDisplay(lines[0]);
    expect(display.trim()).toBe("G       C");
  });
});

