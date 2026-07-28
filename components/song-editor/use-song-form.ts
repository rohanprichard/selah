"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { KEY_OPTIONS, type SectionType } from "@/lib/constants/music";
import type { Song, SongSection } from "@/lib/types";
import type { CreateSongInput, UpdateSongInput } from "@/lib/validation/songs";
import { createSongAction, updateSongAction } from "@/app/songs/actions";

export type EditorSection = {
  id?: string;
  tempId: string;
  type: SectionType;
  label: string;
  lyrics: string;
};

export type FormState = {
  title: string;
  artist: string;
  writer: string;
  key: string;
  tempo: string;
  timeSignature: string;
  youtubeUrl: string;
  tags: string;
  isPublic: boolean;
  sections: EditorSection[];
};

export type FieldErrors = Record<string, string[]>;

export type SongTemplate = {
  song: Song;
  sections: SongSection[];
  titleSuffix?: string;
};

export const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

type BuildInitialStateOptions = {
  mode: "create" | "edit";
  song?: Song;
  sections: SongSection[];
  template?: SongTemplate;
};

export function buildInitialState({
  mode,
  song,
  sections,
  template,
}: BuildInitialStateOptions): FormState {
  if (mode === "edit" && song) {
    return {
      title: song.title,
      artist: song.artist ?? "",
      writer: song.writer ?? "",
      key: song.key,
      tempo: song.tempo ? String(song.tempo) : "",
      timeSignature: song.time_signature ?? "4/4",
      youtubeUrl: song.youtube_url ?? "",
      tags: Array.isArray(song.tags) ? song.tags.join(", ") : "",
      isPublic: song.is_public,
      sections: sections
        .sort((a, b) => a.order_index - b.order_index)
        .map((section) => ({
          id: section.id,
          tempId: generateId(),
          type: section.type as SectionType,
          label: section.label,
          lyrics: section.lyrics,
        })),
    };
  }

  if (mode === "create" && template) {
    const source = template.song;
    const sourceSections = template.sections ?? [];
    const suffix = template.titleSuffix ?? " (Remix)";

    return {
      title: `${source.title}${suffix}`,
      artist: source.artist ?? "",
      writer: source.writer ?? "",
      key: source.key,
      tempo: source.tempo ? String(source.tempo) : "",
      timeSignature: source.time_signature ?? "4/4",
      youtubeUrl: source.youtube_url ?? "",
      tags: Array.isArray(source.tags) ? source.tags.join(", ") : "",
      isPublic: false,
      sections: sourceSections
        .sort((a, b) => a.order_index - b.order_index)
        .map((section) => ({
          tempId: generateId(),
          type: section.type as SectionType,
          label: section.label,
          lyrics: section.lyrics,
        })),
    };
  }

  return {
    title: "",
    artist: "",
    writer: "",
    key: KEY_OPTIONS[0].value,
    tempo: "",
    timeSignature: "4/4",
    youtubeUrl: "",
    tags: "",
    isPublic: true,
    sections: [
      {
        tempId: generateId(),
        type: "verse" as SectionType,
        label: "Verse 1",
        lyrics: "",
      },
    ],
  };
}

export type PayloadResult =
  | { success: true; data: CreateSongInput }
  | { success: true; data: UpdateSongInput }
  | { success: false; fieldErrors: FieldErrors };

export function buildPayload(form: FormState, songId?: string): PayloadResult {
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (tags.length > 10) {
    return {
      success: false,
      fieldErrors: { tags: ["Use up to 10 tags maximum."] },
    };
  }

  if (tags.some((tag) => tag.length > 24)) {
    return {
      success: false,
      fieldErrors: { tags: ["Tags should be 24 characters or fewer."] },
    };
  }

  const sections = form.sections.map((section, index) => ({
    id: "id" in section ? section.id : undefined,
    type: section.type,
    label: section.label.trim() || `Section ${index + 1}`,
    lyrics: section.lyrics.replace(/\r\n/g, "\n"),
    order: index,
  }));

  const tempo = form.tempo.trim() ? Number(form.tempo) : null;
  if (tempo !== null && Number.isNaN(tempo)) {
    return {
      success: false as const,
      fieldErrors: { tempo: ["Tempo must be a number"] },
    };
  }

  if (tempo !== null && (tempo < 30 || tempo > 260)) {
    return {
      success: false,
      fieldErrors: { tempo: ["Tempo should be between 30 and 260 BPM"] },
    };
  }

  const payload = {
    ...(songId ? { id: songId } : {}),
    title: form.title.trim(),
    artist: form.artist.trim() || null,
    writer: form.writer.trim() || null,
    key: form.key,
    tempo,
    timeSignature: form.timeSignature.trim() || "4/4",
    youtubeUrl: form.youtubeUrl.trim() || null,
    tags,
    isPublic: form.isPublic,
    sections,
  };

  if (songId) {
    return { success: true, data: payload as UpdateSongInput };
  }

  return { success: true, data: payload as CreateSongInput };
}

export function normalizeFieldErrors(errors: FieldErrors): FieldErrors {
  const normalized: FieldErrors = {};
  for (const [key, messages] of Object.entries(errors)) {
    if (!messages) continue;
    const baseKey = key.split(".")[0];
    normalized[baseKey] = [...(normalized[baseKey] ?? []), ...messages];
  }
  return normalized;
}

export function useSongForm(
  mode: "create" | "edit",
  song?: Song,
  sections: SongSection[] = [],
  template?: SongTemplate,
) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [form, setForm] = React.useState<FormState>(() =>
    buildInitialState({ mode, song, sections, template }),
  );

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSection = (tempId: string, updates: Partial<EditorSection>) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.tempId === tempId ? { ...section, ...updates } : section,
      ),
    }));
  };

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          tempId: generateId(),
          type: "verse",
          label: `Verse ${prev.sections.length + 1}`,
          lyrics: "",
        },
      ],
    }));
  };

  const removeSection = (tempId: string) => {
    setForm((prev) => {
      if (prev.sections.length === 1) {
        toast.warning("Songs must have at least one section.");
        return prev;
      }
      return {
        ...prev,
        sections: prev.sections.filter((section) => section.tempId !== tempId),
      };
    });
  };

  const moveSection = (tempId: string, direction: -1 | 1) => {
    setForm((prev) => {
      const index = prev.sections.findIndex((section) => section.tempId === tempId);
      if (index === -1) return prev;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.sections.length) {
        return prev;
      }

      const nextSections = [...prev.sections];
      const [removed] = nextSections.splice(index, 1);
      nextSections.splice(newIndex, 0, removed);
      return { ...prev, sections: nextSections };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const payload = buildPayload(form, mode === "edit" ? song?.id : undefined);

    if (!payload.success) {
      setFieldErrors(payload.fieldErrors);
      toast.error("Please fix the highlighted errors.");
      return;
    }

    startTransition(async () => {
      const data = payload.data;
      const result =
        mode === "create"
          ? await createSongAction(data as CreateSongInput)
          : await updateSongAction(data as UpdateSongInput);

      if (!result.success) {
        setFieldErrors(normalizeFieldErrors(result.fieldErrors ?? {}));
        toast.error(result.error ?? "Something went wrong");
        return;
      }

      toast.success(mode === "create" ? "Song created" : "Song updated");
      if (result.songId) {
        router.push(`/songs/${result.songId}`);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  };

  return {
    form,
    setForm,
    fieldErrors,
    setFieldErrors,
    isPending,
    updateField,
    updateSection,
    addSection,
    removeSection,
    moveSection,
    handleSubmit,
  };
}
