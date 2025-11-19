"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SetlistEditor } from "@/components/setlists/setlist-editor";
import { SetlistLiveView } from "@/components/setlists/setlist-live-view";

type SetlistDetail = {
    setlist: {
        id: string;
        title: string;
        description: string | null;
        share_token: string;
    };
    songs: Array<{
        id: string;
        order_index: number;
        custom_key: string | null;
        custom_tempo: number | null;
        custom_time_signature: string | null;
        notes: string | null;
        arrangement: any;
        song: {
            id: string;
            title: string;
            artist: string | null;
            key: string;
            tempo: number | null;
            time_signature: string | null;
        } | null;
    }>;
};

type AuthSetlistContentProps = {
    detail: SetlistDetail;
    shareUrl: string;
};

export function AuthSetlistContent({ detail, shareUrl }: AuthSetlistContentProps) {
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
            router.replace(`/setlists/${detail.setlist.id}?live=true&current=${detail.songs[0].id}`);
        }
    }, [isLiveMode, currentEntryId, detail.songs, detail.setlist.id, router]);

    const handleExitLiveMode = () => {
        router.push(`/setlists/${detail.setlist.id}`);
    };

    if (isLiveMode) {
        return (
            <SetlistLiveView
                setlist={detail.setlist}
                songs={detail.songs}
                setlistId={detail.setlist.id}
                currentEntryId={effectiveCurrentEntryId}
                onExitLiveMode={handleExitLiveMode}
            />
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12">
            <SetlistEditor
                setlist={{
                    id: detail.setlist.id,
                    title: detail.setlist.title,
                    description: detail.setlist.description,
                    shareToken: detail.setlist.share_token,
                    shareUrl,
                }}
                songs={detail.songs}
            />
        </div>
    );
}
