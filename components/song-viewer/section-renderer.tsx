import { Badge } from "@/components/ui/badge";
import type { ParsedSection } from "@/lib/chords";
import { ChordLine } from "./chord-line";

export function SectionRenderer({ section, showChords }: { section: ParsedSection; showChords: boolean }) {
  if (section.type === "label" || section.type === "custom") {
    return (
      <div className="rounded-lg border border-muted bg-muted/30 p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{section.label}</p>
        {section.lines.length > 0 && (
          <div className="mt-2 space-y-1 text-muted-foreground">
            {section.lines.map((line, lineIndex) => (
              <div key={lineIndex} className="whitespace-pre-wrap">
                {line.lyrics || "\u00A0"}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center gap-3 mb-2">
        <Badge variant="secondary" className="uppercase tracking-wider font-bold text-[10px] px-2 bg-muted text-muted-foreground border-transparent">
          {section.type}
        </Badge>
        <span className="text-sm font-medium text-muted-foreground/50 uppercase tracking-widest">
          {section.label}
        </span>
      </header>
      <div className="space-y-1">
        {section.lines.map((line, lineIndex) => {
          const hasChords = line.chords.length > 0;
          const key = `${section.id}-${lineIndex}`;

          if (!line.lyrics && !hasChords) {
            return <div key={key} className="h-4" />;
          }

          return (
            <div key={key} className="relative group">
              {hasChords && showChords && <ChordLine chords={line.chords} idPrefix={key} />}
              <div className="lyric-line text-foreground">{line.lyrics || "\u00A0"}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
