-- Optimize RLS policies to avoid repeated auth lookups and consolidate permissive policies

drop policy if exists "Public songs are viewable by everyone" on public.songs;
drop policy if exists "Users can view own songs" on public.songs;
drop policy if exists "Authenticated users can create songs" on public.songs;
drop policy if exists "Users can update own songs" on public.songs;
drop policy if exists "Users can delete own songs" on public.songs;

create policy "Songs are viewable" on public.songs
  for select using (
    is_public
    or created_by = (select auth.uid())
  );

create policy "Songs insert by owner" on public.songs
  for insert with check (
    created_by = (select auth.uid())
  );

create policy "Songs update by owner" on public.songs
  for update using (
    created_by = (select auth.uid())
  );

create policy "Songs delete by owner" on public.songs
  for delete using (
    created_by = (select auth.uid())
  );

-- song_sections

drop policy if exists "Public song sections are viewable" on public.song_sections;
drop policy if exists "Users can view own song sections" on public.song_sections;
drop policy if exists "Users can manage own song sections" on public.song_sections;

create policy "Sections are viewable" on public.song_sections
  for select using (
    exists (
      select 1
      from public.songs s
      where s.id = song_sections.song_id
        and (
          s.is_public
          or s.created_by = (select auth.uid())
        )
    )
  );

create policy "Sections manageable by owner" on public.song_sections
  for all using (
    exists (
      select 1
      from public.songs s
      where s.id = song_sections.song_id
        and s.created_by = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.songs s
      where s.id = song_sections.song_id
        and s.created_by = (select auth.uid())
    )
  );

-- profiles

drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users insert own profile" on public.profiles
  for insert with check (
    id = (select auth.uid())
  );

create policy "Users update own profile" on public.profiles
  for update using (
    id = (select auth.uid())
  );
