import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SongViewer } from "@/components/song-viewer";
import { SetlistNavigation } from "@/components/setlists/setlist-navigation";
import { calculateInitialTranspose } from "@/lib/music/transposition";
import { fetchSetlistSongByToken } from "@/lib/supabase/setlists";

export default async function SharedSetlistSongPage({
  params,
}: {
  params: Promise<{ token: string; entryId: string }>;
}) {
  const { token, entryId } = await params;

  const detail = await fetchSetlistSongByToken(token, entryId);

  if (!detail) {
    notFound();
  }

  const { setlist, entry, song, sections, navigation } = detail;
  const initialTranspose = calculateInitialTranspose(song.key, entry.custom_key);

  const prevHref = navigation.prevEntryId ? `/s/${token}/songs/${navigation.prevEntryId}` : undefined;
  const nextHref = navigation.nextEntryId ? `/s/${token}/songs/${navigation.nextEntryId}` : undefined;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/s/${token}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to setlist
          </Link>
        </Button>
      </div>

      <SongViewer
        song={song}
        sections={sections}
        ownerName={null}
        isOwner={false}
        canRemix={false}
        notes={entry.notes}
        initialTranspose={initialTranspose}
        overrideKey={entry.custom_key}
        overrideTempo={entry.custom_tempo}
        overrideTimeSignature={entry.custom_time_signature}
        arrangement={entry.arrangement}
      />

      <SetlistNavigation
        prevHref={prevHref}
        nextHref={nextHref}
        position={navigation.position}
        total={navigation.total}
        setlistTitle={setlist.title}
      />
    </div>
  );
}
