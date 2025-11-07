#!/usr/bin/env python3
"""Pydantic input models and helper to import song data into Supabase."""

from __future__ import annotations

import os
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field  # type: ignore[import]
from supabase import create_client

try:
    import instructor  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    instructor = None

try:
    from anthropic import Anthropic  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    Anthropic = None


SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
CONTENT_USER_ID = os.environ.get("CCM_CONTENT_USER_ID")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
DEFAULT_CLAUDE_MODEL = os.environ.get(
    "CCM_CLAUDE_MODEL", "claude-3-5-sonnet-latest"
)


class SongSectionInput(BaseModel):
    """Input payload for a song section row."""

    type: str = Field(
        ..., min_length=1, description="Section type such as verse or chorus."
    )
    label: str = Field(..., min_length=1, description="Human-friendly section label.")
    lyrics: str = Field(
        ..., min_length=1, description="Chord sheet lyrics for the section."
    )
    order_index: int = Field(
        ..., ge=0, description="0-based order position among all sections."
    )


class SongInput(BaseModel):
    """Input payload for the songs table with nested sections."""

    title: str = Field(..., min_length=1)
    artist: str = Field(..., min_length=1)
    writer: str = Field(..., min_length=1)
    key: str = Field(..., min_length=1)
    tempo: int = Field(..., ge=0)
    time_signature: str = Field(..., min_length=1)
    youtube_url: str = Field(..., min_length=1)
    tags: List[str] = Field(default_factory=list)
    is_public: bool = True
    created_by: UUID
    sections: List[SongSectionInput] = Field(default_factory=list)


def save_song_to_supabase(song_input: SongInput) -> str:
    """Persist a song and its sections to Supabase and return the created song id."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")

    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    song_payload = song_input.model_dump(exclude={"sections"})
    song_payload["created_by"] = str(song_payload["created_by"])

    inserted_song = client.table("songs").insert(song_payload).execute()
    if not inserted_song.data:
        raise RuntimeError(f"Failed to insert song: {inserted_song}")

    song_id = inserted_song.data[0]["id"]

    if not song_input.sections:
        return song_id

    sections_payload = [
        {**section.model_dump(), "song_id": song_id}
        for section in song_input.sections
    ]

    inserted_sections = (
        client.table("song_sections").insert(sections_payload).execute()
    )
    if not inserted_sections.data:
        raise RuntimeError(f"Failed to insert sections: {inserted_sections}")

    return song_id


def generate_song_input_from_url(
    url: str,
    *,
    created_by: UUID | None = None,
    model: str | None = None,
) -> SongInput:
    """Call Anthropic Claude via instructor to build a SongInput from a URL."""

    if not url:
        raise ValueError("url must be provided.")

    if instructor is None or Anthropic is None:
        raise RuntimeError(
            "instructor and anthropic packages are required. Install via `pip install instructor anthropic`."
        )

    api_key = ANTHROPIC_API_KEY
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY must be set.")

    resolved_created_by = created_by
    if resolved_created_by is None:
        if not CONTENT_USER_ID:
            raise RuntimeError(
                "created_by must be provided or CCM_CONTENT_USER_ID must be set."
            )
        resolved_created_by = UUID(CONTENT_USER_ID)

    claude_model = model or DEFAULT_CLAUDE_MODEL

    anthropic_client = Anthropic(api_key=api_key)
    guided_client = instructor.from_anthropic(anthropic_client)

    system_prompt = (
        "You extract hymn and worship song metadata and chord sections."
        " Return concise, factual details only."
    )
    user_prompt = (
        "Analyze the content at the provided URL and synthesize a structured song."
        f" Ensure the JSON matches the SongInput schema. Use the creator UUID: {resolved_created_by}."
        " Preserve bracket chord notation inside lyrics and infer tags where helpful."
        f" URL: {url}"
    )

    response = guided_client.chat.completions.create(
        model=claude_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_model=SongInput,
        max_tokens=4096,
    )

    if response.created_by != resolved_created_by:
        response = SongInput(
            **{**response.model_dump(), "created_by": resolved_created_by}
        )

    return response

