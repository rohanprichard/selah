import { Note } from "@tonaljs/tonal";

export function calculateInitialTranspose(originalKey: string, targetKey: string | null): number {
  if (!targetKey || targetKey === originalKey) {
    return 0;
  }

  // Use chroma() which returns 0-11 for pitch classes (C=0, C#=1, D=2, etc.)
  // This works with key names without requiring octave information
  const originalChroma = Note.chroma(originalKey);
  const targetChroma = Note.chroma(targetKey);

  if (originalChroma === undefined || targetChroma === undefined) {
    return 0;
  }

  // Calculate semitone difference
  let difference = targetChroma - originalChroma;
  
  // Normalize to [-6, +6] range (prefer smaller transpositions)
  while (difference > 6) difference -= 12;
  while (difference < -6) difference += 12;
  
  return difference;
}
