"use client";

import { Loader2, Plus } from "lucide-react";

import { KEY_OPTIONS } from "@/lib/constants/music";
import type { Song, SongSection } from "@/lib/types";
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
import { ErrorText, Field } from "@/components/song-editor/field-wrapper";
import { SectionEditor } from "@/components/song-editor/section-editor";
import { useSongForm } from "@/components/song-editor/use-song-form";

type SongEditorProps = {
  mode: "create" | "edit";
  song?: Song;
  sections?: SongSection[];
  template?: {
    song: Song;
    sections: SongSection[];
    titleSuffix?: string;
  };
};

export function SongEditor({ mode, song, sections = [], template }: SongEditorProps) {
  const {
    form,
    fieldErrors,
    isPending,
    updateField,
    updateSection,
    addSection,
    removeSection,
    moveSection,
    handleSubmit,
  } = useSongForm(mode, song, sections, template);

  const tagHelper = "Separate tags with commas (e.g. Easter, Baptism)";

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "edit"
              ? "Edit song"
              : template
                ? "Remix this song"
                : "Create a song"}
          </CardTitle>
          <CardDescription>
            {mode === "edit"
              ? "Update the song details and keep your charts in sync."
              : template
                ? "Tweak the original arrangement and save your own version."
                : "Capture the essentials so your team can rehearse with clarity."}
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
