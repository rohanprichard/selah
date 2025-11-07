#!/usr/bin/env python3
"""Import a song into Supabase directly using the service role key."""
import os
import sys
from typing import Any, Dict, List

from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
CONTENT_USER_ID = os.environ.get("SELAH_CONTENT_USER_ID") or os.environ.get("CCM_CONTENT_USER_ID")  # auth.users UUID that should own the song

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    sys.exit("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")

if not CONTENT_USER_ID:
    sys.exit("SELAH_CONTENT_USER_ID must be set to a valid auth user UUID.")

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

SONG: Dict[str, Any] = {
    "title": "Amazing Grace",
    "artist": "Traditional Hymn",
    "writer": "John Newton",
    "key": "G",
    "tempo": 72,
    "time_signature": "3/4",
    "youtube_url": "https://www.youtube.com/watch?v=CDdvReNKKuk",
    "tags": ["grace", "hymn"],
    "is_public": True,
    "created_by": CONTENT_USER_ID,
}

SECTIONS: List[Dict[str, Any]] = [
    {
        "type": "verse",
        "label": "Verse 1",
        "lyrics": "[G]Amazing grace, how [C]sweet the [G]sound",
        "order_index": 0,
    },
    {
        "type": "verse",
        "label": "Verse 2",
        "lyrics": "[G]'Twas grace that taught my [C]heart to [G]fear",
        "order_index": 1,
    },
]


def main() -> None:
    inserted_song = client.table("songs").insert(SONG).execute()
    if not inserted_song.data:
        sys.exit(f"Failed to insert song: {inserted_song}")

    song_id = inserted_song.data[0]["id"]
    sections_payload = [
        {
            **section,
            "song_id": song_id,
        }
        for section in SECTIONS
    ]

    inserted_sections = client.table("song_sections").insert(sections_payload).execute()
    if not inserted_sections.data:
        sys.exit(f"Failed to insert sections: {inserted_sections}")

    print(f"Created song {song_id} with {len(inserted_sections.data)} sections.")


if __name__ == "__main__":
    main()
