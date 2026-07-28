# Selah — Project Context for AI Assistants

> Pause. Prepare. Worship.

Selah is an open-source worship song management platform. It helps church worship teams organize chord charts, lyrics, and setlists.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript strict mode
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Styling:** Tailwind CSS + shadcn/ui component library
- **Music Theory:** Tonal.js for chord transposition
- **Testing:** Vitest with TypeScript
- **Validation:** Zod for form/API validation
- **State:** React Server Components + Server Actions + React hooks
- **Auth:** Supabase Auth (email/password + Google OAuth)

## Project Structure

```
app/                        # Next.js App Router pages
  (authenticated)/          # Protected routes group
  api/songs/route.ts        # Programmatic song import API
  auth/                     # Auth pages (login, signup, reset)
  songs/                    # Song library, viewer, editor, remix
  setlists/                 # Setlist management
  s/[token]/                # Shared (public) setlist views
components/
  chords/                   # Guitar/piano chord visualizers
  setlists/                 # Setlist-specific components
  ui/                       # shadcn/ui primitives
  song-viewer.tsx           # [TODO: split] Main song display
  song-editor.tsx           # [TODO: split] Song form editor
  song-card.tsx             # Song card for library grid
  song-filters.tsx          # Search/filter controls
lib/
  chords.ts                 # Chord parsing, transposition, formatting
  guitar-chords.ts          # Guitar chord library and lookup
  constants/music.ts        # Musical keys, section types, constants
  validation/songs.ts       # Zod schemas for song CRUD
  supabase/                 # Supabase client factories & queries
  utils.ts                  # General utilities (cn helper, etc.)
scripts/                    # Legacy Python scripts for LLM song import
supabase/migrations/        # Database migration SQL
tests/                      # Vitest test suites
docs/                       # Documentation and screenshots
```

## Key Architecture Decisions

### Data Flow
- Server Components fetch data directly from Supabase
- Server Actions handle mutations (create/update/delete)
- `revalidatePath()` triggers cache invalidation after mutations
- Client components use `useRouter().refresh()` for optimistic UI updates

### Authentication
- Auth middleware protects `/my-songs`, `/songs/new`, `/songs/[id]/edit`
- RLS policies enforce: public songs visible to everyone, private songs visible to owners
- Service role key used for admin operations (API import endpoint)

### Song Data Model
- `songs` table: title, artist, writer, key, tempo, time_signature, youtube_url, tags[], is_public, created_by
- `song_sections` table: type (verse/chorus/bridge/etc.), label, lyrics (with inline [Chord] notation), order_index
- Sections are ordered by `order_index`, rendered with chords positioned absolutely above lyrics

### Chord Notation
- Chords inline in lyrics: `[G]Amazing grace, how [C]sweet the [G]sound`
- Parser extracts chord positions and transposes via Tonal.js
- Supports slash chords (G/B), extended chords (Gmaj7), and enharmonic normalization

## Available Scripts

```bash
npm run dev        # Next.js dev with Turbopack
npm run build      # Production build
npm run lint       # ESLint with Next.js + TypeScript config
npm run typecheck  # tsc --noEmit
npm run test       # Vitest unit tests
```

## Important Conventions

1. **No lint errors allowed.** Run `npm run lint` before committing.
2. **TypeScript strict mode.** Run `npm run typecheck` to verify.
3. **All tests must pass.** Run `npm run test`.
4. **shadcn/ui components** are in `components/ui/` — use them, don't reinvent.
5. **Server Components by default**, only use `"use client"` when needed.
6. **Zod validation** for all form inputs and API payloads.
7. **Catch blocks** use empty `catch {}` (not `catch (error)`) when the error object isn't used.
8. **`&rsquo;` instead of `'`** in JSX text content (react/no-unescaped-entities).
9. **Commit messages** follow conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=          # Supabase service role (server only)
AI_SONG_IMPORT_TOKEN=               # Bearer token for /api/songs
```

## Deployment

Optimized for Vercel + Supabase. See `docs/selah-deployment.md`.
