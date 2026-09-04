import { Suspense } from "react";

import { PaginationControls } from "@/components/pagination-controls";
import { SongCard } from "@/components/song-card";
import { SongFilters } from "@/components/song-filters";
import { Card, CardContent } from "@/components/ui/card";
import { parseSongLibraryParams } from "@/lib/song-library";
import { fetchPublicSongs } from "@/lib/supabase/songs";

type SongsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SongsPage({ searchParams }: SongsPageProps) {
  const filters = parseSongLibraryParams(await searchParams);
  const hasFilters = Boolean(filters.query || filters.key || filters.tag);

  try {
    const result = await fetchPublicSongs(filters);

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:py-14">
        <section className="max-w-2xl space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Song library</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find a chart for your next service</h1>
          <p className="text-base leading-7 text-muted-foreground">
            Browse public charts, then filter by title, artist, key, or tag.
          </p>
        </section>

        <Suspense fallback={<FiltersFallback />}>
          <SongFilters
            initialQuery={filters.query}
            initialKey={filters.key}
            initialTag={filters.tag}
            availableTags={result.availableTags}
          />
        </Suspense>

        {result.songs.length > 0 ? (
          <section aria-live="polite" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {hasFilters ? "Showing" : "Browse"} {result.songs.length} of {result.total} chart{result.total === 1 ? "" : "s"}.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {result.songs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
            {result.total > result.pageSize ? (
              <PaginationControls currentPage={result.page} pageSize={result.pageSize} totalItems={result.total} />
            ) : null}
          </section>
        ) : (
          <EmptyState hasFilters={hasFilters} />
        )}
      </div>
    );
  } catch (error) {
    return <ErrorState message={error instanceof Error ? error.message : "Unable to load songs"} />;
  }
}

function FiltersFallback() {
  return (
    <Card className="animate-pulse">
      <CardContent className="h-32" />
    </Card>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-2 py-12 text-center">
        <h2 className="text-xl font-semibold">{hasFilters ? "No matching charts" : "No public charts yet"}</h2>
        <p className="text-sm text-muted-foreground">
          {hasFilters ? "Change the filters, then search again." : "Add a public song to start the library."}
        </p>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <Card className="border-destructive/40 bg-destructive/10">
        <CardContent className="py-6 text-sm text-destructive-foreground">{message}</CardContent>
      </Card>
    </div>
  );
}
