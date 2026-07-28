import { describe, expect, it } from "vitest";

import {
  buildChordDisplay,
  formatSectionsAsLyrics,
  parseLyrics,
  transposeLines,
  type ParsedSection,
} from "@/lib/chords";

describe("parseLyrics edge cases", () => {
  it("handles an empty string", () => {
    const lines = parseLyrics("");
    expect(lines).toEqual([{ lyrics: "", chords: [] }]);
  });

  it("handles multiple lines", () => {
    const lines = parseLyrics("[G]Line one\n[C]Line two\nLine three");
    expect(lines).toHaveLength(3);
    expect(lines[0].lyrics).toBe("Line one");
    expect(lines[1].lyrics).toBe("Line two");
    expect(lines[2].lyrics).toBe("Line three");
    expect(lines[2].chords).toEqual([]);
  });

  it("handles a trailing chord with no lyrics after it", () => {
    const lines = parseLyrics("Amazing grace[G]");
    expect(lines[0].lyrics).toBe("Amazing grace");
    expect(lines[0].chords).toEqual([{ chord: "G", position: 13 }]);
  });
});

describe("transposeLines edge cases", () => {
  it("returns the same lines when transposing by 0 steps", () => {
    const lines = parseLyrics("[G]Amazing");
    const transposed = transposeLines(lines, 0);
    expect(transposed).toBe(lines);
  });

  it("transposes up a full octave (+12) back to the same chord", () => {
    const lines = parseLyrics("[G]Amazing");
    const transposed = transposeLines(lines, 12);
    expect(transposed[0].chords[0].chord).toBe("G");
  });

  it("transposes down a full octave (-12) back to the same chord", () => {
    const lines = parseLyrics("[G]Amazing");
    const transposed = transposeLines(lines, -12);
    expect(transposed[0].chords[0].chord).toBe("G");
  });

  it("transposes minor chords", () => {
    const lines = parseLyrics("[Am]Amazing");
    const up = transposeLines(lines, 2);
    expect(up[0].chords[0].chord).toBe("Bm");

    const down = transposeLines(lines, -2);
    expect(down[0].chords[0].chord).toBe("Gm");
  });
});

describe("formatSectionsAsLyrics edge cases", () => {
  it("formats a single section", () => {
    const sections: ParsedSection[] = [
      {
        id: "verse-1",
        label: "Verse 1",
        type: "verse",
        lines: parseLyrics("[G]Amazing grace"),
      },
    ];

    expect(formatSectionsAsLyrics(sections)).toBe("Verse 1:\n\nAmazing grace");
  });

  it("returns an empty string for an empty sections array", () => {
    expect(formatSectionsAsLyrics([])).toBe("");
  });
});

describe("buildChordDisplay edge cases", () => {
  it("returns an empty string when there are no chords", () => {
    const lines = parseLyrics("Just lyrics, no chords");
    expect(buildChordDisplay(lines[0])).toBe("");
  });

  it("aligns chords over multi-word lyrics", () => {
    const lines = parseLyrics("[G]Amazing [C]grace how [D]sweet the sound");
    const display = buildChordDisplay(lines[0]);
    expect(display.trim()).toBe("G       C         D");
  });
});
