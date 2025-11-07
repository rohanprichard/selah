import type { SectionType } from "@/lib/constants/music";

export type Song = {
  id: string;
  title: string;
  artist: string | null;
  writer: string | null;
  key: string;
  tempo: number | null;
  time_signature: string | null;
  youtube_url: string | null;
  tags: string[] | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SongSection = {
  id: string;
  song_id: string;
  type: SectionType;
  label: string;
  order_index: number;
  lyrics: string;
  chords: unknown;
  created_at: string;
};

export type SongWithSections = Song & {
  sections: SongSection[];
};

