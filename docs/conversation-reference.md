# Selah Conversation Reference

This document summarizes the major requests and responses exchanged while building and polishing Selah.

## Timeline Highlights

1. **Initial Planning**  
   - Drafted multi-phase roadmap for CCM Setlist Builder.  
   - Implemented Supabase schema, authentication flows, songs library, viewer, and editor.

2. **Phase 2 Implementation Updates**  
   - Delivered song discovery experience with filters, pagination, and cards.  
   - Built the viewer with chord parsing/transposition, print/share, and font controls.  
   - Shipped song editor with section management, CRUD actions, and My Songs dashboard.

3. **Brand Refresh to Selah**  
   - Adopted “Selah — Pause. Prepare. Worship.” messaging.  
   - Replaced navigation, hero, footer, metadata, docs, and scripts with the Selah branding.  
   - Introduced a calm color palette (indigo/navy, warm gold, sage) with light/dark switching.

4. **Browse/Search Refinement**  
   - Converted the `/songs` page into a search-first experience that requires filters before listing results.  
   - Added movement-aware empty states and tightened copy.

5. **OAuth & Auth Polish**  
   - Wired Google OAuth through `/auth/callback`, exchanging tokens server-side before redirect.  
   - Updated auth pages to redirect signed-in users away, and refreshed form copy to match Selah tone.

6. **Supabase RLS Optimization**  
   - Consolidated RLS policies to avoid repeated `auth.uid()` calls and multiple permissive policies.  
   - Split song_sections management policies into insert/update/delete for performance.

7. **Color Palette Iterations**  
   - Adjusted light theme background to `#f9f4eb` and primary text/action color to `#173121`.  
   - Ensured buttons, headings, and muted states matched the tone while dark theme stayed consistent.

8. **UI Content Tweaks**  
   - Refined hero headline, onboarding text, empty states (“Your Selah space is ready”), and dashboard copy.  
   - Added a round pause-icon favicon (`app/icon.svg`).

9. **Deployment Guidance**  
   - Recorded the Vercel + Supabase deployment checklist (`docs/selah-deployment.md`).

## Key Decisions & Actions

- Use Supabase service role via `/app/api/songs` for AI imports, documented in `docs/song-import-api.md`.
- Store user display names in `profiles` during auth confirmation for header personalization.  
- Keep empty state prompts gentle and actionable, aligning with “pause, prepare, worship.”
- Maintain automation scripts (`scripts/import_song.py`, `scripts/song_models.py`) with `SELAH_*` environment variables.
- Provide deployment instructions covering environment variables, OAuth callbacks, and smoke tests.

## Useful Files to Reference

- `app/globals.css` — theme tokens for light/dark Selah palette.  
- `docs/selah-deployment.md` — production deployment steps.  
- `docs/song-import-api.md` — API contract for automated song ingestion.  
- `components/hero.tsx`, `app/page.tsx` — landing page messaging.  
- `components/login-form.tsx`, `components/sign-up-form.tsx` — auth tone and Google OAuth usage.

This log captures the core conversation outcomes for future reference.

