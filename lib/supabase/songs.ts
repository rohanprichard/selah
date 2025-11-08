import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeMusicalKey } from "@/lib/constants/music";
import { createClient } from "@/lib/supabase/server";
import type { Song, SongSection } from "@/lib/types";
import type { CreateClientOptions } from "@/lib/supabase/server";

export type SongFilters = {
  query?: string;
  key?: string;
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

  const normalizedKey = normalizeMusicalKey(key);
  if (normalizedKey) {
    songsQuery = songsQuery.eq("key", normalizedKey);
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

export async function fetchAvailableSongTags(): Promise<string[]> {
  const supabase = await createClient();
  return fetchAvailableTags(supabase);
}

export type SongDetailResult = {
  song: Song;
  sections: SongSection[];
  isOwner: boolean;
  ownerName: string | null;
  canRemix: boolean;
};

export async function fetchSongDetail(
  id: string,
  options?: CreateClientOptions,
): Promise<SongDetailResult> {
  const supabase = await createClient(options);
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

  let ownerName: string | null = null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", rest.created_by)
    .maybeSingle();
  ownerName = profile?.full_name ?? null;

  return {
    song: rest,
    sections,
    isOwner: Boolean(user && user.id === rest.created_by),
    ownerName,
    canRemix: Boolean(user),
  };
}

export async function fetchSongById(id: string, options?: CreateClientOptions) {
  const supabase = await createClient(options);

  const { data: song, error: songError } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (songError || !song) {
    throw new Error(songError?.message ?? "Song not found");
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("song_sections")
    .select("*")
    .eq("song_id", id)
    .order("order_index", { ascending: true });

  if (sectionsError) {
    throw new Error(sectionsError.message);
  }

  return {
    song: song as Song,
    sections: (sections ?? []) as SongSection[],
  };
}

