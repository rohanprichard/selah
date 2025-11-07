"use server";

import { revalidatePath } from "next/cache";

import { MUSICAL_KEYS, SECTION_TYPES } from "@/lib/constants/music";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SectionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(SECTION_TYPES),
  label: z.string().min(1, "Label is required"),
  lyrics: z.string().default(""),
  order: z.number().int().min(0),
});

const BaseSongSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().trim().optional().transform((value) => value || null),
  writer: z.string().trim().optional().transform((value) => value || null),
  key: z.enum(MUSICAL_KEYS),
  tempo: z
    .number()
    .int()
    .min(30, "Tempo must be at least 30 BPM")
    .max(260, "Tempo must be at most 260 BPM")
    .optional()
    .nullable(),
  timeSignature: z.string().min(1, "Time signature is required"),
  youtubeUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null))
    .refine((value) => !value || /^https?:\/\//.test(value), {
      message: "YouTube URL must be a valid URL",
    }),
  tags: z.array(z.string().min(1)).max(10).default([]),
  isPublic: z.boolean().default(true),
  sections: z.array(SectionSchema).min(1, "Add at least one section"),
});

const CreateSongSchema = BaseSongSchema;

const UpdateSongSchema = BaseSongSchema.extend({
  id: z.string().uuid(),
});

export type CreateSongInput = z.infer<typeof CreateSongSchema>;
export type UpdateSongInput = z.infer<typeof UpdateSongSchema>;

type ActionResult = {
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

