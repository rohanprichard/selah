import { Suspense } from "react";

import { SongCard } from "@/components/song-card";
import { SongFilters } from "@/components/song-filters";
import { PaginationControls } from "@/components/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MUSICAL_KEYS } from "@/lib/constants/music";
import { fetchPublicSongs } from "@/lib/supabase/songs";

type SongsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SongsPage({ searchParams }: SongsPageProps) {
  const params = await searchParams;
  const queryParam = getSingleValue(params.q);
  const keyParam = getSingleValue(params.key);
  const tagParam = getSingleValue(params.tag);
  const pageParam = getSingleValue(params.page);

  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const keyFilter = keyParam && MUSICAL_KEYS.includes(keyParam as (typeof MUSICAL_KEYS)[number]) ? keyParam : "";

  let result;
  try {
    result = await fetchPublicSongs({
      query: queryParam ?? "",
      key: keyFilter as (typeof MUSICAL_KEYS)[number] | "",
      tag: tagParam ?? "",
      page,
    });
  } catch (error) {
    return <ErrorState message={error instanceof Error ? error.message : "Unable to load songs"} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Song Library</h1>
        <p className="text-muted-foreground">
          Browse public chord charts submitted by the community. Use filters to narrow down by key, tags, or search the catalog.
        </p>
      </section>

      <Suspense fallback={<FiltersFallback />}>
        <SongFilters
          initialQuery={queryParam ?? ""}
          initialKey={keyFilter}
          initialTag={tagParam ?? ""}
          availableTags={result.availableTags}
        />
      </Suspense>

      {result.songs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}

      <PaginationControls
        currentPage={result.page}
        pageSize={result.pageSize}
        totalItems={result.total}
      />
    </div>
  );
}

function getSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function FiltersFallback() {
  return (
    <Card className="animate-pulse">
      <CardContent className="h-32" />
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <Badge variant="secondary" className="uppercase">
          No matches
        </Badge>
        <div>
          <h2 className="text-lg font-semibold">No songs found</h2>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or check back later for new community submissions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40 bg-destructive/10">
      <CardContent className="py-6 text-sm text-destructive-foreground">
        {message}
      </CardContent>
    </Card>
  );
}

