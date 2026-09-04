"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  parseLyrics,
  transposeLines,
  formatSectionsAsLyrics,
  type ParsedSection,
} from "@/lib/chords";
import type { Song, SongSection, ArrangementItem } from "@/lib/types";
import { FONT_SIZE_ORDER, type FontSize } from "./constants";

type UseSongViewerStateOptions = {
  song: Song;
  sections: SongSection[];
  initialTranspose?: number;
  overrideKey?: string | null;
  overrideTempo?: number | null;
  overrideTimeSignature?: string | null;
  arrangement?: ArrangementItem[] | null;
};

export function useSongViewerState({
  song,
  sections,
  initialTranspose,
  overrideKey,
  overrideTempo,
  overrideTimeSignature,
  arrangement,
}: UseSongViewerStateOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [transposeSteps, setTransposeSteps] = React.useState(initialTranspose ?? 0);
  const [fontSize, setFontSize] = React.useState<FontSize>("md");
  const [showChords, setShowChords] = React.useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("selah-show-chords");
    return saved !== "false";
  });

  // Initialize from URL param or localStorage
  const [isLiveMode, setIsLiveMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selah-live-mode");
      if (stored === "true") return true;
    }
    return searchParams.get("live") === "true";
  });

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Sync URL and localStorage when Live Mode changes
  const toggleLiveMode = React.useCallback((enabled: boolean) => {
    setIsLiveMode(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("selah-live-mode", String(enabled));
    }

    const params = new URLSearchParams(searchParams.toString());
    if (enabled) {
      params.set("live", "true");
    } else {
      params.delete("live");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Restore URL param if localStorage has it but URL doesn't
  React.useEffect(() => {
    if (isLiveMode && searchParams.get("live") !== "true") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("live", "true");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [isLiveMode, pathname, router, searchParams]);

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

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

  const handleTranspose = React.useCallback((amount: number) => {
    setTransposeSteps((prev) => Math.max(-12, Math.min(12, prev + amount)));
  }, []);

  const handleFontSize = React.useCallback((size: FontSize) => setFontSize(size), []);

  const stepFontSize = React.useCallback((direction: 1 | -1) => {
    setFontSize((prev) => {
      const idx = FONT_SIZE_ORDER.indexOf(prev);
      const next = Math.max(0, Math.min(FONT_SIZE_ORDER.length - 1, idx + direction));
      return FONT_SIZE_ORDER[next];
    });
  }, []);

  const toggleShowChords = React.useCallback(() => setShowChords((prev) => !prev), []);

  const toggleFullscreen = React.useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isEditable) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          handleTranspose(1);
          break;
        case "ArrowDown":
          event.preventDefault();
          handleTranspose(-1);
          break;
        case "c":
          toggleShowChords();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "l":
          toggleLiveMode(!isLiveMode);
          break;
        case "+":
        case "=":
          stepFontSize(1);
          break;
        case "-":
          stepFontSize(-1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTranspose, isLiveMode, stepFontSize, toggleFullscreen, toggleLiveMode, toggleShowChords]);

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

  const handleShare = React.useCallback(async () => {
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
  }, [pathname]);

  const handlePrint = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
      toast.message("Opening print dialog...");
    }
  }, []);

  const displayedKey = React.useMemo(
    () => transposeLabel(song.key, transposeSteps),
    [song.key, transposeSteps],
  );

  let keySecondary: string | undefined;
  if (overrideKey && overrideKey !== song.key) {
    keySecondary = `Original: ${song.key}`;
  } else if (song.key !== displayedKey) {
    keySecondary = `Transposed from ${song.key}`;
  }

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

  return {
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
  };
}

function transposeLabel(original: string, steps: number): string {
  const transposed = transposeLines([{ lyrics: "", chords: [{ chord: original, position: 0 }] }], steps);
  return transposed[0]?.chords[0]?.chord || original;
}
