import Link from "next/link";
import { redirect } from "next/navigation";

import { MySongsTable } from "@/components/my-songs-table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Song } from "@/lib/types";

export default async function MySongsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login?next=/my-songs");
  }

  const { data: songs = [] } = await supabase
    .from("songs")
    .select("*")
    .eq("created_by", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">My Songs</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage your private and public chord charts.
          </p>
        </div>
        <Button asChild>
          <Link href="/songs/new">Create song</Link>
        </Button>
      </div>

      <MySongsTable songs={songs as Song[]} />
    </div>
  );
}

