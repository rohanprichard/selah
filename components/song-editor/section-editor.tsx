"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { SECTION_TYPES, type SectionType } from "@/lib/constants/music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { EditorSection } from "./use-song-form";

type SectionEditorProps = {
  section: EditorSection;
  isFirst: boolean;
  isLast: boolean;
  onChange: (tempId: string, updates: Partial<EditorSection>) => void;
  onRemove: (tempId: string) => void;
  onMove: (tempId: string, direction: -1 | 1) => void;
};

export function SectionEditor({
  section,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
}: SectionEditorProps) {
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
