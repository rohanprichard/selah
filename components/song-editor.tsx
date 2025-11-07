"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  KEY_OPTIONS,
  SECTION_TYPES,
  type SectionType,
} from "@/lib/constants/music";
import type { Song, SongSection } from "@/lib/types";
import type { CreateSongInput, UpdateSongInput } from "@/lib/validation/songs";
import { createSongAction, updateSongAction } from "@/app/songs/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";

type SongEditorProps = {
  mode: "create" | "edit";
  song?: Song;
  sections?: SongSection[];
};

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

type EditorSection = {
  id?: string;
  tempId: string;
  type: SectionType;
  label: string;
  lyrics: string;
};

type FormState = {
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

type FieldErrors = Record<string, string[]>;

export function SongEditor({ mode, song, sections = [] }: SongEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const [form, setForm] = React.useState<FormState>(() => buildInitialState(mode, song, sections));

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
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

  const tagHelper = "Separate tags with commas (e.g. Easter, Baptism)";

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create a song" : "Edit song"}</CardTitle>
          <CardDescription>
            Capture the essentials so your team can rehearse with clarity.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <Field label="Title" error={fieldErrors.title} required>
            <Input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </Field>
          <Field label="Artist" error={fieldErrors.artist}>
            <Input
              value={form.artist}
              onChange={(event) => updateField("artist", event.target.value)}
            />
          </Field>
          <Field label="Writer" error={fieldErrors.writer}>
            <Input
              value={form.writer}
              onChange={(event) => updateField("writer", event.target.value)}
            />
          </Field>
          <Field label="Key" error={fieldErrors.key} required>
            <Select value={form.key} onValueChange={(value) => updateField("key", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a key" />
              </SelectTrigger>
              <SelectContent>
                {KEY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tempo (BPM)" error={fieldErrors.tempo}>
            <Input
              type="number"
              min={30}
              max={260}
              value={form.tempo}
              onChange={(event) => updateField("tempo", event.target.value)}
            />
          </Field>
          <Field label="Time signature" error={fieldErrors.timeSignature}>
            <Input
              value={form.timeSignature}
              onChange={(event) => updateField("timeSignature", event.target.value)}
            />
          </Field>
          <Field label="YouTube URL" error={fieldErrors.youtubeUrl}>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtubeUrl}
              onChange={(event) => updateField("youtubeUrl", event.target.value)}
            />
          </Field>
          <Field label="Tags" helper={tagHelper} error={fieldErrors.tags}>
            <Input
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
            />
          </Field>
          <div className="flex items-center gap-3 md:col-span-2">
            <Checkbox
              id="is-public"
              checked={form.isPublic}
              onCheckedChange={(value) => updateField("isPublic", Boolean(value))}
            />
            <Label htmlFor="is-public" className="text-sm">
              Share this chart with the Selah community
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sections</CardTitle>
            <CardDescription>
              Add verses, choruses, and more. Keep chords inline by wrapping them like [G]Amazing grace.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addSection} disabled={isPending}>
            <Plus className="mr-2 h-4 w-4" /> Add section
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {form.sections.map((section, index) => (
            <SectionEditor
              key={section.tempId}
              section={section}
              isFirst={index === 0}
              isLast={index === form.sections.length - 1}
              onChange={updateSection}
              onMove={moveSection}
              onRemove={removeSection}
            />
          ))}
          {fieldErrors.sections ? (
            <ErrorText>{fieldErrors.sections.join(" ")}</ErrorText>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Create song"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}

function buildInitialState(mode: "create" | "edit", song?: Song, sections: SongSection[] = []): FormState {
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

type PayloadResult =
  | { success: true; data: CreateSongInput }
  | { success: true; data: UpdateSongInput }
  | { success: false; fieldErrors: FieldErrors };

function buildPayload(form: ReturnType<typeof buildInitialState>, songId?: string): PayloadResult {
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

function Field({
  label,
  children,
  error,
  helper,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string[];
  helper?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      {error ? <ErrorText>{error.join(" ")}</ErrorText> : null}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-destructive">{children}</p>;
}

function normalizeFieldErrors(errors: FieldErrors): FieldErrors {
  const normalized: FieldErrors = {};
  for (const [key, messages] of Object.entries(errors)) {
    if (!messages) continue;
    const baseKey = key.split(".")[0];
    normalized[baseKey] = [...(normalized[baseKey] ?? []), ...messages];
  }
  return normalized;
}

type SectionEditorProps = {
  section: EditorSection;
  isFirst: boolean;
  isLast: boolean;
  onChange: (tempId: string, updates: Partial<EditorSection>) => void;
  onRemove: (tempId: string) => void;
  onMove: (tempId: string, direction: -1 | 1) => void;
};

function SectionEditor({ section, isFirst, isLast, onChange, onRemove, onMove }: SectionEditorProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Select
            value={section.type}
            onValueChange={(value) => onChange(section.tempId, { type: value as SectionType })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="sm:w-48"
            value={section.label}
            onChange={(event) => onChange(section.tempId, { label: event.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMove(section.tempId, -1)}
            disabled={isFirst}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Move section up</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMove(section.tempId, 1)}
            disabled={isLast}
          >
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only">Move section down</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(section.tempId)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove section</span>
          </Button>
        </div>
      </div>
      <Textarea
        className="mt-4 h-40 font-mono"
        placeholder="Write lyrics here and add chords like [G]Amazing grace"
        value={section.lyrics}
        onChange={(event) => onChange(section.tempId, { lyrics: event.target.value })}
      />
    </div>
  );
}

