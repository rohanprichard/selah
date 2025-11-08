import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SongViewer } from "@/components/song-viewer";
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

  const { entry, song, sections, setlist } = detail;

  const initialTranspose = calculateInitialTranspose(song.key, entry.custom_key);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/setlists" className="underline underline-offset-4">
              My Setlists
            </Link>
            {" / "}
            <Link href={`/setlists/${setlist.id}`} className="underline underline-offset-4">
              {setlist.title}
            </Link>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {song.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Showing setlist settings for this song
          </p>
        </div>
        <Button asChild variant="secondary" className="gap-2">
          <Link href={`/setlists/${setlist.id}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to {setlist.title}</span>
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
      />
    </div>
  );
}
