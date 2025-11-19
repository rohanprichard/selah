# Selah Repository Overview

## Project Summary

**Selah** is a Next.js-based web application designed to help Christian worship teams organize, manage, and share songs with chord charts, lyrics, and video links. Users can create personal song libraries, transpose chords to different keys, and organize songs into setlists for church services. The platform emphasizes ease-of-use for worship leaders with features like chord transposition, printable layouts, YouTube embeds, and shareable setlists.

---

## Tech Stack

### Core Framework
- **Next.js 14** with App Router (latest version) - Full-stack React framework
- **TypeScript** (v5, strict mode enabled) - Type safety throughout the codebase
- **React 19** - Latest React with concurrent features

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - User authentication (email/password + Google OAuth)
  - Row Level Security (RLS) policies
  - Real-time capabilities
- **Supabase SSR** - Server-side rendering compatible auth

### UI & Styling
- **Tailwind CSS** (v3.4.1) - Utility-first CSS framework
- **shadcn/ui** - Reusable component library built on Radix UI:
  - `@radix-ui/react-alert-dialog`
  - `@radix-ui/react-checkbox`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-label`
  - `@radix-ui/react-select`
  - `@radix-ui/react-slot`
- **next-themes** - Dark mode support
- **lucide-react** - Icon library
- **class-variance-authority** + **clsx** + **tailwind-merge** - Component styling utilities

### Music & Chords
- **Tonal.js** (@tonaljs/tonal v4.10.0) - Music theory library for:
  - Chord parsing and recognition
  - Key transposition
  - Interval calculations
  - Note normalization

### Other Libraries
- **Zod** (v3.23.8) - Schema validation for forms
- **Sonner** (v1.5.0) - Toast notification system
- **Vitest** (v2.1.4) - Unit testing framework

---

## Database Schema

### Core Tables

#### `songs`
Main table storing song metadata and information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `title` | text | Song title (required) |
| `artist` | text | Artist/band name |
| `writer` | text | Songwriter |
| `key` | text | Musical key (required) |
| `tempo` | integer | BPM (beats per minute) |
| `time_signature` | text | Default '4/4' |
| `youtube_url` | text | YouTube video link |
| `tags` | text[] | Array of tags for categorization |
| `is_public` | boolean | Public visibility flag |
| `created_by` | uuid | Foreign key to auth.users |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**Indexes:**
- Full-text search on title and artist (GIN indexes with tsvector)
- GIN index on tags array
- B-tree indexes on `created_by`, `is_public`, `created_at`

#### `song_sections`
Stores individual sections of songs (verses, choruses, bridges, etc.) with lyrics and chord positions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `song_id` | uuid (FK) | References songs table |
| `type` | text | Section type (enum: verse, chorus, pre-chorus, bridge, refrain, intro, outro, instrumental, tag, label) |
| `label` | text | Display label (e.g., "Verse 1") |
| `order_index` | integer | Display order |
| `lyrics` | text | Section lyrics with inline chords |
| `chords` | jsonb | Chord data structure |
| `created_at` | timestamptz | Creation timestamp |

**Indexes:**
- Composite index on `(song_id, order_index)` for ordered retrieval

#### `setlists`
Collections of songs organized for specific services or events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `title` | text | Setlist name (required) |
| `description` | text | Optional description |
| `share_token` | text | Unique token for sharing (unique constraint) |
| `created_by` | uuid | Foreign key to auth.users |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

#### `setlist_songs`
Join table linking songs to setlists with custom overrides.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `setlist_id` | uuid (FK) | References setlists |
| `song_id` | uuid (FK) | References songs |
| `order_index` | integer | Position in setlist |
| `custom_key` | text | Override default key |
| `custom_tempo` | integer | Override default tempo |
| `custom_time_signature` | text | Override default time signature |
| `notes` | text | Performance notes |
| `arrangement` | jsonb | Custom section arrangement |
| `created_at` | timestamptz | Creation timestamp |

**Indexes:**
- Composite index on `(setlist_id, order_index)`

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

**Songs:**
- Public songs viewable by everyone
- Users can view/create/update/delete their own songs
- Songs in shared setlists are viewable via share token

**Song Sections:**
- Viewable if parent song is public or owned by current user
- Users can manage sections for their own songs
- Sections viewable via shared setlist tokens

**Setlists:**
- Users can manage their own setlists
- Setlists viewable via unique share token (header: `x-share-token`)

**Setlist Songs:**
- Users can manage songs in their own setlists
- Viewable via share token mechanism

---

## Project Structure

```
selah/
├── app/                          # Next.js App Router pages
│   ├── (authenticated)/          # Protected routes
│   │   └── ... (requires auth)
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   │   ├── login, sign-up, forgot-password, etc.
│   ├── s/                        # Shared setlist viewer (public)
│   ├── setlists/                 # Setlist management
│   │   ├── [id]/                # View/edit individual setlist
│   │   ├── actions.ts           # Server actions
│   │   └── page.tsx             # Setlist list page
│   ├── songs/                    # Song library & management
│   │   ├── [id]/                # Song viewer
│   │   │   ├── edit/           # Song editor
│   │   │   └── page.tsx        # Song viewer page
│   │   ├── new/                # Create new song
│   │   ├── actions.ts          # Server actions (CRUD)
│   │   └── page.tsx            # Song library/search page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui primitives (10 components)
│   │   ├── button.tsx, input.tsx, select.tsx, etc.
│   ├── setlists/                # Setlist-specific components
│   ├── auth-button.tsx          # Authentication UI
│   ├── song-card.tsx            # Song grid card
│   ├── song-editor.tsx          # Multi-section song editor (582 lines)
│   ├── song-viewer.tsx          # Song display with transpose (431 lines)
│   ├── song-filters.tsx         # Search & filter controls
│   ├── my-songs-table.tsx       # Personal song dashboard
│   ├── site-header.tsx          # Navigation header
│   ├── site-footer.tsx          # Footer
│   └── theme-switcher.tsx       # Dark mode toggle
│
├── lib/                          # Utilities and helpers
│   ├── supabase/                # Supabase client factories (6 files)
│   │   ├── client.ts, server.ts, middleware.ts, etc.
│   ├── constants/               # App constants
│   ├── music/                   # Music-related constants
│   ├── validation/              # Zod schemas
│   ├── chords.ts                # Chord parsing & transposition (154 lines)
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Utility functions
│
├── supabase/                     # Database migrations
│   └── migrations/
│       ├── 0001_base_schema.sql           # Songs & song_sections
│       ├── 0003_optimize_rls_policies.sql # RLS optimizations
│       ├── 0004_optimize_song_section_policies.sql
│       ├── 0005_setlists.sql              # Setlists & sharing
│       ├── 0006_song_arrangement.sql      # Custom arrangements
│       └── 0007_add_label_section_type.sql # Section type update
│
├── tests/                        # Unit tests
├── middleware.ts                 # Auth middleware
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind configuration
└── next.config.ts                # Next.js configuration
```

---

## Core Features

### 1. Song Library (`/songs`)
- **Full-text search** on title and artist
- **Filtering** by key and tags
- **Pagination** for large song collections
- **Responsive grid layout** with song cards
- Public/private song visibility

### 2. Song Viewer (`/songs/[id]`)
- **Metadata display**: title, artist, writer, key, tempo, time signature
- **Chord transposition**: 
  - Uses Tonal.js for accurate music theory
  - Transpose up/down in semitones
  - Visual feedback showing original → transposed key
  - Normalizes flats to sharps (e.g., Bb → A#)
- **Font size controls**: Small, Medium, Large
- **YouTube embed**: Inline video player for reference recordings
- **Share functionality**: Copy link to clipboard
- **Print-friendly layout**: Clean CSS for printing chord sheets
- **Edit shortcuts**: Quick access for song owners
- **Remix option**: Create new song based on existing (if allowed)

### 3. Song Editor (`/songs/new`, `/songs/[id]/edit`)
- **Multi-section editor**:
  - Add/remove/reorder sections
  - Section types: verse, chorus, pre-chorus, bridge, refrain, intro, outro, instrumental, tag, label
  - Each section has type, label, and lyrics
- **Form validation** using Zod schemas
- **Real-time error feedback**
- **Server actions** for create/update operations
- **Optimistic UI updates** with toast notifications (Sonner)
- **Template support**: Create songs from existing ones
- **Lyrics with inline chords**: Format `[C]Chord [G]positions`

### 4. Setlist Management (`/setlists`)
- **Create and organize setlists** for services
- **Add songs to setlists** with custom ordering
- **Override song properties** per setlist:
  - Custom key (different from song default)
  - Custom tempo
  - Custom time signature
  - Performance notes
  - Custom section arrangement (reorder/exclude sections)
- **Share setlists** via unique tokens:
  - Shareable public URLs (`/s/[token]`)
  - No authentication required for viewers
  - Read-only access to setlist and associated songs

### 5. My Songs Dashboard (`/my-songs`)
- **Authenticated management view**
- **Quick actions**: View, Edit, Delete
- **Table layout** with song metadata
- **Cascade revalidation** after mutations
- **Optimistic updates** with toast feedback

### 6. Authentication & Authorization
- **Email/password authentication** via Supabase Auth
- **Google OAuth** integration
- **Protected routes** via middleware:
  - `/my-songs`
  - `/songs/new`
  - `/songs/[id]/edit`
  - `/setlists/**`
- **Row Level Security** ensures data isolation
- **Session management** with Supabase SSR

### 7. Accessibility
- Skip navigation link
- Focus-visible states on interactive elements
- Semantic HTML headings
- Print-friendly variants
- Keyboard navigation support

---

## Key Technical Details

### Chord Parsing & Transposition
The `lib/chords.ts` module provides sophisticated chord handling:

**Parsing:**
- Lyrics contain inline chords in format: `[C]Chord [G7]positions [Am/F]here`
- Parser extracts chord positions relative to lyric text
- Returns `ParsedLine[]` with separate lyrics and chord arrays

**Transposition:**
- Uses Tonal.js `Chord.get()` to parse chord structure
- Supports complex chords: major, minor, 7ths, sus, slash chords
- Handles bass notes: `C/G` → `D/A` (transpose both)
- Normalizes enharmonic equivalents (flats → sharps)
- Preserves chord suffixes during transposition

**Display:**
- `buildChordDisplay()` creates aligned chord lines above lyrics
- Maintains proper spacing for visual alignment

### Server Actions Pattern
The app uses Next.js server actions extensively:

**Songs** (`app/songs/actions.ts`):
- `createSongAction(data: CreateSongInput)`
- `updateSongAction(id: string, data: UpdateSongInput)`
- `deleteSongAction(id: string)`
- `remixSongAction(templateId: string)`

**Setlists** (`app/setlists/actions.ts`):
- `createSetlistAction(title, description)`
- `updateSetlistAction(id, data)`
- `deleteSetlistAction(id)`
- `addSongToSetlistAction(setlistId, songId, orderIndex, customData)`
- `removeSongFromSetlistAction(setlistSongId)`
- `reorderSetlistSongsAction(setlistId, songIds)`

All actions include:
- Type safety with Zod validation
- Error handling and user-friendly error messages
- `revalidatePath()` for cache invalidation
- Toast notifications via Sonner

### Form Handling
The `SongEditor` component demonstrates the form pattern:
1. Client-side state management with React hooks
2. Zod schema validation before submission
3. Server action invocation with validated payload
4. Optimistic UI updates
5. Error field mapping for inline validation messages
6. Success/error toasts

### Middleware Protection
The `middleware.ts` file intercepts requests:
- Checks Supabase session for protected routes
- Redirects unauthenticated users to `/auth/sign-in`
- Handles share token headers for public setlist access
- Updates session cookies

---

## Development Workflow

### Available Scripts
```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm start          # Serve production build
npm run lint       # ESLint check
npm run typecheck  # TypeScript validation
npm test           # Run Vitest unit tests
```

### Environment Variables
Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://aqsabhygtzunggyqkzbg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key>
```

### Testing
- Unit tests in `tests/` directory
- Coverage for chord parsing, transposition, and utility functions
- Uses Vitest for fast test execution

---

## Deployment

### Hosting
- **Recommended**: Vercel (Next.js preset)
- Automatic deployments from git
- Environment variables configured via Vercel dashboard
- Edge runtime support for middleware

### Database
- **Production Supabase project** required
- Run migrations from `supabase/migrations/` in SQL editor
- Configure auth providers (Google OAuth)
- Set redirect URLs for auth flows
- Enable database backups

### Monitoring
- Vercel Analytics (optional)
- Sentry integration recommended (add `SENTRY_DSN`)
- Supabase dashboard for query performance
- RLS policy monitoring for security

---

## Unique Features & Design Decisions

1. **Inline Chord Notation**: Songs use `[Chord]` syntax embedded in lyrics, making editing intuitive for musicians

2. **Share Tokens**: Setlists use cryptographic tokens instead of simple slugs, enabling secure public sharing without authentication

3. **Per-Setlist Overrides**: Songs can have different keys/tempos in different setlists, supporting varied service contexts

4. **Custom Arrangements**: Setlist songs can have custom section ordering (e.g., skip intro, repeat chorus)

5. **RLS-First Security**: All data access controlled by Postgres policies, not application logic

6. **Print Optimization**: Dedicated CSS for clean chord sheet printing

7. **Dark Mode Support**: Full theme switching with `next-themes`

8. **Optimistic UI**: Immediate feedback on actions with server-side validation

9. **Chord Normalization**: Consistent sharp notation (converts Bb → A#) for clarity

10. **Template/Remix**: Create variations of existing songs while preserving originals

---

## Future Considerations

Based on the codebase structure, potential enhancements could include:

- **PDF Export**: Generate downloadable chord sheets
- **Collaborative Editing**: Real-time collaboration on setlists
- **Mobile Apps**: React Native or Progressive Web App
- **MIDI Integration**: Auto-generate backing tracks
- **AI Chord Detection**: Upload audio for automatic chord extraction
- **Service Planning**: Calendar integration for scheduling setlists
- **Team Management**: Multi-user organizations with role-based permissions
- **Analytics**: Track most-used songs, popular keys, etc.

---

## Summary

Selah is a well-architected, full-stack web application specifically designed for worship teams. It leverages modern web technologies (Next.js 14, Supabase, TypeScript) with music-specific features (Tonal.js chord transposition) to solve real-world problems for church musicians. The codebase demonstrates:

- **Clean separation of concerns**: UI components, server actions, database schema
- **Type safety**: TypeScript strict mode throughout
- **Security-first**: RLS policies and authentication middleware
- **User experience**: Optimistic updates, responsive design, accessibility
- **Developer experience**: Clear structure, comprehensive README, migration history

The application is production-ready and designed for scalability through Supabase's infrastructure and Vercel's edge network.
