import { redirect, notFound } from "next/navigation";

import { SongEditor } from "@/components/song-editor";
import { fetchSongDetail } from "@/lib/supabase/songs";

type EditSongPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: EditSongPageProps) {
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

  if (!detail.isOwner) {
    redirect(`/songs/${id}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <SongEditor mode="edit" song={detail.song} sections={detail.sections} />
    </div>
  );
}

