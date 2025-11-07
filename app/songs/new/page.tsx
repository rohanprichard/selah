import { redirect } from "next/navigation";

import { SongEditor } from "@/components/song-editor";
import { createClient } from "@/lib/supabase/server";

export default async function NewSongPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login?next=/songs/new");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <SongEditor mode="create" />
    </div>
  );
}

