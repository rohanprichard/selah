# CCM Setlist Builder

Contemporary worship teams use CCM Setlist Builder to curate chord charts, lyrics, and service prep in one place. This repository contains the first milestone: project scaffolding, Supabase integration, and fully wired authentication flows that match the design document.

## Tech Stack

- [Next.js 14 App Router](https://nextjs.org/) with TypeScript strict mode
- [Supabase](https://supabase.com/) for authentication, PostgreSQL, and RLS
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) for the design system
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
  - Update email templates as desired.
- **Database schema**: the SQL applied during setup is tracked in `supabase/migrations/0001_base_schema.sql`. Run it in the Supabase SQL editor if you recreate the project.
- **Row Level Security** is enabled for `songs` and `song_sections`. Public users can read published songs, while creators can manage their own content.

## Available Scripts

- `npm run dev` – Start Next.js locally with Turbopack.
- `npm run lint` – ESLint with the Next.js + TypeScript ruleset.
- `npm run typecheck` – Compile TypeScript without emitting files.
- `npm run test` – Execute Vitest unit tests (currently covers shared utilities).
- `npm run build` – Create a production build.
- `npm start` – Serve the production build.

> ℹ️ `npm install` currently reports five moderate vulnerabilities (from upstream dependencies). Track them with `npm audit` and upgrade as patches become available.

## Project Structure Highlights

- `app/` – App Router routes. Home, auth flows, and `my-songs` placeholder live here.
- `components/` – Reusable UI, including the brand header/footer and auth forms.
- `lib/supabase/` – Server/client helper factories and middleware session management.
- `supabase/migrations/` – DDL scripts applied to the hosted database.
- `tests/` – Vitest suites.

## Next Milestones

The design document outlines upcoming work. Priority items for Milestone 2:

1. Browse/search experience for the public song library.
2. Authenticated “My Songs” dashboard backed by live Supabase queries.
3. Rich song editor with chord parsing, ordering, and preview.
4. Tonal.js-driven transpose controls in the viewer.

## Troubleshooting

- **Auth redirect loops** – confirm Supabase URL configuration includes the localhost routes above.
- **Session issues** – the middleware only guards `/my-songs`. Extend `requiresAuth` if additional routes need protection.
- **Type errors referencing `.next`** – run `npm run typecheck` after deleting `.next/` to regenerate route types.

## License

Private work product for the CCM Setlist Builder SaaS. Distribution requires project owner approval.
