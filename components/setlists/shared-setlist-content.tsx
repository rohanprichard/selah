"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Monitor } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SetlistLiveView } from "@/components/setlists/setlist-live-view";
import { SetlistDetail } from "@/lib/supabase/setlists";

type SharedSetlistContentProps = {
    detail: SetlistDetail;
    token: string;
};

export function SharedSetlistContent({ detail, token }: SharedSetlistContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isLiveMode = searchParams.get("live") === "true";
    const currentEntryId = searchParams.get("current");

    // Auto-set first song as current when entering live mode
    const effectiveCurrentEntryId = React.useMemo(() => {
        if (isLiveMode && !currentEntryId && detail.songs.length > 0) {
            return detail.songs[0].id;
        }
        return currentEntryId;
    }, [isLiveMode, currentEntryId, detail.songs]);

    // Redirect to set first song as current if in live mode without current
    React.useEffect(() => {
        if (isLiveMode && !currentEntryId && detail.songs.length > 0) {
            router.replace(`/s/${token}?live=true&current=${detail.songs[0].id}`);
        }
    }, [isLiveMode, currentEntryId, detail.songs, router, token]);

    const handleEnterLiveMode = () => {
        if (detail.songs.length > 0) {
            router.push(`/s/${token}?live=true&current=${detail.songs[0].id}`);
        } else {
            router.push(`/s/${token}?live=true`);
        }
    };

    const handleExitLiveMode = () => {
        router.push(`/s/${token}`);
    };

    if (isLiveMode) {
        return (
            <SetlistLiveView
                setlist={detail.setlist}
                songs={detail.songs}
                shareToken={token}
                currentEntryId={effectiveCurrentEntryId}
                onExitLiveMode={handleExitLiveMode}
            />
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="text-3xl font-semibold text-foreground">
                                {detail.setlist.title}
                            </CardTitle>
                            {detail.setlist.description && (
                                <CardDescription className="mt-2">{detail.setlist.description}</CardDescription>
                            )}
                        </div>
                        <Button
                            onClick={handleEnterLiveMode}
                            variant="default"
                            size="sm"
                            className="shrink-0 gap-2"
                        >
                            <Monitor className="h-4 w-4" />
                            Live Mode
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Songs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {detail.songs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">This setlist does not include any songs yet.</p>
                    ) : (
                        detail.songs.map((entry, index) => {
                            const song = entry.song;
                            const songTitle = song?.title ?? "Unavailable song";
                            const songHref = song ? `/s/${detail.setlist.share_token}/songs/${entry.id}` : null;

                            return songHref ? (
                                <Link
                                    key={entry.id}
                                    href={songHref}
                                    className="block rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-foreground">
                                                {index + 1}. {songTitle}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {song?.artist ?? "Unknown artist"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <Badge variant="secondary">
                                            Key {entry.custom_key ?? song?.key ?? "—"}
                                        </Badge>
                                        <Badge variant="secondary">
                                            Tempo{" "}
                                            {entry.custom_tempo
                                                ? `${entry.custom_tempo} BPM`
                                                : song?.tempo
                                                    ? `${song.tempo} BPM`
                                                    : "—"}
                                        </Badge>
                                        <Badge variant="secondary">
                                            Time {entry.custom_time_signature ?? song?.time_signature ?? "—"}
                                        </Badge>
                                    </div>
                                    {entry.notes ? (
                                        <p className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap">{entry.notes}</p>
                                    ) : null}
                                </Link>
                            ) : (
                                <div key={entry.id} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-foreground">
                                                {index + 1}. {songTitle}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Unknown artist</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
