"use server";

import { revalidatePath } from "next/cache";

import {
  CreateSongSchema,
  UpdateSongSchema,
  type CreateSongInput,
  type UpdateSongInput,
} from "@/lib/validation/songs";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  success: boolean;
  songId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createSongAction(input: CreateSongInput): Promise<ActionResult> {
  const parsed = CreateSongSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to create a song." };
  }

  const payload = parsed.data;

  const { data: insertedSong, error: insertError } = await supabase
    .from("songs")
    .insert(
      {
        title: payload.title,
        artist: payload.artist,
        writer: payload.writer,
        key: payload.key,
        tempo: payload.tempo ?? null,
        time_signature: payload.timeSignature,
        youtube_url: payload.youtubeUrl ?? null,
        tags: payload.tags,
        is_public: payload.isPublic,
        created_by: user.id,
      },
    )
    .select("id")
    .single();

  if (insertError || !insertedSong) {
    return {
      success: false,
      error: insertError?.message ?? "Unable to create song.",
    };
  }

  const sectionsPayload = payload.sections.map((section) => ({
    song_id: insertedSong.id,
    type: section.type,
    label: section.label,
    lyrics: section.lyrics,
    order_index: section.order,
  }));

  const { error: sectionError } = await supabase
    .from("song_sections")
    .insert(sectionsPayload);

  if (sectionError) {
    await supabase.from("songs").delete().eq("id", insertedSong.id);
    return { success: false, error: sectionError.message };
  }

  await revalidatePath("/songs");
  await revalidatePath("/my-songs");
  await revalidatePath(`/songs/${insertedSong.id}`);

  return { success: true, songId: insertedSong.id };
}

export async function updateSongAction(input: UpdateSongInput): Promise<ActionResult> {
  const parsed = UpdateSongSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const payload = parsed.data;
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("songs")
    .update({
      title: payload.title,
      artist: payload.artist,
      writer: payload.writer,
      key: payload.key,
      tempo: payload.tempo ?? null,
      time_signature: payload.timeSignature,
      youtube_url: payload.youtubeUrl ?? null,
      tags: payload.tags,
      is_public: payload.isPublic,
    })
    .eq("id", payload.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  const { error: deleteError } = await supabase
    .from("song_sections")
    .delete()
    .eq("song_id", payload.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  const sectionsPayload = payload.sections.map((section) => ({
    song_id: payload.id,
    type: section.type,
    label: section.label,
    lyrics: section.lyrics,
    order_index: section.order,
  }));

  if (sectionsPayload.length > 0) {
    const { error: sectionError } = await supabase
      .from("song_sections")
      .insert(sectionsPayload);

    if (sectionError) {
      return { success: false, error: sectionError.message };
    }
  }

  await revalidatePath("/songs");
  await revalidatePath("/my-songs");
  await revalidatePath(`/songs/${payload.id}`);

  return { success: true, songId: payload.id };
}

export async function deleteSongAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("songs").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  await revalidatePath("/songs");
  await revalidatePath("/my-songs");
  return { success: true };
}

