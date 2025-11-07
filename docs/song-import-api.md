# AI Song Import API

This API endpoint allows trusted automation (for example, an AI agent) to create songs and their sections in the CCM Setlist Builder database. It uses the Supabase service role key under the hood, so keep the credentials secret and only expose the endpoint to controlled environments.

## Endpoint Summary

- **Route:** `POST /api/songs`
- **Auth:** Bearer token via the `Authorization` header
- **Content-Type:** `application/json`
- **Response:** `201 Created` with the ID of the new song on success

## Authentication

The route expects a static token. Define it in your environment as:

```bash
# .env.local / Vercel project settings
AI_SONG_IMPORT_TOKEN=replace-with-long-random-string
```

Requests must include the header:

```
Authorization: Bearer <AI_SONG_IMPORT_TOKEN>
```

Requests without the token (or with an incorrect value) receive `401 Unauthorized`.

## Required Environment Variables

In addition to the token above, the API uses the Supabase service role to bypass RLS:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> ⚠️ **Never** expose the service role key to the browser—it must remain server-side only.

## Request Body Schema

The payload mirrors the internal create-song action with an extra `createdBy` field:

```jsonc
{
  "title": "string",                      // required
  "artist": "string | null",
  "writer": "string | null",
  "key": "Musical key (e.g. C, C#, D#)",  // canonical sharp keys
  "tempo": 72,                              // optional BPM (30–260)
  "timeSignature": "4/4",                 // required
  "youtubeUrl": "https://..." | null,
  "tags": ["worship", "easter"],          // up to 10 tags
  "isPublic": true,                        // defaults true
  "sections": [
    {
      "type": "verse" | "chorus" | ...,   // see SECTION_TYPES
      "label": "Verse 1",
      "lyrics": "[C]Amazing...",           // chord notation inline
      "order": 0                           // integer ordering (0-based)
    }
  ],
  "createdBy": "<UUID of existing Supabase user>"
}
```

- `key` uses canonical sharp names (`C#` instead of `Db`, etc.). The API normalizes enharmonic equivalents automatically.
- `sections` must contain at least one entry. The `order` value controls their display order.
- `createdBy` must be the UUID of an existing Supabase auth user (for example, a dedicated "Content Bot" account).

## Example Request

```bash
curl -X POST https://your-domain.com/api/songs \
  -H "Authorization: Bearer $AI_SONG_IMPORT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Grace",
    "artist": "Traditional Hymn",
    "writer": "John Newton",
    "key": "G",
    "tempo": 72,
    "timeSignature": "3/4",
    "youtubeUrl": "https://www.youtube.com/watch?v=CDdvReNKKuk",
    "tags": ["grace", "hymn"],
    "isPublic": true,
    "sections": [
      {
        "type": "verse",
        "label": "Verse 1",
        "lyrics": "[G]Amazing grace, how [C]sweet the [G]sound",
        "order": 0
      }
    ],
    "createdBy": "8fbb7a4f-1234-4321-9abc-1234567890ab"
  }'
```

### Successful Response

```json
{
  "id": "7f74e4d2-bf7b-4efa-9ef8-2ca9d9e6adbb",
  "message": "Song created successfully"
}
```

### Error Responses

- `401` – Missing or invalid token
- `422` – Validation errors (schema mismatch, unsupported key, etc.). The response includes `fieldErrors` keyed by path.
- `500` – Unexpected server failure (Supabase insert error, misconfiguration)

## Operational Notes

- The endpoint revalidates `/songs`, `/my-songs`, and the specific song detail page to keep the UI in sync immediately after imports.
- Use a dedicated Supabase user for `createdBy` when ingesting songs so audit logs stay meaningful.
- Consider rate-limiting or wrapping the endpoint behind an internal gateway if you expect heavy automated usage.

## Local Testing Checklist

1. Add `SUPABASE_SERVICE_ROLE_KEY` and `AI_SONG_IMPORT_TOKEN` to `.env.local`.
2. Run `npm run dev` and execute the `curl` example against `http://localhost:3000/api/songs`.
3. Confirm the new song appears instantly on `/songs` and `/my-songs`.
4. For CI, add a smoke test that posts a fixture payload and asserts a `201` response.
