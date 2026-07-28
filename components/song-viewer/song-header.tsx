import { Badge } from "@/components/ui/badge";
import type { Song } from "@/lib/types";
import { MetadataBadge } from "./metadata-badge";

type SongHeaderProps = {
  song: Song;
  displayedKey: string;
  keySecondary?: string;
  displayTempo: number | null;
  tempoSecondary?: string;
  displayTimeSignature: string | null;
  timeSignatureSecondary?: string;
};

export function SongHeader({
  song,
  displayedKey,
  keySecondary,
  displayTempo,
  tempoSecondary,
  displayTimeSignature,
  timeSignatureSecondary,
}: SongHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{song.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
          <span className="font-medium text-foreground">{song.artist || "Unknown artist"}</span>
          {song.writer && (
            <>
              <span>•</span>
              <span>{song.writer}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <MetadataBadge label="Key" value={displayedKey} secondary={keySecondary} />
        <MetadataBadge label="Tempo" value={displayTempo ? `${displayTempo} BPM` : "—"} secondary={tempoSecondary} />
        <MetadataBadge label="Time" value={displayTimeSignature ?? "—"} secondary={timeSignatureSecondary} />
        {Array.isArray(song.tags) && song.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="h-auto py-1.5 px-3 text-sm font-normal bg-background/50">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
