import type { Setlist, SetlistSong, Song, SongSection } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { fetchSongById } from "@/lib/supabase/songs";

export type SetlistSummary = Pick<Setlist, "id" | "title" | "description" | "share_token" | "updated_at">;

export type SetlistSongWithMetadata = SetlistSong & {
  song: Song | null;
};

export type SetlistDetail = {
  setlist: Setlist;
  songs: SetlistSongWithMetadata[];
};

export async function fetchUserSetlists(): Promise<SetlistSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("setlists")
    .select("id, title, description, share_token, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SetlistSummary[];
}

export async function fetchSetlistForEditing(id: string): Promise<SetlistDetail> {
  const supabase = await createClient();

  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .select("id, title, description, share_token, created_by, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (setlistError) {
    throw new Error(setlistError.message);
  }

  if (!setlist) {
    throw new Error("Setlist not found");
  }

  const { data: entries, error: songsError } = await supabase
    .from("setlist_songs")
    .select(
      `
        id,
        setlist_id,
        song_id,
        order_index,
        custom_key,
        custom_tempo,
        custom_time_signature,
        notes,
        created_at,
        song:songs (
          id,
          title,
          artist,
          key,
          tempo,
          time_signature
        )
      `,
    )
    .eq("setlist_id", id)
    .order("order_index", { ascending: true});

  if (songsError) {
    throw new Error(songsError.message);
  }

  const formattedSongs =
    entries?.map((entry) => {
      const songRecord = entry.song as Song | Song[] | null;
      const normalizedSong = Array.isArray(songRecord) ? songRecord[0] : songRecord;
      return {
        id: entry.id,
        setlist_id: entry.setlist_id,
        song_id: entry.song_id,
        order_index: entry.order_index,
        custom_key: entry.custom_key,
        custom_tempo: entry.custom_tempo,
        custom_time_signature: entry.custom_time_signature,
        notes: entry.notes,
        created_at: entry.created_at,
        song: (normalizedSong ?? null) as Song | null,
      };
    }) ?? [];

  return {
    setlist: setlist as Setlist,
    songs: formattedSongs,
  };
}

export async function fetchSetlistByShareToken(
  token: string,
): Promise<SetlistDetail | null> {
  const supabase = await createClient({
    headers: {
      "x-share-token": token,
    },
  });

  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .select("id, title, description, share_token, created_by, created_at, updated_at")
    .eq("share_token", token)
    .maybeSingle();

  if (setlistError) {
    throw new Error(setlistError.message);
  }

  if (!setlist) {
    return null;
  }

  const { data: entries, error: songsError } = await supabase
    .from("setlist_songs")
    .select(
      `
        id,
        setlist_id,
        song_id,
        order_index,
        custom_key,
        custom_tempo,
        custom_time_signature,
        notes,
        created_at,
        song:songs (
          id,
          title,
          artist,
          key,
          tempo,
          time_signature
        )
      `,
    )
    .eq("setlist_id", (setlist as Setlist).id)
    .order("order_index", { ascending: true });

  if (songsError) {
    throw new Error(songsError.message);
  }

  const formattedSongs =
    entries?.map((entry) => {
      const songRecord = entry.song as Song | Song[] | null;
      const normalizedSong = Array.isArray(songRecord) ? songRecord[0] : songRecord;
      return {
        id: entry.id,
        setlist_id: entry.setlist_id,
        song_id: entry.song_id,
        order_index: entry.order_index,
        custom_key: entry.custom_key,
        custom_tempo: entry.custom_tempo,
        custom_time_signature: entry.custom_time_signature,
        notes: entry.notes,
        created_at: entry.created_at,
        song: (normalizedSong ?? null) as Song | null,
      };
    }) ?? [];

  return {
    setlist: setlist as Setlist,
    songs: formattedSongs,
  };
}

export type SetlistSongDetail = {
  setlist: Setlist;
  entry: SetlistSong;
  song: Song;
  sections: SongSection[];
};

export async function fetchSetlistSongForOwner(
  setlistId: string,
  entryId: string,
): Promise<SetlistSongDetail> {
  const supabase = await createClient();

  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .select("*")
    .eq("id", setlistId)
    .maybeSingle();

  if (setlistError || !setlist) {
    throw new Error(setlistError?.message ?? "Setlist not found");
  }

  const { data: entry, error: entryError } = await supabase
    .from("setlist_songs")
    .select(
      `id, setlist_id, song_id, order_index, custom_key, custom_tempo, custom_time_signature, notes, created_at`
    )
    .eq("setlist_id", setlistId)
    .eq("id", entryId)
    .maybeSingle();

  if (entryError || !entry) {
    throw new Error(entryError?.message ?? "Setlist song not found");
  }

  const songDetail = await fetchSongById(entry.song_id);

  return {
    setlist: setlist as Setlist,
    entry: entry as SetlistSong,
    song: songDetail.song,
    sections: songDetail.sections,
  };
}

export async function fetchSetlistSongByToken(
  token: string,
  entryId: string,
): Promise<SetlistSongDetail | null> {
  const supabase = await createClient({ headers: { "x-share-token": token } });

  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();

  if (setlistError || !setlist) {
    return null;
  }

  const { data: entry, error: entryError } = await supabase
    .from("setlist_songs")
    .select(
      `id, setlist_id, song_id, order_index, custom_key, custom_tempo, custom_time_signature, notes, created_at`
    )
    .eq("setlist_id", setlist.id)
    .eq("id", entryId)
    .maybeSingle();

  if (entryError || !entry) {
    return null;
  }

  try {
    const songDetail = await fetchSongById(entry.song_id, {
      headers: { "x-share-token": token },
    });

    return {
      setlist: setlist as Setlist,
      entry: entry as SetlistSong,
      song: songDetail.song,
      sections: songDetail.sections,
    };
  } catch (error) {
    console.error("Failed to load song via share token", error);
    return null;
  }
}

