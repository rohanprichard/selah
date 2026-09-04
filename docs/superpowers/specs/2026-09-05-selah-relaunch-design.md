# Selah Relaunch Design

## Goal

Make Selah safe to deploy. Make planning, rehearsal, and live use clear on desktop and mobile devices.

## Scope

The relaunch has one production release. It includes a dependency update, a Next.js proxy update, and user-interface changes.

The relaunch does not change the database schema. It does not add a paid service or collect new user data.

## Release Safety

The release must use Next.js 16.3.4 or a later safe stable version. The lockfile must resolve that version.

The app must use the Next.js `proxy` file convention. The proxy must keep the current Supabase session update behavior.

The release must use matching installed and declared Supabase package versions. The deployment check must include Vercel environment names and the Supabase security advisor.

## User Experience

Use a calm, high-contrast visual system. Use the same page widths, spacing, focus indicator, cards, and action styles on all pages.

The library must show songs before a user searches. It must keep the search, key, tag, and reset controls.

The setlist page must make creation and the empty state easy to understand. It must keep the existing data and routes.

Live mode must work without a mouse. It must have visible touch controls, clear current-song status, safe keyboard navigation, and reduced-motion support.

## Accessibility and Reliability

All interactive controls must have an accessible name. The app must show a visible keyboard focus indicator.

The app must reduce nonessential animation when the device requests reduced motion. The live view must not read `window` during render.

## Checks

Run unit tests, lint, type checks, production build, dependency audit, preview deployment, and production deployment checks. Test the public home page and the song library after deployment.
