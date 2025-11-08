import { Note } from "@tonaljs/tonal";

export function calculateInitialTranspose(originalKey: string, targetKey: string | null): number {
  if (!targetKey || targetKey === originalKey) {
    return 0;
  }

  const originalMidi = Note.midi(originalKey);
  const targetMidi = Note.midi(targetKey);

  if (originalMidi === null || targetMidi === null) {
    return 0;
  }

  let difference = targetMidi - originalMidi;
  while (difference > 6) difference -= 12;
  while (difference < -6) difference += 12;
  return difference;
}
