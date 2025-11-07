import { notFound } from "next/navigation";

import { SongViewer } from "@/components/song-viewer";
import { fetchSongDetail } from "@/lib/supabase/songs";

type SongDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SongDetailPage({ params }: SongDetailPageProps) {
  const { id } = await params;

  let detail;
  try {
    detail = await fetchSongDetail(id);
  } catch {
    notFound();
  }

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <SongViewer song={detail.song} sections={detail.sections} isOwner={detail.isOwner} />
    </div>
  );
}

