import { SongViewerSkeleton } from "@/components/skeletons/song-viewer-skeleton";

export default function Loading() {
    return (
        <div className="space-y-6 pb-24">
            {/* Song viewer skeleton with header */}
            <SongViewerSkeleton />
        </div>
    );
}
