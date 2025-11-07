export const MUSICAL_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
] as const;

export type MusicalKey = (typeof MUSICAL_KEYS)[number];

export const SECTION_TYPES = [
  "verse",
  "chorus",
  "pre-chorus",
  "bridge",
  "refrain",
  "intro",
  "outro",
  "instrumental",
  "tag",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

