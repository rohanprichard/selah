-- Add 'label' section type for band directions and markers
-- Label sections display only the label text without lyrics/chords

alter table public.song_sections 
drop constraint if exists song_sections_type_check;

alter table public.song_sections 
add constraint song_sections_type_check 
check (type in ('verse', 'chorus', 'pre-chorus', 'bridge', 'refrain', 'intro', 'outro', 'instrumental', 'tag', 'label'));

comment on constraint song_sections_type_check on public.song_sections is 'Section types include label for band directions like "Prayer", "Sermon", etc.';

