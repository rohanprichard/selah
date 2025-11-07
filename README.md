# CCM Setlist Builder

Contemporary worship teams use CCM Setlist Builder to curate chord charts, lyrics, and service prep in one place. This repository contains the first milestone: project scaffolding, Supabase integration, and fully wired authentication flows that match the design document.

## Tech Stack

- [Next.js 14 App Router](https://nextjs.org/) with TypeScript strict mode
- [Supabase](https://supabase.com/) for authentication, PostgreSQL, and RLS
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) for the design system and form controls
- [Tonal](https://github.com/tonaljs/tonal) for chord transposition
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications
- [Vitest](https://vitest.dev/) for unit tests

## Getting Started

1. **Install Node.js** (>= 20). The team uses `nvm`; run:
   ```bash
   nvm install --lts
   nvm use --lts
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables** – copy `.env.example` to `.env.local` and fill in the values from Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://aqsabhygtzunggyqkzbg.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxc2FiaHlndHp1bmdneXFremJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTI3MzIsImV4cCI6MjA3ODA2ODczMn0.zAVxS7Fe4lI2bkPzHP3I9KFffOJKs__nqZCD8QfeztY
   ```
   These values point to the `ccm-setlist-builder` project in the `ccm-saas` organization. If you rotate the keys, update this file accordingly.
4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to explore the marketing landing page and auth flows.

## Supabase Configuration

- **Project reference**: `aqsabhygtzunggyqkzbg`
- **Region**: `us-east-1`
- **Auth settings**:
  - Enable email/password sign-in (default).
  - Add the following redirect URLs under *Authentication → URL Configuration*:
    - `http://localhost:3000/auth/update-password`
    - `http://localhost:3000/auth/sign-up`
    - `http://localhost:3000/my-songs`
    - `http://localhost:3000/songs/new`
  - Update email templates as desired.
- **Database schema**: the SQL applied during setup is tracked in `supabase/migrations/0001_base_schema.sql`. Run it in the Supabase SQL editor if you recreate the project.
- **Row Level Security** is enabled for `songs` and `song_sections`. Public users can read published songs, while creators can manage their own content.

## Available Scripts

- `npm run dev` – Start Next.js locally with Turbopack.
- `npm run lint` – ESLint with the Next.js + TypeScript ruleset.
- `npm run typecheck` – Compile TypeScript without emitting files.
- `npm run test` – Execute Vitest unit tests (covers utilities and chord parsing/transposition helpers).
- `npm run build` – Create a production build.
- `npm start` – Serve the production build.

> ℹ️ `npm install` currently reports five moderate vulnerabilities (from upstream dependencies). Track them with `npm audit` and upgrade as patches become available.

## Project Structure Highlights

- `app/` – App Router routes (marketing, song library, viewer, editor, and dashboard).
- `components/` – Reusable UI, editor controls, tables, and toast wiring.
- `components/ui/` – shadcn/ui primitives extended for the project (buttons, selects, textareas, etc.).
- `lib/chords.ts` – Chord parsing + transpose helpers used by the viewer.
- `lib/supabase/` – Server helper factories, song queries, and Supabase action wrappers.
- `supabase/migrations/` – DDL scripts applied to the hosted database.
- `tests/` – Vitest suites (utility + chord coverage).

## Feature Overview

- **Song Library** (`/songs`): Full-text search, key and tag filters, pagination, and responsive cards.
- **Song Viewer** (`/songs/[id]`): Metadata header, transpose controls via Tonal.js, font-size options, printable layout, YouTube embed, and owner-only edit shortcuts.
- **Song Editor** (`/songs/new`, `/songs/[id]/edit`): Multi-section editor with shadcn/ui forms, section ordering, validation via Zod, and optimistically toasted server actions.
- **My Songs Dashboard** (`/my-songs`): Authenticated management view with quick actions (view/edit/delete) and cascade revalidation after mutations.
- **Auth & Toasts**: Email/password auth powered by Supabase with inline toast feedback (`sonner`) for create/update/delete flows.
- **Accessibility**: Skip navigation link, focus-visible states, semantic headings, and print-friendly variants.

## Deployment & Monitoring

1. **Vercel**
   - Connect the repository and choose the Next.js preset.
   - Define environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
   - Configure a production Supabase project and mirror the SQL migration (`supabase/migrations/0001_base_schema.sql`).
   - Add the Supabase redirect URLs (production domain variants) and optional password reset templates.
2. **Supabase**
   - Enable database backups and set log retention according to plan limits.
   - Monitor query performance in the Supabase dashboard; the song library uses RLS-friendly filters with existing indexes.
3. **Monitoring**
   - Recommended: connect [Vercel Analytics](https://vercel.com/analytics) and [Sentry](https://sentry.io/) (add `SENTRY_DSN` to the environment and instrument via the Next.js SDK) once the team is ready.
   - Supabase provides request logs—watch for RLS errors when introducing new routes.

## Troubleshooting

- **Auth redirect loops** – confirm Supabase URL configuration includes the localhost and production routes listed above.
- **Session issues** – middleware currently protects `/my-songs`, `/songs/new`, and `/songs/[id]/edit`. Extend guards if additional routes need authentication.
- **Type errors referencing `.next`** – run `npm run typecheck` after deleting `.next/` to regenerate route types.

## License

Private work product for the CCM Setlist Builder SaaS. Distribution requires project owner approval.
