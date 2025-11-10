-- Add arrangement column to setlist_songs table
-- This stores an array of section indices representing the order and repetition of sections
-- e.g., [0, 1, 0, 1, 2, 1] means: section 0, section 1, section 0, section 1, section 2, section 1
-- null means: use the original section order

alter table public.setlist_songs
add column if not exists arrangement jsonb default null;

comment on column public.setlist_songs.arrangement is 'Array of section indices defining the order and repetition of song sections for this setlist entry';

