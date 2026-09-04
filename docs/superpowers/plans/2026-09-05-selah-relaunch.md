# Selah Relaunch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Selah safe to deploy and easier to use for planning, rehearsal, and live performance.

**Architecture:** Keep the current Next.js App Router and Supabase data model. Add small pure helpers for route state, then use them in client components. Improve existing pages and controls without changing routes or database tables.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase, Vitest, and Vercel.

**Spec:** `docs/superpowers/specs/2026-09-05-selah-relaunch-design.md`

## Global Constraints

- Use Next.js 16.3.4 or a later safe stable version.
- Keep the current Supabase schema and routes.
- Do not expose a Supabase service role key to the client.
- Use a visible focus indicator and reduced-motion support.
- Run tests before and after each code task.

---

### Task 1: Secure the release build

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `middleware.ts`
- Create: `proxy.ts`

**Interfaces:**

- Consumes: `updateSession(request: NextRequest)` from `lib/supabase/middleware.ts`.
- Produces: `proxy(request: NextRequest)` for Next.js request handling.

- [ ] **Step 1: Write the failing proxy test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("proxy entry point", () => {
  test("exports the Next.js proxy function", () => {
    const source = readFileSync("proxy.ts", "utf8");
    expect(source).toContain("export async function proxy");
  });
});
```

- [ ] **Step 2: Run the test and make sure it fails**

Run: `npm test -- tests/proxy.test.ts`

Expected: FAIL because `proxy.ts` does not exist.

- [ ] **Step 3: Add the proxy and update dependencies**

```ts
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}
```

Run: `npm install next@16.3.4 @supabase/ssr@0.12.6 @supabase/supabase-js@2.80.0 && npm update sharp postcss nanoid ws`

- [ ] **Step 4: Run the proxy test**

Run: `npm test -- tests/proxy.test.ts`

Expected: PASS.

- [ ] **Step 5: Run the release checks**

Run: `npm run lint && npm run typecheck && npm run build && npm audit --omit=dev`

Expected: The build completes. The audit has no production dependency issue.

### Task 2: Add live-mode route helpers

**Files:**

- Create: `lib/setlist-live.ts`
- Create: `tests/setlist-live.test.ts`

**Interfaces:**

- Produces: `getAdjacentEntryId(entryIds, currentEntryId, direction)`.
- Produces: `getLiveSetlistPath({ shareToken, setlistId, currentEntryId })`.

- [ ] **Step 1: Write failing tests**

```ts
import { getAdjacentEntryId, getLiveSetlistPath } from "@/lib/setlist-live";

expect(getAdjacentEntryId(["a", "b"], null, 1)).toBe("a");
expect(getAdjacentEntryId(["a", "b"], "a", 1)).toBe("b");
expect(getAdjacentEntryId(["a", "b"], "b", 1)).toBe("b");
expect(getLiveSetlistPath({ setlistId: "set", currentEntryId: "a" })).toBe("/setlists/set?live=true&current=a");
```

- [ ] **Step 2: Run the tests and make sure they fail**

Run: `npm test -- tests/setlist-live.test.ts`

Expected: FAIL because the helper module does not exist.

- [ ] **Step 3: Add the smallest helper module**

```ts
export function getAdjacentEntryId(entryIds: string[], currentEntryId: string | null, direction: -1 | 1) {
  const index = currentEntryId ? entryIds.indexOf(currentEntryId) : -1;
  const nextIndex = Math.min(Math.max(index + direction, 0), entryIds.length - 1);
  return entryIds[nextIndex] ?? null;
}
```

- [ ] **Step 4: Run the helper tests**

Run: `npm test -- tests/setlist-live.test.ts`

Expected: PASS.

### Task 3: Improve the live-performance controls

**Files:**

- Modify: `components/setlists/setlist-live-view.tsx`

**Interfaces:**

- Consumes: `getAdjacentEntryId` and `getLiveSetlistPath` from `lib/setlist-live.ts`.
- Produces: Visible previous, next, exit, and current-song controls.

- [ ] **Step 1: Write a failing keyboard helper test**

```ts
expect(getAdjacentEntryId(["a", "b"], "a", -1)).toBe("a");
expect(getAdjacentEntryId(["a", "b"], "b", -1)).toBe("a");
```

- [ ] **Step 2: Run the helper test and make sure it fails**

Run: `npm test -- tests/setlist-live.test.ts`

Expected: FAIL because reverse navigation is not covered.

- [ ] **Step 3: Use the helper in the live view**

```tsx
<Button aria-label="Show previous song" onClick={() => navigate(-1)}>
  Previous
</Button>
<Button aria-label="Show next song" onClick={() => navigate(1)}>
  Next
</Button>
```

Remove the render-time `window.matchMedia` call. Keep the current URL format and keyboard shortcuts.

- [ ] **Step 4: Run the helper tests and type checks**

Run: `npm test -- tests/setlist-live.test.ts && npm run typecheck`

Expected: PASS.

### Task 4: Make the song library useful before search

**Files:**

- Create: `lib/song-library.ts`
- Create: `tests/song-library.test.ts`
- Modify: `app/songs/page.tsx`
- Modify: `components/song-filters.tsx`

**Interfaces:**

- Produces: `parseSongLibraryParams(params)`.
- Consumes: `fetchPublicSongs` and `fetchAvailableSongTags`.

- [ ] **Step 1: Write failing parameter tests**

```ts
expect(parseSongLibraryParams({ page: "-2", key: "bad" })).toMatchObject({ page: 1, key: "" });
expect(parseSongLibraryParams({ q: " Grace ", page: "2" })).toMatchObject({ query: "Grace", page: 2 });
```

- [ ] **Step 2: Run the tests and make sure they fail**

Run: `npm test -- tests/song-library.test.ts`

Expected: FAIL because the helper module does not exist.

- [ ] **Step 3: Add the parameter helper and use it**

```ts
function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseSongLibraryParams(params: Record<string, string | string[] | undefined>) {
  const page = Math.max(1, Number.parseInt(getSingleValue(params.page) ?? "1", 10) || 1);
  const query = getSingleValue(params.q)?.trim() ?? "";
  return { page, query };
}
```

Always call `fetchPublicSongs`. Show the cards and the result count when no filter exists.

- [ ] **Step 4: Run the library tests**

Run: `npm test -- tests/song-library.test.ts`

Expected: PASS.

### Task 5: Apply the shared visual and access rules

**Files:**

- Modify: `app/globals.css`
- Modify: `app/page.tsx`
- Modify: `components/hero.tsx`
- Modify: `components/setlists/create-setlist-form.tsx`
- Modify: `app/setlists/page.tsx`

**Interfaces:**

- Produces: Consistent focus, card, action, empty-state, and reduced-motion behavior.

- [ ] **Step 1: Add a failing source test for reduced motion**

```ts
import { readFileSync } from "node:fs";

const styles = readFileSync("app/globals.css", "utf8");
expect(styles).toContain("prefers-reduced-motion: reduce");
expect(styles).toContain("focus-visible");
```

- [ ] **Step 2: Run the test and make sure it fails**

Run: `npm test -- tests/accessibility-styles.test.ts`

Expected: FAIL because the styles are not present.

- [ ] **Step 3: Add visual and access rules**

```css
*:focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Use concise action labels. Use an informative setlist empty state. Remove unsupported social-proof copy from the hero.

- [ ] **Step 4: Run the style test and full checks**

Run: `npm test && npm run lint && npm run typecheck && npm run build`

Expected: PASS.

### Task 6: Check the hosted service and deploy

**Files:**

- Modify: `docs/selah-deployment.md`

**Interfaces:**

- Consumes: Vercel project `selah` and the linked Supabase project.
- Produces: A preview deployment and a production deployment.

- [ ] **Step 1: Check Vercel environment names**

Run: `vercel env ls --scope rohanprichards-projects`

Expected: The production environment contains the required Supabase URL and publishable key.

- [ ] **Step 2: Check Supabase security advice**

Run: Use `get_advisors` for the linked Supabase project.

Expected: No unreviewed critical security advice exists.

- [ ] **Step 3: Create and check a preview deployment**

Run: `vercel --scope rohanprichards-projects --yes`

Expected: A READY preview URL.

- [ ] **Step 4: Create the production deployment**

Run: `vercel --prod --scope rohanprichards-projects --yes`

Expected: A READY production URL.

- [ ] **Step 5: Check public routes**

Run: `vercel curl / --deployment <production-url>` and `vercel curl /songs --deployment <production-url>`

Expected: Both routes return HTTP 200.
