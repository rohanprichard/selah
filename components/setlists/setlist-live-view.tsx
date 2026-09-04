"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleDot, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdjacentEntryId, getLiveSetlistPath } from "@/lib/setlist-live";
import { cn } from "@/lib/utils";

type SetlistEntry = {
  id: string;
  order_index: number;
  custom_key: string | null;
  custom_tempo: number | null;
  custom_time_signature: string | null;
  notes: string | null;
  song: {
    id: string;
    title: string;
    artist: string | null;
    key: string;
    tempo: number | null;
    time_signature: string | null;
  } | null;
};

type SetlistLiveViewProps = {
  setlist: {
    title: string;
    description: string | null;
  };
  songs: SetlistEntry[];
  shareToken?: string;
  setlistId?: string;
  currentEntryId: string | null;
  onExitLiveMode: () => void;
};

export function SetlistLiveView({
  setlist,
  songs,
  shareToken,
  setlistId,
  currentEntryId,
  onExitLiveMode,
}: SetlistLiveViewProps) {
  const router = useRouter();
  const entryIds = React.useMemo(() => songs.map((song) => song.id), [songs]);

  const handleSetCurrent = React.useCallback(
    (entryId: string | null) => {
      router.push(getLiveSetlistPath({ shareToken, setlistId, currentEntryId: entryId }));
    },
    [router, shareToken, setlistId],
  );

  const handleMove = React.useCallback(
    (direction: -1 | 1) => {
      const entryId = getAdjacentEntryId(entryIds, currentEntryId, direction);

      if (entryId) {
        handleSetCurrent(entryId);
      }
    },
    [currentEntryId, entryIds, handleSetCurrent],
  );

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onExitLiveMode();
        return;
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        const index = event.key === "0" ? 9 : Number.parseInt(event.key, 10) - 1;
        const entryId = entryIds[index];

        if (entryId) {
          handleSetCurrent(entryId);
        }

        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        handleMove(event.key === "ArrowUp" ? -1 : 1);
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        handleSetCurrent(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entryIds, handleMove, handleSetCurrent, onExitLiveMode]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <header className="mx-auto mb-8 flex max-w-6xl flex-col gap-6 border-b border-border/70 pb-6 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Live mode</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{setlist.title}</h1>
          {setlist.description ? <p className="text-base text-muted-foreground sm:text-lg">{setlist.description}</p> : null}
        </div>
        <Button onClick={onExitLiveMode} variant="outline" className="w-full shrink-0 gap-2 sm:w-auto">
          <X className="h-4 w-4" />
          Exit live mode
        </Button>
      </header>

      <div className="mx-auto max-w-6xl space-y-4 pb-28 sm:space-y-5">
        {songs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-foreground">Add a song before live mode</h2>
            <p className="mt-2 text-muted-foreground">Return to the setlist editor to add songs.</p>
          </div>
        ) : (
          songs.map((entry, index) => (
            <LiveSongRow
              key={entry.id}
              entry={entry}
              index={index}
              isCurrent={entry.id === currentEntryId}
              onSetCurrent={() => handleSetCurrent(entry.id)}
              shareToken={shareToken}
              setlistId={setlistId}
            />
          ))
        )}
      </div>

      {songs.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/95 px-4 py-3 shadow-lg backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <Button aria-label="Show previous song" variant="outline" onClick={() => handleMove(-1)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <p className="hidden text-center text-xs text-muted-foreground md:block">
              <kbd className="rounded border bg-muted px-1.5 py-0.5">1-9</kbd> Select
              <span className="mx-2">·</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">↑↓</kbd> Move
              <span className="mx-2">·</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">Esc</kbd> Exit
            </p>
            <Button aria-label="Show next song" onClick={() => handleMove(1)}>
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type LiveSongRowProps = {
  entry: SetlistEntry;
  index: number;
  isCurrent: boolean;
  onSetCurrent: () => void;
  shareToken?: string;
  setlistId?: string;
};

function LiveSongRow({
  entry,
  index,
  isCurrent,
  onSetCurrent,
  shareToken,
  setlistId,
}: LiveSongRowProps) {
  const song = entry.song;

  if (!song) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 opacity-80">
        <p className="text-sm font-medium text-muted-foreground">Song {index + 1}</p>
        <h2 className="mt-1 text-2xl font-semibold text-foreground">Unavailable song</h2>
      </div>
    );
  }

  const songHref = shareToken ? `/s/${shareToken}/songs/${entry.id}` : `/setlists/${setlistId}/songs/${entry.id}`;
  const displayKey = entry.custom_key ?? song.key;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-sm transition-colors sm:p-6",
        isCurrent ? "border-primary bg-primary/5 ring-2 ring-primary/25" : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <Link href={songHref} className="group flex min-w-0 items-start gap-4 rounded-lg focus-visible:outline-none">
          <span className={cn("mt-1 text-2xl font-bold tabular-nums sm:text-3xl", isCurrent ? "text-primary" : "text-muted-foreground")}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 space-y-2">
            <span className="block truncate text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary sm:text-3xl">
              {song.title}
            </span>
            <span className="block text-base text-muted-foreground sm:text-lg">{song.artist || "Unknown artist"}</span>
            <span className="flex flex-wrap gap-2">
              {displayKey ? <Badge variant="secondary">Key {displayKey}</Badge> : null}
              {entry.custom_tempo ?? song.tempo ? <Badge variant="outline">{entry.custom_tempo ?? song.tempo} BPM</Badge> : null}
              {entry.custom_time_signature ?? song.time_signature ? <Badge variant="outline">{entry.custom_time_signature ?? song.time_signature}</Badge> : null}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          {isCurrent ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-primary" role="status">
              <CircleDot className="h-5 w-5" />
              Current song
            </span>
          ) : (
            <Button variant="outline" onClick={onSetCurrent} aria-label={`Set ${song.title} as current`}>
              <CircleDot className="h-4 w-4" />
              Set current
            </Button>
          )}
        </div>
      </div>
      {entry.notes ? <p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">{entry.notes}</p> : null}
    </article>
  );
}
