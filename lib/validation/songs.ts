import { z } from "zod";
import { MUSICAL_KEYS, SECTION_TYPES } from "@/lib/constants/music";

export const SectionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(SECTION_TYPES),
  label: z.string().min(1, "Label is required"),
  lyrics: z.string().default(""),
  order: z.number().int().min(0),
});

export const BaseSongSchema = z.object({
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

export const CreateSongSchema = BaseSongSchema;
export const UpdateSongSchema = BaseSongSchema.extend({
  id: z.string().uuid(),
});

export type CreateSongInput = z.infer<typeof CreateSongSchema>;
export type UpdateSongInput = z.infer<typeof UpdateSongSchema>;
