"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, CircleDot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    shareToken?: string; // For shared setlists
    setlistId?: string; // For authenticated setlists
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

    const handleSetCurrent = React.useCallback(
        (entryId: string) => {
            const baseUrl = shareToken ? `/s/${shareToken}` : `/setlists/${setlistId}`;
            router.push(`${baseUrl}?live=true&current=${entryId}`);
        },
        [router, shareToken, setlistId]
    );

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger if user is typing
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            // ESC to exit live mode
            if (event.key === "Escape") {
                event.preventDefault();
                onExitLiveMode();
                return;
            }

            // Number keys 1-9, 0 to select songs
            const num = parseInt(event.key, 10);
            if (!isNaN(num)) {
                event.preventDefault();
                const index = num === 0 ? 9 : num - 1; // 0 maps to 10th song
                if (songs[index]) {
                    handleSetCurrent(songs[index].id);
                }
                return;
            }

            // Arrow up/down to navigate
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                const currentIndex = songs.findIndex((s) => s.id === currentEntryId);
                if (currentIndex === -1) return;

                const newIndex =
                    event.key === "ArrowUp"
                        ? Math.max(0, currentIndex - 1)
                        : Math.min(songs.length - 1, currentIndex + 1);

                if (songs[newIndex]) {
                    handleSetCurrent(songs[newIndex].id);
                }
            }

            // Space to clear current
            if (event.key === " ") {
                event.preventDefault();
                const baseUrl = shareToken ? `/s/${shareToken}` : `/setlists/${setlistId}`;
                router.push(`${baseUrl}?live=true`);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [songs, currentEntryId, handleSetCurrent, onExitLiveMode, router, shareToken, setlistId]);

    return (
        <div className="min-h-screen bg-background p-6 sm:p-12">
            {/* Header */}
            <div className="mb-12 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                        {setlist.title}
                    </h1>
                    {setlist.description && (
                        <p className="text-xl text-muted-foreground">{setlist.description}</p>
                    )}
                </div>
                <Button
                    onClick={onExitLiveMode}
                    variant="ghost"
                    size="sm"
                    className="shrink-0 gap-2"
                >
                    <X className="h-4 w-4" />
                    Exit Live Mode
                </Button>
            </div>

            {/* Song List */}
            <div className="mx-auto max-w-5xl space-y-6">
                {songs.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-2xl text-muted-foreground">
                            This setlist doesn't have any songs yet.
                        </p>
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

            {/* Keyboard hints */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm text-xs text-muted-foreground print:hidden">
                <kbd className="px-1.5 py-0.5 bg-background rounded">1-9</kbd> Jump to song ·{" "}
                <kbd className="px-1.5 py-0.5 bg-background rounded">↑↓</kbd> Navigate ·{" "}
                <kbd className="px-1.5 py-0.5 bg-background rounded">ESC</kbd> Exit
            </div>
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
    const [isHovered, setIsHovered] = React.useState(false);
    const song = entry.song;

    if (!song) {
        return (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-6 opacity-50">
                <div className="flex items-start gap-6">
                    <div className="text-6xl font-bold tabular-nums text-muted-foreground/50">
                        {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                        <h3 className="text-4xl font-semibold text-muted-foreground">
                            Unavailable song
                        </h3>
                    </div>
                </div>
            </div>
        );
    }

    const songHref = shareToken
        ? `/s/${shareToken}/songs/${entry.id}`
        : `/setlists/${setlistId}/songs/${entry.id}`;

    const displayKey = entry.custom_key ?? song.key;

    return (
        <div
            className={cn(
                "group relative rounded-lg transition-all duration-200",
                isCurrent && "bg-primary/10 border-l-8 border-primary pl-6",
                !isCurrent && "pl-2 hover:bg-muted/30"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={songHref} className="block p-6">
                <div className="flex items-start gap-6">
                    {/* Song Number */}
                    <div
                        className={cn(
                            "text-5xl sm:text-6xl font-bold tabular-nums transition-colors",
                            isCurrent ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        {index + 1}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 space-y-2">
                        <h3
                            className={cn(
                                "text-3xl sm:text-4xl font-semibold transition-colors leading-tight",
                                isCurrent ? "text-foreground" : "text-foreground"
                            )}
                        >
                            {song.title}
                        </h3>
                        <p className="text-xl sm:text-2xl text-muted-foreground">
                            {song.artist || "Unknown artist"}
                        </p>

                        {/* Key badge */}
                        {displayKey && (
                            <Badge
                                variant="secondary"
                                className="mt-2 text-base font-semibold px-3 py-1"
                            >
                                Key {displayKey}
                            </Badge>
                        )}

                        {/* Notes (if any) */}
                        {entry.notes && (
                            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                                {entry.notes}
                            </p>
                        )}
                    </div>

                    {/* Set as Current Indicator/Button */}
                    {isCurrent && (
                        <div className="flex items-center gap-2 text-primary">
                            <CircleDot className="h-6 w-6" />
                            <span className="text-sm font-semibold hidden sm:inline">Current</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Set as Current Button (hover only) */}
            {!isCurrent && (isHovered || window.matchMedia('(pointer: coarse)').matches) && (
                <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-6 right-6 gap-2"
                    onClick={(e) => {
                        e.preventDefault();
                        onSetCurrent();
                    }}
                >
                    <CircleDot className="h-4 w-4" />
                    Set as Current
                </Button>
            )}
        </div>
    );
}
