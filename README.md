# Selah

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)

> Pause. Prepare. Worship.

Selah is an open-source platform designed to help Christian worship teams organize, manage, and share songs with elegant chord charts, lyrics, and service plans.

## Tech Stack

- [Next.js 14 App Router](https://nextjs.org/) with TypeScript strict mode
- [Supabase](https://supabase.com/) for authentication, PostgreSQL, and RLS
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) for the design system and form controls
- [Tonal](https://github.com/tonaljs/tonal) for chord transposition
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications
- [Vitest](https://vitest.dev/) for unit tests

## Screenshots

*(Add screenshots of your song library, chord viewer, and setlist builder here)*

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
3. **Configure environment variables** – copy `.env.example` to `.env.local` and fill in the values from your Supabase project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
   Get these values from your Supabase project settings under *API*.
4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to explore the Selah landing page and auth flows.

## Supabase Configuration

- **Auth settings**:
  - Enable email/password sign-in (default).
  - Turn on the Google provider and supply the client ID/secret from the Google Cloud Console.
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

## Deployment

Selah is optimized for deployment on Vercel with a Supabase backend.

1. **Supabase Setup**
   - Create a new Supabase project.
   - Run the migrations in `supabase/migrations/` sequentially via the SQL Editor.
   - Configure Google OAuth and authentication redirect URLs as detailed above.
2. **Vercel Setup**
   - Import the repository to Vercel (Next.js preset).
   - Supply the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` environment variables.

## Troubleshooting

- **Auth redirect loops** – confirm Supabase URL configuration includes the localhost and production routes listed above.
- **Session issues** – middleware currently protects `/my-songs`, `/songs/new`, and `/songs/[id]/edit`. Extend guards if additional routes need authentication.
- **Type errors referencing `.next`** – run `npm run typecheck` after deleting `.next/` to regenerate route types.

## Contributing

Contributions are welcome! Whether it's a bug report, feature request, or code contribution, we appreciate your help. Please see the [Contributing Guide](CONTRIBUTING.md) for details on our workflow and the [Code of Conduct](CODE_OF_CONDUCT.md) for our community standards.

## License

Distributed under the MIT License. See `LICENSE` for more information.
