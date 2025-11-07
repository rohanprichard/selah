import { Chord, Interval } from "@tonaljs/tonal";

export type ParsedChord = {
  chord: string;
  position: number;
};

export type ParsedLine = {
  lyrics: string;
  chords: ParsedChord[];
};

export type ParsedSection = {
  id: string;
  label: string;
  type: string;
  lines: ParsedLine[];
};

export function parseLyrics(lyrics: string): ParsedLine[] {
  const lines = lyrics.split(/\r?\n/);

  return lines.map((line) => parseLine(line));
}

function parseLine(line: string): ParsedLine {
  const chords: ParsedChord[] = [];
  let lyrics = "";
  let insideChord = false;
  let chordBuffer = "";
  let position = 0;

  for (const char of line) {
    if (char === "[") {
      insideChord = true;
      chordBuffer = "";
      continue;
    }

    if (char === "]" && insideChord) {
      insideChord = false;
      const chord = chordBuffer.trim();
      if (chord) {
        chords.push({ chord, position: Math.max(0, position) });
      }
      continue;
    }

    if (insideChord) {
      chordBuffer += char;
    } else {
      lyrics += char;
      position += 1;
    }
  }

  return {
    lyrics: lyrics.replace(/\s+$/g, ""),
    chords,
  };
}

export function transposeLines(lines: ParsedLine[], semitones: number): ParsedLine[] {
  if (semitones === 0) return lines;

  return lines.map((line) => ({
    ...line,
    chords: line.chords.map((entry) => ({
      ...entry,
      chord: transposeChord(entry.chord, semitones),
    })),
  }));
}

function transposeChord(chord: string, semitones: number): string {
  if (!semitones) return chord;

  const interval = Interval.fromSemitones(semitones);
  if (!interval) return chord;

  const transposed = Chord.transpose(chord, interval);
  if (transposed) {
    return transposed;
  }

  // Attempt to transpose slash chords manually
  if (chord.includes("/")) {
    const [base, bass] = chord.split("/");
    const transposedBase = Chord.transpose(base, interval) || transposeSimple(base, semitones);
    const transposedBass = transposeSimple(bass, semitones);
    if (transposedBase && transposedBass) {
      return `${transposedBase}/${transposedBass}`;
    }
  }

  const fallback = transposeSimple(chord, semitones);
  return fallback || chord;
}

const NOTE_ORDER = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

function transposeSimple(chord: string | undefined, semitones: number): string | undefined {
  if (!chord) return chord;
  const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return chord;
  const [, root, suffix] = match;
  const currentIndex = NOTE_ORDER.indexOf(normalizeSharp(root));
  if (currentIndex === -1) return chord;
  const newIndex = (currentIndex + semitones + NOTE_ORDER.length) % NOTE_ORDER.length;
  const newRoot = NOTE_ORDER[newIndex];
  return `${newRoot}${suffix}`;
}

function normalizeSharp(note: string): string {
  const flats: Record<string, string> = {
    Bb: "A#",
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
  };
  return flats[note] || note;
}

export function buildChordDisplay(line: ParsedLine): string {
  if (line.chords.length === 0) {
    return "";
  }

  const length = Math.max(line.lyrics.length, ...line.chords.map((entry) => entry.position + entry.chord.length));
  const chars = Array.from({ length }, () => " ");

  for (const { chord, position } of line.chords) {
    const start = Math.max(0, Math.min(position, chars.length - 1));
    for (let i = 0; i < chord.length && start + i < chars.length; i += 1) {
      chars[start + i] = chord[i];
    }
  }

  return chars.join("").replace(/\s+$/g, "");
}

