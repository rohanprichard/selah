# Selah Deployment to Vercel 

Use this checklist to launch Selah on Vercel with Supabase.

## 1. Prepare the Repository

- Commit the latest changes and push to the branch Vercel will deploy (typically `main`).
- Vercel auto-detects Next.js, so the default build (`npm install`, `npm run build`, `npm run lint`) can remain unchanged.

## 2. Configure Vercel Environment Variables

Add the following keys in Vercel → *Project → Settings → Environment Variables* for both Preview and Production as needed.

| Key | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://aqsabhygtzunggyqkzbg.supabase.co` | Public client URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Copy from Supabase → Project Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required for server-side Supabase helpers. |

> **Not using the AI import endpoint?** You can skip `AI_SONG_IMPORT_TOKEN`, `SELAH_CONTENT_USER_ID`, and `SELAH_CLAUDE_MODEL`. Add them later if you enable automated song ingestion.

## 3. Update Supabase Settings

### Site URL & Redirects

In Supabase Dashboard → *Authentication → URL Configuration*:

1. Set **Site URL** to `https://<your-vercel-domain>`.
2. Ensure both localhost and production redirect URLs are listed:
   - `http://localhost:3000/auth/update-password`
   - `http://localhost:3000/auth/sign-up`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/my-songs`
   - `http://localhost:3000/songs/new`
   - `https://ccm-saas.vercel.app/auth/update-password`
   - `https://ccm-saas.vercel.app/auth/sign-up`
   - `https://ccm-saas.vercel.app/auth/callback`
   - `https://ccm-saas.vercel.app/my-songs`
   - `https://ccm-saas.vercel.app/songs/new`

### Google OAuth

1. In Google Cloud Console, add `https://ccm-saas.vercel.app/auth/callback` to the authorized redirect URIs.
2. Paste the Google client ID and secret into Supabase → *Authentication → Providers → Google*.

### Database

- All RLS rules and schema migrations are tracked in `supabase/migrations/`. Re-run them only if creating a fresh Supabase project.
- The `/auth/confirm` route in the app upserts the `profiles` table automatically when new users confirm their email.

## 4. Deploy with Vercel

1. In Vercel, click **Add New Project** and import the GitHub repository.
2. Choose the Next.js preset and review the build command/output (defaults are fine).
3. Add the environment variables before triggering the first deployment.
4. Deploy and note the production domain (e.g., `https://selah.vercel.app`).

## 5. Post-Deployment Verification

- Visit the production domain and verify:
  - Light/dark theme toggle.
  - Email/password sign-up, login, and password reset flows (ensure redirects land on `/my-songs`).
  - Google OAuth sign-in via `/auth/callback`.
  - Song search, editor, and viewer behavior.
  - `/api/songs` import endpoint (optional): send a test `POST` with the bearer token `AI_SONG_IMPORT_TOKEN`.
- Update DNS if using a custom domain and add the custom domain to the Supabase redirect list.
- Monitor initial deployments via Vercel logs and Supabase logs for unexpected RLS/auth issues.

## 6. Optional Integrations

- Enable Vercel Analytics or add Sentry for error tracking once production traffic begins.
- For automation scripts on another server, export:
  ```bash
  export SUPABASE_URL=https://aqsabhygtzunggyqkzbg.supabase.co
  export SUPABASE_SERVICE_ROLE_KEY=...
  export SELAH_CONTENT_USER_ID=...
  ```

Selah is now ready for production on Vercel.

