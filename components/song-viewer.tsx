"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buildChordDisplay, parseLyrics, transposeLines, type ParsedSection } from "@/lib/chords";
import type { Song, SongSection } from "@/lib/types";

import { Edit3, Minus, Plus, Printer, Share2 } from "lucide-react";
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
};

export function SongViewer({ song, sections, isOwner, ownerName }: SongViewerProps) {
  const [transposeSteps, setTransposeSteps] = React.useState(0);
  const [fontSize, setFontSize] = React.useState<FontSize>("md");
  const pathname = usePathname();

  const parsedSections = React.useMemo(() => {
    return sections.map<ParsedSection>((section) => ({
      id: section.id,
      label: section.label,
      type: section.type,
      lines: parseLyrics(section.lyrics ?? ""),
    }));
  }, [sections]);

  const displayedSections = React.useMemo(() => {
    return parsedSections.map((section) => ({
      ...section,
      lines: transposeLines(section.lines, transposeSteps),
    }));
  }, [parsedSections, transposeSteps]);

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
              <Button variant="outline" size="icon" onClick={handleShare} title="Copy link">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Copy link</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrint} title="Print chart">
                <Printer className="h-4 w-4" />
                <span className="sr-only">Print</span>
              </Button>
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

          <dl className="grid grid-cols-2 gap-3 text-sm text-muted-foreground print:hidden sm:grid-cols-4">
            <MetadataItem label="Original Key" value={song.key} />
            <MetadataItem
              label="Current Key"
              value={transposeSteps === 0 ? song.key : transposeLabel(song.key, transposeSteps)}
            />
            <MetadataItem label="Tempo" value={song.tempo ? `${song.tempo} BPM` : "—"} />
            <MetadataItem label="Time signature" value={song.time_signature || "4/4"} />
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
        <CardContent className="space-y-10">
          {song.youtube_url ? <YouTubeEmbed url={song.youtube_url} /> : null}
          <article className={cn("space-y-8 font-mono", FONT_SIZES[fontSize], "print:font-sans print:text-base")}> 
            {displayedSections.map((section) => (
              <section key={section.id} className="space-y-3">
                <header className="flex items-baseline gap-3">
                  <Badge variant="secondary" className="uppercase">
                    {section.type}
                  </Badge>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {section.label}
                  </h2>
                </header>
                <div className="space-y-2">
                  {section.lines.map((line, index) => {
                    const chords = buildChordDisplay(line);
                    const hasChords = chords.trim().length > 0;
                    const key = `${section.id}-${index}`;
                    if (!line.lyrics && !hasChords) {
                      return <div key={key} className="h-4" />;
                    }
                    return (
                      <div key={key} className="leading-relaxed">
                        {hasChords ? (
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

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground/70">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
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

function YouTubeEmbed({ url }: { url: string }) {
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
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
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

