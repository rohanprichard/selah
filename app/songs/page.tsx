import { Suspense } from "react";

import { SongCard } from "@/components/song-card";
import { SongFilters } from "@/components/song-filters";
import { PaginationControls } from "@/components/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MUSICAL_KEYS } from "@/lib/constants/music";
import { fetchAvailableSongTags, fetchPublicSongs } from "@/lib/supabase/songs";

type SongsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SongsPage({ searchParams }: SongsPageProps) {
  const params = await searchParams;
  const queryParam = getSingleValue(params.q)?.trim();
  const keyParam = getSingleValue(params.key);
  const tagParam = getSingleValue(params.tag)?.trim();
  const pageParam = getSingleValue(params.page);

  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const keyFilter = keyParam && MUSICAL_KEYS.includes(keyParam as (typeof MUSICAL_KEYS)[number]) ? keyParam : "";
  const hasFilters = Boolean(queryParam) || Boolean(keyFilter) || Boolean(tagParam);

  let availableTags: string[] = [];
  let result:
    | Awaited<ReturnType<typeof fetchPublicSongs>>
    | null = null;

  try {
    if (hasFilters) {
      result = await fetchPublicSongs({
        query: queryParam ?? "",
        key: keyFilter as (typeof MUSICAL_KEYS)[number] | "",
        tag: tagParam ?? "",
        page,
      });
      availableTags = result.availableTags;
    } else {
      availableTags = await fetchAvailableSongTags();
    }
  } catch (error) {
    return <ErrorState message={error instanceof Error ? error.message : "Unable to load songs"} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
      <section className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Search the Song Library</h1>
        <p className="text-muted-foreground">
          Find chord charts shared by the community. Filter by title, artist, key, or tag to surface the song you need.
        </p>
      </section>

      <Suspense fallback={<FiltersFallback />}>
        <SongFilters
          initialQuery={queryParam ?? ""}
          initialKey={keyFilter}
          initialTag={tagParam ?? ""}
          availableTags={availableTags}
        />
      </Suspense>

      {!hasFilters ? (
        <SearchPrompt />
      ) : result && result.songs.length > 0 ? (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Showing {result.songs.length} of {result.total} match{result.total === 1 ? "" : "es"}.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
          {result.total > result.pageSize ? (
            <PaginationControls
              currentPage={result.page}
              pageSize={result.pageSize}
              totalItems={result.total}
            />
          ) : null}
        </div>
      ) : (
        <EmptyState />
      )}
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

function SearchPrompt() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <Badge variant="secondary" className="uppercase">
          Start searching
        </Badge>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Find the right chart</h2>
          <p className="text-sm text-muted-foreground">
            Take a breath, then search by title, artist, tag, or key to surface the song you need.
          </p>
        </div>
      </CardContent>
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
            Try a different title, adjust the key, or explore another tag to keep the moment moving.
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

