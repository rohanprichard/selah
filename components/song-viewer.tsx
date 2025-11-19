"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  parseLyrics,
  transposeLines,
  type ParsedSection,
  formatSectionsAsLyrics,
} from "@/lib/chords";
import type { Song, SongSection, ArrangementItem } from "@/lib/types";

import { Copy, Edit3, Minus, Music, Plus, Printer, Share2, Wand2, Settings2, Type } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ChordTooltip } from "@/components/chords/chord-tooltip";

const FONT_SIZES = {
  sm: "text-sm leading-6",
  md: "text-base leading-7",
  lg: "text-lg leading-8",
  xl: "text-xl leading-9",
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
  hideHeader?: boolean;
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
  hideHeader = false,
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
      return Math.max(-12, Math.min(12, next));
    });
  };

  const handleFontSize = (size: FontSize) => setFontSize(size);

  const handleCopyLyrics = React.useCallback(async () => {
    const formatted = formatSectionsAsLyrics(displayedSections);
    if (!formatted) {
      toast.error("No lyrics available to copy.");
      return;
    }
    if (typeof navigator?.clipboard?.writeText !== "function") {
      toast.error("Clipboard access is not available in this browser.");
      return;
    }
    try {
      await navigator.clipboard.writeText(formatted);
      toast.success("Lyrics copied without chords");
    } catch (error) {
      console.error("Failed to copy lyrics", error);
      toast.error("Unable to copy lyrics");
    }
  }, [displayedSections]);

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
    keySecondaryParts.push(`Original: ${song.key}`);
  } else if (song.key !== displayedKey) {
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
    <div className="space-y-8 mb-32">
      {/* Header Section */}
      {!hideHeader && (
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
            {Array.isArray(song.tags) && song.tags.map(tag => (
              <Badge key={tag} variant="outline" className="h-auto py-1.5 px-3 text-sm font-normal bg-background/50">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Toolbar */}
      <div className="sticky top-20 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 print:hidden">
        <div className="glass rounded-xl p-2 flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <TransposeControls
              onDecrease={() => handleTranspose(-1)}
              onIncrease={() => handleTranspose(1)}
              value={transposeSteps}
            />
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant={showChords ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowChords(!showChords)}
                className="h-8 px-3"
              >
                <Music className="mr-2 h-4 w-4" />
                {showChords ? "Chords On" : "Chords Off"}
              </Button>
              <FontSizeMenu value={fontSize} onChange={handleFontSize} />
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile Menu for extra controls */}
            <div className="sm:hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-sm font-medium">Chords</span>
                      <Button
                        variant={showChords ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowChords(!showChords)}
                        className="h-7 text-xs"
                      >
                        {showChords ? "On" : "Off"}
                      </Button>
                    </div>
                    <Separator />
                    <div className="px-2 py-1">
                      <span className="text-sm font-medium mb-2 block">Font Size</span>
                      <div className="flex gap-1">
                        {(["sm", "md", "lg", "xl"] as FontSize[]).map((size) => (
                          <Button
                            key={size}
                            variant={fontSize === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFontSize(size)}
                            className="h-7 flex-1 text-xs"
                          >
                            {size.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <Button variant="ghost" size="icon" onClick={handleCopyLyrics} title="Copy lyrics" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} title="Share" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePrint} title="Print" className="h-8 w-8">
              <Printer className="h-4 w-4" />
            </Button>

            {canRemix && (
              <Button asChild variant="ghost" size="icon" title="Remix" className="h-8 w-8">
                <Link href={`/songs/${song.id}/remix`}>
                  <Wand2 className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {isOwner && (
              <Button asChild variant="default" size="sm" className="h-8 px-3 ml-1">
                <Link href={`/songs/${song.id}/edit`}>
                  <Edit3 className="mr-2 h-3 w-3" /> Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0 space-y-8">
            {notes && (
              <div className="rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">Setlist Notes</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{notes}</p>
              </div>
            )}

            <article className={cn("space-y-8", FONT_SIZES[fontSize])}>
              {displayedSections.map((section, index) => (
                <section key={`${section.id}-${index}`} className="space-y-2 break-inside-avoid">
                  {section.type === 'label' || section.type === 'custom' ? (
                    <div className="rounded-lg border border-muted bg-muted/30 p-4">
                      <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        {section.label}
                      </p>
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
                  ) : (
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
                              {hasChords && showChords && (
                                <div className="chord-line text-primary/90 select-none print:text-black mb-0.5 h-[1.5em] relative">
                                  {line.chords.map((chordEntry, chordIndex) => (
                                    <div
                                      key={`${key}-chord-${chordIndex}`}
                                      className="absolute top-0"
                                      style={{ left: `${chordEntry.position}ch` }}
                                    >
                                      <ChordTooltip chord={chordEntry.chord}>
                                        {chordEntry.chord}
                                      </ChordTooltip>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="lyric-line text-foreground">
                                {line.lyrics || "\u00A0"}
                              </div>
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

        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block space-y-6">
          {song.youtube_url && (
            <div className="sticky top-40 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reference</h3>
              <YouTubeEmbed url={song.youtube_url} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function transposeLabel(original: string, steps: number): string {
  const semitones = steps;
  const transposed = transposeLines([{ lyrics: "", chords: [{ chord: original, position: 0 }] }], semitones);
  const chord = transposed[0]?.chords[0]?.chord;
  return chord || original;
}

function MetadataBadge({ label, value, secondary }: { label: string; value: string; secondary?: string }) {
  return (
    <div className="inline-flex flex-col rounded-md border border-border bg-muted/30 px-3 py-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        {secondary && <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={secondary}>{secondary}</span>}
      </div>
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
    <div className="flex items-center rounded-lg bg-background border border-border p-0.5">
      <Button type="button" size="icon" variant="ghost" onClick={onDecrease} className="h-7 w-7 rounded-md hover:bg-muted">
        <Minus className="h-3 w-3" />
        <span className="sr-only">Transpose down</span>
      </Button>
      <span className="w-8 text-center text-sm font-bold tabular-nums">{value > 0 ? `+${value}` : value}</span>
      <Button type="button" size="icon" variant="ghost" onClick={onIncrease} className="h-7 w-7 rounded-md hover:bg-muted">
        <Plus className="h-3 w-3" />
        <span className="sr-only">Transpose up</span>
      </Button>
    </div>
  );
}

function FontSizeMenu({ value, onChange }: { value: FontSize; onChange: (v: FontSize) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3">
          <Type className="mr-2 h-4 w-4" />
          <span className="uppercase">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="grid grid-cols-4 gap-1">
          {(["sm", "md", "lg", "xl"] as FontSize[]).map((size) => (
            <Button
              key={size}
              variant={value === size ? "default" : "ghost"}
              size="sm"
              onClick={() => onChange(size)}
              className="h-8 w-full text-xs font-bold"
            >
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
    <div className={cn("aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-lg", className)}>
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

