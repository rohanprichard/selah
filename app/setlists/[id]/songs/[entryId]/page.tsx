import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SongViewer } from "@/components/song-viewer";
import { SetlistNavigation } from "@/components/setlists/setlist-navigation";
import { calculateInitialTranspose } from "@/lib/music/transposition";
import { createClient } from "@/lib/supabase/server";
import { fetchSetlistSongForOwner } from "@/lib/supabase/setlists";

export default async function SetlistSongViewerPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const { id, entryId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/setlists/${id}`);
  }

  const detail = await fetchSetlistSongForOwner(id, entryId);

  const { entry, song, sections, setlist, navigation } = detail;

  const initialTranspose = calculateInitialTranspose(song.key, entry.custom_key);

  const prevHref = navigation.prevEntryId ? `/setlists/${id}/songs/${navigation.prevEntryId}` : undefined;
  const nextHref = navigation.nextEntryId ? `/setlists/${id}/songs/${navigation.nextEntryId}` : undefined;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/setlists/${id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to setlist
          </Link>
        </Button>
      </div>

      <SongViewer
        song={song}
        sections={sections}
        ownerName={null}
        isOwner={user.id === song.created_by}
        canRemix
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
