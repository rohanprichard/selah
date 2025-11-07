import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { BaseSongSchema } from "@/lib/validation/songs";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeMusicalKey } from "@/lib/constants/music";
import { z } from "zod";

const AUTH_TOKEN = process.env.AI_SONG_IMPORT_TOKEN;

const ImportSchema = BaseSongSchema.extend({
  createdBy: z.string().uuid({ message: "createdBy must be a valid UUID" }),
});

export async function POST(request: NextRequest) {
  if (!AUTH_TOKEN) {
    return NextResponse.json(
      { error: "AI import token is not configured on the server." },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (token !== AUTH_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: z.infer<typeof ImportSchema>;
  try {
    const body = await request.json();
    payload = ImportSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const key = normalizeMusicalKey(payload.key);
  if (!key) {
    return NextResponse.json(
      { error: `Unsupported musical key: ${payload.key}` },
      { status: 422 },
    );
  }

  const { createdBy, sections, ...songData } = payload;

  const { data: insertedSong, error: insertError } = await admin
    .from("songs")
    .insert({
      title: songData.title,
      artist: songData.artist,
      writer: songData.writer,
      key,
      tempo: songData.tempo ?? null,
      time_signature: songData.timeSignature,
      youtube_url: songData.youtubeUrl ?? null,
      tags: songData.tags,
      is_public: songData.isPublic,
      created_by: createdBy,
    })
    .select("id")
    .single();

  if (insertError || !insertedSong) {
    return NextResponse.json(
      { error: insertError?.message ?? "Unable to create song" },
      { status: 500 },
    );
  }

  if (sections.length > 0) {
    const sectionsPayload = sections.map((section, index) => ({
      song_id: insertedSong.id,
      type: section.type,
      label: section.label,
      lyrics: section.lyrics,
      order_index: section.order ?? index,
    }));

    const { error: sectionError } = await admin
      .from("song_sections")
      .insert(sectionsPayload);

    if (sectionError) {
      await admin.from("songs").delete().eq("id", insertedSong.id);
      return NextResponse.json(
        { error: sectionError.message },
        { status: 500 },
      );
    }
  }

  await Promise.all([
    revalidatePath("/songs"),
    revalidatePath("/my-songs"),
    revalidatePath(`/songs/${insertedSong.id}`),
  ]);

  return NextResponse.json(
    {
      id: insertedSong.id,
      message: "Song created successfully",
    },
    { status: 201 },
  );
}
