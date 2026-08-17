# Selah

> Pause. Prepare. Worship.

An open-source workspace for worship teams to organise songs, chord charts, lyrics, and service plans.

**Live site:** [selah.rohanrichard.com](https://selah.rohanrichard.com)

## What it offers

- searchable song library with keys, tags, and pagination
- responsive chord charts with transposition and print-friendly viewing
- song and section editor with validation
- setlist and service-planning workflows
- email/password and Google sign-in through Supabase

## Stack

- Next.js App Router + TypeScript
- Supabase Auth, Postgres, and Row Level Security
- Tailwind CSS + shadcn/ui
- Tonal for chord parsing and transposition
- Vitest for utility coverage

## Product walkthroughs

The repository includes implementation and interface walkthroughs:

- [UI/UX walkthrough](docs/ui-ux-redesign-walkthrough.md)
- [Chord visualisation walkthrough](docs/chord-visualization-walkthrough.md)
- [Deployment guide](docs/selah-deployment.md)

## Run locally

Requires Node.js 20 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Configure local redirect URLs in Supabase before testing sign-in flows.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Deployment

Selah is designed for Vercel with a Supabase backend. Apply the migrations in `supabase/migrations/`, configure authentication redirect URLs, then add the Supabase public URL and publishable key to the Vercel project.

## License

MIT
