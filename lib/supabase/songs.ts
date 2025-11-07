import type { SupabaseClient } from "@supabase/supabase-js";

import { MUSICAL_KEYS, type MusicalKey } from "@/lib/constants/music";
import { createClient } from "@/lib/supabase/server";
import type { Song, SongSection } from "@/lib/types";

export type SongFilters = {
  query?: string;
  key?: MusicalKey | "";
  tag?: string;
  page?: number;
  pageSize?: number;
};

export type SongsResult = {
  songs: Song[];
  total: number;
  page: number;
  pageSize: number;
  availableTags: string[];
};

const DEFAULT_PAGE_SIZE = 20;

export async function fetchPublicSongs(filters: SongFilters = {}): Promise<SongsResult> {
  const { query = "", key = "", tag = "", page = 1, pageSize = DEFAULT_PAGE_SIZE } = filters;
  const supabase = await createClient();

  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;

  let songsQuery = supabase
    .from("songs")
    .select("*", { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query.trim()) {
    const search = `%${query.trim()}%`;
    songsQuery = songsQuery.or(
      `title.ilike.${search},artist.ilike.${search},writer.ilike.${search}`,
    );
  }

  if (key && MUSICAL_KEYS.includes(key)) {
    songsQuery = songsQuery.eq("key", key);
  }

  if (tag.trim()) {
    songsQuery = songsQuery.contains("tags", [tag.trim()]);
  }

  const { data: songs = [], error, count } = await songsQuery;

  if (error) {
    throw new Error(error.message);
  }

  const availableTags = await fetchAvailableTags(supabase);

  return {
    songs: songs as Song[],
    total: count ?? 0,
    page,
    pageSize,
    availableTags,
  };
}

async function fetchAvailableTags(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("tags")
    .eq("is_public", true);

  if (error) {
    throw new Error(error.message);
  }

  const tags = new Set<string>();
  for (const record of data ?? []) {
    if (Array.isArray(record.tags)) {
      for (const tag of record.tags) {
        if (typeof tag === "string" && tag.trim()) {
          tags.add(tag.trim());
        }
      }
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export type SongDetailResult = {
  song: Song;
  sections: SongSection[];
  isOwner: boolean;
};

export async function fetchSongDetail(id: string): Promise<SongDetailResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("songs")
    .select("*, song_sections(*)")
    .eq("id", id)
    .order("order_index", { foreignTable: "song_sections", ascending: true })
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Song not found");
  }

  const { song_sections: rawSections, ...rest } = data as Song & {
    song_sections: SongSection[] | null;
  };

  const sections = (rawSections ?? []).sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
  );

  return {
    song: rest,
    sections,
    isOwner: Boolean(user && user.id === rest.created_by),
  };
}

