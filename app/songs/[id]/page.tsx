import { notFound } from "next/navigation";

import { SongViewer } from "@/components/song-viewer";
import { calculateInitialTranspose } from "@/lib/music/transposition";
import {
  fetchSetlistSongByToken,
  fetchSetlistSongForOwner,
  type SetlistSongDetail,
} from "@/lib/supabase/setlists";
import { fetchSongDetail } from "@/lib/supabase/songs";

type SongDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ setlistId?: string; entryId?: string; shareToken?: string }>;
};

export default async function SongDetailPage({ params, searchParams }: SongDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};

  const shareToken = query.shareToken;

  let detail;
  try {
    detail = await fetchSongDetail(id, shareToken ? { headers: { "x-share-token": shareToken } } : undefined);
  } catch {
    notFound();
  }

  if (!detail) {
    notFound();
  }

  const hasSetlistContext = Boolean(query.entryId);
  let setlistContext: SetlistSongDetail | null = null;

  if (hasSetlistContext && query.entryId) {
    if (shareToken) {
      setlistContext = await fetchSetlistSongByToken(shareToken, query.entryId);
    } else if (query.setlistId) {
      try {
        setlistContext = await fetchSetlistSongForOwner(query.setlistId, query.entryId);
      } catch (error) {
        console.error("Failed to load owner setlist context", error);
        setlistContext = null;
      }
    }
  }

  const appliesToThisSong = setlistContext?.song?.id === detail.song.id;

  const overrideKey = appliesToThisSong ? setlistContext?.entry.custom_key ?? null : null;
  const overrideTempo = appliesToThisSong ? setlistContext?.entry.custom_tempo ?? null : null;
  const overrideTimeSignature = appliesToThisSong
    ? setlistContext?.entry.custom_time_signature ?? null
    : null;
  const overrideNotes = appliesToThisSong ? setlistContext?.entry.notes ?? null : null;
  const initialTranspose = appliesToThisSong
    ? calculateInitialTranspose(detail.song.key, overrideKey)
    : undefined;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <SongViewer
        song={detail.song}
        sections={detail.sections}
        isOwner={detail.isOwner}
        ownerName={detail.ownerName}
        canRemix={detail.canRemix}
        notes={overrideNotes ?? undefined}
        initialTranspose={initialTranspose}
        overrideKey={overrideKey}
        overrideTempo={overrideTempo}
        overrideTimeSignature={overrideTimeSignature}
      />
    </div>
  );
}

