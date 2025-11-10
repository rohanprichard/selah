"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buildChordDisplay, parseLyrics, transposeLines, type ParsedSection } from "@/lib/chords";
import type { Song, SongSection, ArrangementItem } from "@/lib/types";

import { Edit3, Minus, Music, Plus, Printer, Share2, Wand2 } from "lucide-react";
import { toast } from "sonner";

const FONT_SIZES = {
  sm: "text-sm leading-6",
  md: "text-base leading-7",
  lg: "text-lg leading-8",
} as const;

type FontSize = keyof typeof FONT_SIZES;

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
};

export function SongViewer({
  song,
  sections,
  isOwner,
  ownerName,
  canRemix,
  notes,
  initialTranspose,
  overrideKey,
  overrideTempo,
  overrideTimeSignature,
  arrangement,
}: SongViewerProps) {
  const [transposeSteps, setTransposeSteps] = React.useState(initialTranspose ?? 0);
  const [fontSize, setFontSize] = React.useState<FontSize>("md");
  const [showChords, setShowChords] = React.useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("selah-show-chords");
    return saved !== "false";
  });
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof initialTranspose === "number") {
      setTransposeSteps(initialTranspose);
    }
  }, [initialTranspose]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selah-show-chords", String(showChords));
    }
  }, [showChords]);

  const parsedSections = React.useMemo(() => {
    return sections.map<ParsedSection>((section) => ({
      id: section.id,
      label: section.label,
      type: section.type,
      lines: parseLyrics(section.lyrics ?? ""),
    }));
  }, [sections]);

  // Apply arrangement if provided
  const arrangedSections = React.useMemo(() => {
    if (arrangement && arrangement.length > 0) {
      return arrangement.map((item, idx) => {
        if (typeof item === 'number') {
          return parsedSections[item];
        } else {
          // Custom section
          if (item.sectionIndex !== undefined && parsedSections[item.sectionIndex]) {
            // Copy of an existing section
            return {
              ...parsedSections[item.sectionIndex],
              id: `custom-copy-${idx}`,
              label: `${parsedSections[item.sectionIndex].label} (Copy)`,
            };
          } else {
            // Pure custom section with text
            return {
              id: `custom-${idx}`,
              label: item.label,
              type: 'custom' as const,
              lines: item.content ? parseLyrics(item.content) : [],
            };
          }
        }
      }).filter(Boolean);
    }
    return parsedSections;
  }, [parsedSections, arrangement]);

  const displayedSections = React.useMemo(() => {
    return arrangedSections.map((section) => ({
      ...section,
      lines: transposeLines(section.lines, transposeSteps),
    }));
  }, [arrangedSections, transposeSteps]);

  const handleTranspose = (amount: number) => {
    setTransposeSteps((prev) => {
      const next = prev + amount;
      return Math.max(-6, Math.min(6, next));
    });
  };

  const handleFontSize = (size: FontSize) => setFontSize(size);

  const handleShare = async () => {
    if (typeof navigator?.clipboard?.writeText !== "function") {
      toast.error("Clipboard access is not available in this browser.");
      return;
    }
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${pathname}`);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy link", error);
      toast.error("Unable to copy link");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
      toast.message("Opening print dialog...");
    }
  };

  const displayedKey = React.useMemo(() => {
    return transposeLabel(song.key, transposeSteps);
  }, [song.key, transposeSteps]);
  
  const keySecondaryParts: string[] = [];
  if (overrideKey && overrideKey !== song.key) {
    // When viewing from setlist with custom key, just show the original
    keySecondaryParts.push(`Original: ${song.key}`);
  } else if (song.key !== displayedKey) {
    // When manually transposing, show where it came from
    keySecondaryParts.push(`Transposed from ${song.key}`);
  }
  const keySecondary = keySecondaryParts.length ? keySecondaryParts.join(" · ") : undefined;

  const displayTempo = overrideTempo ?? song.tempo;
  const tempoSecondary =
    overrideTempo && song.tempo && overrideTempo !== song.tempo
      ? `Original: ${song.tempo} BPM`
      : undefined;

  const displayTimeSignature = overrideTimeSignature ?? song.time_signature;
  const timeSignatureSecondary =
    overrideTimeSignature && song.time_signature && overrideTimeSignature !== song.time_signature
      ? `Original: ${song.time_signature}`
      : undefined;

  return (
    <div className="space-y-10">
      <Card className="print:border-none print:shadow-none">
        <CardHeader className="gap-6">
          <div className="flex flex-col gap-2 print:flex-row print:items-baseline print:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-semibold tracking-tight">{song.title}</CardTitle>
              <CardDescription>
                {song.artist ? `${song.artist}` : "Unknown artist"}
                {song.writer ? ` • Written by ${song.writer}` : ""}
                {ownerName ? ` • Uploaded by ${ownerName}` : ""}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <TransposeControls
                onDecrease={() => handleTranspose(-1)}
                onIncrease={() => handleTranspose(1)}
                value={transposeSteps}
              />
              <FontSizeControls value={fontSize} onChange={handleFontSize} />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShowChords(prev => !prev)} 
                title={showChords ? "Hide chords" : "Show chords"}
              >
                <Music className={cn("h-4 w-4", !showChords && "opacity-50")} />
                <span className="sr-only">{showChords ? "Hide chords" : "Show chords"}</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare} title="Copy link">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Copy link</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrint} title="Print chart">
                <Printer className="h-4 w-4" />
                <span className="sr-only">Print</span>
              </Button>
              {canRemix ? (
                <Button asChild variant="outline" size="icon" title="Remix song">
                  <Link href={`/songs/${song.id}/remix`}>
                    <Wand2 className="h-4 w-4" />
                    <span className="sr-only">Remix song</span>
                  </Link>
                </Button>
              ) : null}
              {isOwner ? (
                <Button asChild variant="default" size="icon" title="Edit song">
                  <Link href={`/songs/${song.id}/edit`}>
                    <Edit3 className="h-4 w-4" />
                    <span className="sr-only">Edit song</span>
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm text-muted-foreground print:hidden sm:grid-cols-3">
            <MetadataItem label="Key" value={displayedKey} secondary={keySecondary} />
            <MetadataItem label="Tempo" value={displayTempo ? `${displayTempo} BPM` : "—"} secondary={tempoSecondary} />
            <MetadataItem
              label="Time Signature"
              value={displayTimeSignature ?? "—"}
              secondary={timeSignatureSecondary}
            />
          </dl>
          {Array.isArray(song.tags) && song.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {song.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
          {notes ? (
            <div className="rounded-lg border border-dashed border-foreground/10 bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Setlist notes</p>
              <p className="mt-2 whitespace-pre-wrap">{notes}</p>
            </div>
          ) : null}

          {song.youtube_url ? <YouTubeEmbed url={song.youtube_url} className="print:hidden" /> : null}
          <article className={cn("space-y-6", FONT_SIZES[fontSize])}>
            {displayedSections.map((section, index) => (
              <section key={`${section.id}-${index}`} className="space-y-3">
                {section.type === 'label' || section.type === 'custom' ? (
                  <div className="rounded-md border border-dashed border-muted bg-muted/30 p-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
                      {section.label}
                    </p>
                    {section.lines.length > 0 && (
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {section.lines.map((line, lineIndex) => (
                          <pre key={lineIndex} className="whitespace-pre-wrap">
                            {line.lyrics || "\u00A0"}
                          </pre>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <header className="flex items-baseline gap-3">
                      <Badge variant="secondary" className="uppercase">
                        {section.type}
                      </Badge>
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        {section.label}
                      </h2>
                    </header>
                    <div className="space-y-2">
                      {section.lines.map((line, lineIndex) => {
                        const chords = buildChordDisplay(line);
                        const hasChords = chords.trim().length > 0;
                        const key = `${section.id}-${lineIndex}`;
                        if (!line.lyrics && !hasChords) {
                          return <div key={key} className="h-4" />;
                        }
                        return (
                          <div key={key} className="leading-relaxed">
                            {hasChords && showChords ? (
                              <pre className="whitespace-pre text-primary print:text-black">
                                {chords}
                              </pre>
                            ) : null}
                            <pre className="whitespace-pre-wrap text-foreground">
                              {line.lyrics || "\u00A0"}
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            ))}
          </article>
        </CardContent>
      </Card>
    </div>
  );
}

function transposeLabel(original: string, steps: number): string {
  const semitones = steps;
  const transposed = transposeLines([{ lyrics: "", chords: [{ chord: original, position: 0 }] }], semitones);
  const chord = transposed[0]?.chords[0]?.chord;
  return chord || original;
}

function MetadataItem({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string | number;
  secondary?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
      {secondary ? <p className="text-xs text-muted-foreground">{secondary}</p> : null}
    </div>
  );
}

type TransposeControlsProps = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

function TransposeControls({ value, onIncrease, onDecrease }: TransposeControlsProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-sm">
      <span className="text-muted-foreground">Transpose</span>
      <div className="flex items-center gap-1">
        <Button type="button" size="icon" variant="ghost" onClick={onDecrease}>
          <Minus className="h-4 w-4" />
          <span className="sr-only">Transpose down</span>
        </Button>
        <span className="w-8 text-center font-semibold text-foreground">{value >= 0 ? `+${value}` : value}</span>
        <Button type="button" size="icon" variant="ghost" onClick={onIncrease}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Transpose up</span>
        </Button>
      </div>
    </div>
  );
}

type FontSizeControlsProps = {
  value: FontSize;
  onChange: (value: FontSize) => void;
};

function FontSizeControls({ value, onChange }: FontSizeControlsProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-sm">
      <span className="text-muted-foreground">Font</span>
      <div className="flex items-center gap-1">
        {(
          ["sm", "md", "lg"] as FontSize[]
        ).map((size) => (
          <Button
            key={size}
            type="button"
            size="icon"
            variant={value === size ? "default" : "ghost"}
            onClick={() => onChange(size)}
            className="h-8 w-8"
          >
            <span className="text-xs uppercase">{size}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function YouTubeEmbed({ url, className }: { url: string; className?: string }) {
  const embedUrl = React.useMemo(() => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com")) {
        const videoId = parsed.searchParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (parsed.hostname === "youtu.be") {
        return `https://www.youtube.com/embed${parsed.pathname}`;
      }
    } catch (error) {
      console.warn("Invalid YouTube URL", error);
    }
    return null;
  }, [url]);

  if (!embedUrl) return null;

  return (
    <div className={cn("aspect-video w-full overflow-hidden rounded-lg border border-border bg-black", className)}>
      <iframe
        title="YouTube video player"
        src={`${embedUrl}?rel=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}

