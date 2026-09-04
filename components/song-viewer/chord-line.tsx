import { ChordTooltip } from "@/components/chords/chord-tooltip";
import type { ParsedChord } from "@/lib/chords";

export function ChordLine({ chords, idPrefix }: { chords: ParsedChord[]; idPrefix: string }) {
  return (
    <div className="chord-line text-primary/90 select-none print:text-black mb-0.5 h-[1.5em] relative">
      {chords.map((chordEntry, chordIndex) => (
        <div
          key={`${idPrefix}-chord-${chordIndex}`}
          className="absolute top-0"
          style={{ left: `${chordEntry.position}ch` }}
        >
          <ChordTooltip chord={chordEntry.chord}>{chordEntry.chord}</ChordTooltip>
        </div>
      ))}
    </div>
  );
}
