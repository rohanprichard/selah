-- Split song_sections management policy to avoid multiple permissive SELECT policies

drop policy if exists "Sections manageable by owner" on public.song_sections;

create policy "Sections insert by owner" on public.song_sections
  for insert with check (
    exists (
      select 1
      from public.songs s
      where s.id = song_sections.song_id
        and s.created_by = (select auth.uid())
    )
  );

create policy "Sections update by owner" on public.song_sections
  for update using (
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

create policy "Sections delete by owner" on public.song_sections
  for delete using (
    exists (
      select 1
      from public.songs s
      where s.id = song_sections.song_id
        and s.created_by = (select auth.uid())
    )
  );
