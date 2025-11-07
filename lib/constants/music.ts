export const MUSICAL_KEYS = [
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

export const ENHARMONIC_EQUIVALENTS: Record<string, MusicalKey> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

export const KEY_OPTIONS: { value: MusicalKey; label: string }[] = [
  { value: "C", label: "C" },
  { value: "C#", label: "C# / Db" },
  { value: "D", label: "D" },
  { value: "D#", label: "D# / Eb" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "F#", label: "F# / Gb" },
  { value: "G", label: "G" },
  { value: "G#", label: "G# / Ab" },
  { value: "A", label: "A" },
  { value: "A#", label: "A# / Bb" },
  { value: "B", label: "B" },
];

export function normalizeMusicalKey(value: string | null | undefined): MusicalKey | undefined {
  if (!value) return undefined;
  const upper = value.trim();
  const normalized = ENHARMONIC_EQUIVALENTS[upper] ?? upper;
  return MUSICAL_KEYS.includes(normalized as MusicalKey) ? (normalized as MusicalKey) : undefined;
}

