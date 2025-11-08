import { notFound, redirect } from "next/navigation";

import { SongEditor } from "@/components/song-editor";
import { fetchSongById } from "@/lib/supabase/songs";
import { createClient } from "@/lib/supabase/server";

type RemixPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RemixSongPage({ params }: RemixPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/songs/${id}/remix`);
  }

  let detail;
  try {
    detail = await fetchSongById(id);
  } catch {
    notFound();
  }

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <SongEditor
        mode="create"
        template={{
          song: detail.song,
          sections: detail.sections,
          titleSuffix: " (Remix)",
        }}
      />
    </div>
  );
}


