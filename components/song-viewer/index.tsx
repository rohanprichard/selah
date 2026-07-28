"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Song, SongSection, ArrangementItem } from "@/lib/types";
import { FONT_SIZES } from "./constants";
import { useSongViewerState } from "./hooks";
import { LiveHeader } from "./live-header";
import { SectionRenderer } from "./section-renderer";
import { SongHeader } from "./song-header";
import { Toolbar } from "./toolbar";
import { YouTubeEmbed } from "./youtube-embed";

type SongViewerProps = {
  song: Song;
  sections: SongSection[];
  isOwner: boolean;
  ownerName: string | null;
  canRemix: boolean;
  notes?: string | null;
  initialTranspose?: number;
  overrideKey?: string | null;
  overrideTempo?: number | null;
  overrideTimeSignature?: string | null;
  arrangement?: ArrangementItem[] | null;
  hideHeader?: boolean;
};

export function SongViewer({
  song,
  sections,
  isOwner,
  canRemix,
  notes,
  initialTranspose,
  overrideKey,
  overrideTempo,
  overrideTimeSignature,
  arrangement,
  hideHeader = false,
}: SongViewerProps) {
  const {
    transposeSteps,
    fontSize,
    showChords,
    isLiveMode,
    isFullscreen,
    displayedSections,
    displayedKey,
    keySecondary,
    displayTempo,
    tempoSecondary,
    displayTimeSignature,
    timeSignatureSecondary,
    handleTranspose,
    handleFontSize,
    toggleShowChords,
    toggleLiveMode,
    toggleFullscreen,
    handleCopyLyrics,
    handleShare,
    handlePrint,
  } = useSongViewerState({
    song,
    sections,
    initialTranspose,
    overrideKey,
    overrideTempo,
    overrideTimeSignature,
    arrangement,
  });

  return (
    <div className="space-y-8 mb-32">
      {isLiveMode && (
        <LiveHeader
          title={song.title}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onExit={() => toggleLiveMode(false)}
        />
      )}

      {!hideHeader && !isLiveMode && (
        <SongHeader
          song={song}
          displayedKey={displayedKey}
          keySecondary={keySecondary}
          displayTempo={displayTempo}
          tempoSecondary={tempoSecondary}
          displayTimeSignature={displayTimeSignature}
          timeSignatureSecondary={timeSignatureSecondary}
        />
      )}

      {!isLiveMode && (
        <Toolbar
          songId={song.id}
          isOwner={isOwner}
          canRemix={canRemix}
          transposeSteps={transposeSteps}
          onTranspose={handleTranspose}
          showChords={showChords}
          onToggleChords={toggleShowChords}
          fontSize={fontSize}
          onFontSize={handleFontSize}
          onEnterLiveMode={() => toggleLiveMode(true)}
          onCopyLyrics={handleCopyLyrics}
          onShare={handleShare}
          onPrint={handlePrint}
        />
      )}

      <div className={cn("grid gap-8", !isLiveMode && "lg:grid-cols-[1fr,300px]")}>
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0 space-y-8">
            {notes && !isLiveMode && (
              <div className="rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">Setlist Notes</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{notes}</p>
              </div>
            )}

            <article className={cn("space-y-8", isLiveMode ? "text-xl" : FONT_SIZES[fontSize])}>
              {displayedSections.map((section, index) => (
                <section key={`${section.id}-${index}`} className="space-y-2 break-inside-avoid">
                  <SectionRenderer section={section} showChords={showChords} />
                </section>
              ))}
            </article>
          </CardContent>
        </Card>

        {!isLiveMode && (
          <div className="hidden lg:block space-y-6">
            {song.youtube_url && (
              <div className="sticky top-40 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reference</h3>
                <YouTubeEmbed url={song.youtube_url} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
