create table if not exists public.setlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  share_token text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists setlists_set_updated_at on public.setlists;
create trigger setlists_set_updated_at
  before update on public.setlists
  for each row
  execute function public.set_updated_at();

create table if not exists public.setlist_songs (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  order_index integer not null,
  custom_key text,
  custom_tempo integer,
  custom_time_signature text,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_setlist_songs_setlist on public.setlist_songs(setlist_id, order_index);

alter table public.setlists enable row level security;
alter table public.setlist_songs enable row level security;

drop policy if exists "Setlists owned by user" on public.setlists;
drop policy if exists "Setlists owned by user manage" on public.setlists;
drop policy if exists "Setlists shared via token" on public.setlists;

create policy "Setlists owned by user" on public.setlists
  for select using (created_by = auth.uid());

create policy "Setlists owned by user manage" on public.setlists
  for all using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Setlists shared via token" on public.setlists
  for select using (
    share_token = coalesce(current_setting('request.headers.x-share-token', true), '')
  );

drop policy if exists "Setlist songs owned by user" on public.setlist_songs;
drop policy if exists "Setlist songs owned by user insert" on public.setlist_songs;
drop policy if exists "Setlist songs owned by user update" on public.setlist_songs;
drop policy if exists "Setlist songs owned by user delete" on public.setlist_songs;
drop policy if exists "Setlist songs shared via token" on public.setlist_songs;

create policy "Setlist songs owned by user" on public.setlist_songs
  for select using (
    exists (
      select 1
      from public.setlists s
      where s.id = setlist_songs.setlist_id
        and s.created_by = auth.uid()
    )
  );

create policy "Setlist songs owned by user insert" on public.setlist_songs
  for insert with check (
    exists (
      select 1
      from public.setlists s
      where s.id = setlist_songs.setlist_id
        and s.created_by = auth.uid()
    )
  );

create policy "Setlist songs owned by user update" on public.setlist_songs
  for update using (
    exists (
      select 1
      from public.setlists s
      where s.id = setlist_songs.setlist_id
        and s.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.setlists s
      where s.id = setlist_songs.setlist_id
        and s.created_by = auth.uid()
    )
  );

create policy "Setlist songs owned by user delete" on public.setlist_songs
  for delete using (
    exists (
      select 1
      from public.setlists s
      where s.id = setlist_songs.setlist_id
        and s.created_by = auth.uid()
    )
  );

create policy "Setlist songs shared via token" on public.setlist_songs
  for select using (
    exists (
      select 1
      from public.setlists s
      where s.id = setlist_songs.setlist_id
        and s.share_token = coalesce(current_setting('request.headers.x-share-token', true), '')
    )
  );

create policy "Songs viewable via shared setlist" on public.songs
  for select using (
    exists (
      select 1
      from public.setlist_songs ss
      join public.setlists sl on sl.id = ss.setlist_id
      where ss.song_id = songs.id
        and sl.share_token = coalesce(current_setting('request.headers.x-share-token', true), '')
    )
  );

create policy "Song sections viewable via shared setlist" on public.song_sections
  for select using (
    exists (
      select 1
      from public.setlist_songs ss
      join public.setlists sl on sl.id = ss.setlist_id
      where ss.song_id = song_sections.song_id
        and sl.share_token = coalesce(current_setting('request.headers.x-share-token', true), '')
    )
  );


