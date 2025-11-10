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

export type Setlist = {
  id: string;
  title: string;
  description: string | null;
  share_token: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CustomSectionData = {
  type: 'custom';
  label: string;
  content?: string;
  sectionIndex?: number;
};

export type ArrangementItem = number | CustomSectionData;

export type SetlistSong = {
  id: string;
  setlist_id: string;
  song_id: string;
  order_index: number;
  custom_key: string | null;
  custom_tempo: number | null;
  custom_time_signature: string | null;
  notes: string | null;
  arrangement: ArrangementItem[] | null;
  created_at: string;
};

