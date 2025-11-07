set search_path = public;

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  writer text,
  key text not null,
  tempo integer,
  time_signature text not null default '4/4',
  youtube_url text,
  tags text[] default '{}'::text[],
  is_public boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists songs_set_updated_at on public.songs;
create trigger songs_set_updated_at
  before update on public.songs
  for each row
  execute function public.set_updated_at();

create index if not exists idx_songs_created_by on public.songs(created_by);
create index if not exists idx_songs_is_public on public.songs(is_public);
create index if not exists idx_songs_created_at on public.songs(created_at desc);
create index if not exists idx_songs_title_tsv on public.songs using gin(to_tsvector('english', coalesce(title, '')));
create index if not exists idx_songs_artist_tsv on public.songs using gin(to_tsvector('english', coalesce(artist, '')));
create index if not exists idx_songs_tags on public.songs using gin(tags);

create table if not exists public.song_sections (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  type text not null check (type in ('verse', 'chorus', 'pre-chorus', 'bridge', 'refrain', 'intro', 'outro', 'instrumental', 'tag')),
  label text not null,
  order_index integer not null,
  lyrics text not null,
  chords jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_song_sections_song_id on public.song_sections(song_id);
create index if not exists idx_song_sections_order on public.song_sections(song_id, order_index);

alter table public.songs enable row level security;
alter table public.song_sections enable row level security;

drop policy if exists "Public songs are viewable by everyone" on public.songs;
create policy "Public songs are viewable by everyone"
  on public.songs for select
  using (is_public);

drop policy if exists "Users can view own songs" on public.songs;
create policy "Users can view own songs"
  on public.songs for select
  using (auth.uid() = created_by);

drop policy if exists "Authenticated users can create songs" on public.songs;
create policy "Authenticated users can create songs"
  on public.songs for insert
  with check (auth.uid() = created_by);

drop policy if exists "Users can update own songs" on public.songs;
create policy "Users can update own songs"
  on public.songs for update
  using (auth.uid() = created_by);

drop policy if exists "Users can delete own songs" on public.songs;
create policy "Users can delete own songs"
  on public.songs for delete
  using (auth.uid() = created_by);

drop policy if exists "Public song sections are viewable" on public.song_sections;
create policy "Public song sections are viewable"
  on public.song_sections for select
  using (
    exists (
      select 1
      from public.songs
      where songs.id = song_sections.song_id
        and songs.is_public
    )
  );

drop policy if exists "Users can view own song sections" on public.song_sections;
create policy "Users can view own song sections"
  on public.song_sections for select
  using (
    exists (
      select 1
      from public.songs
      where songs.id = song_sections.song_id
        and songs.created_by = auth.uid()
    )
  );

drop policy if exists "Users can manage own song sections" on public.song_sections;
create policy "Users can manage own song sections"
  on public.song_sections for all
  using (
    exists (
      select 1
      from public.songs
      where songs.id = song_sections.song_id
        and songs.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.songs
      where songs.id = song_sections.song_id
        and songs.created_by = auth.uid()
    )
  );
