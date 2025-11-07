import { Chord, Interval, Note } from "@tonaljs/tonal";

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

  const slashSplit = chord.split("/");
  const basePart = slashSplit[0];
  const bassPart = slashSplit[1];

  const {
    name,
    tonic,
  } = Chord.get(basePart);

  if (name && tonic) {
    const transposedRoot = Note.transpose(tonic, interval);
    const suffix = basePart.slice(tonic.length);
    const parts: string[] = [];

    if (transposedRoot) {
      const normalizedRoot = normalizePitch(transposedRoot);
      parts.push(`${normalizedRoot}${suffix}`);
      if (bassPart) {
        const transposedBass = Note.transpose(bassPart, interval);
        const normalizedBass = transposedBass ? normalizePitch(transposedBass) : bassPart;
        parts.push(normalizedBass);
        return parts.join("/");
      }
      return parts[0];
    }
  }

  if (bassPart) {
    const transposedBase = Note.transpose(basePart, interval);
    const normalizedBase = transposedBase ? normalizePitch(transposedBase) : basePart;
    const transposedBass = Note.transpose(bassPart, interval);
    const normalizedBass = transposedBass ? normalizePitch(transposedBass) : bassPart;
    return `${normalizedBase}/${normalizedBass}`;
  }

  const transposedSingle = Note.transpose(basePart, interval);
  return transposedSingle ? normalizePitch(transposedSingle) : chord;
}

const FLAT_TO_SHARP: Record<string, string> = {
  Bb: "A#",
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
};

function normalizePitch(note: string): string {
  const match = note.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return note;
  const [, pitch, rest] = match;
  const normalized = FLAT_TO_SHARP[pitch] ?? pitch;
  return `${normalized}${rest}`;
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

