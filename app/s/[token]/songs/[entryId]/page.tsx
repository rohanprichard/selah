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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/s/${setlist.share_token}`} className="underline underline-offset-4">
              Back to setlist
            </Link>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{song.title}</h1>
          <p className="text-sm text-muted-foreground">Setlist view shared via guest link</p>
        </div>
        <Button asChild variant="secondary" className="gap-2">
          <Link href={`/s/${setlist.share_token}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to {setlist.title}</span>
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
