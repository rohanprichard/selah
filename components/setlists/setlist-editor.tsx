"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  addSetlistSongAction,
  moveSetlistSongAction,
  removeSetlistSongAction,
  searchSongsAction,
  updateSetlistDetailsAction,
  updateSetlistSongAction,
} from "@/app/setlists/actions";
import { KEY_OPTIONS } from "@/lib/constants/music";
import type { Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Trash2 } from "lucide-react";

type SetlistEditorProps = {
  setlist: {
    id: string;
    title: string;
    description: string | null;
    shareToken: string;
    shareUrl: string;
  };
  songs: Array<{
    id: string;
    order_index: number;
    custom_key: string | null;
    custom_tempo: number | null;
    custom_time_signature: string | null;
    notes: string | null;
    song: Song | null;
  }>;
};

type SearchResult = {
  id: string;
  title: string;
  artist: string | null;
  key: string;
  tempo: number | null;
  time_signature: string | null;
};

const SEARCH_DEBOUNCE_MS = 400;

export function SetlistEditor({ setlist, songs }: SetlistEditorProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState(setlist.title);
  const [description, setDescription] = React.useState(setlist.description ?? "");
  const [isSavingDetails, startSavingDetails] = React.useTransition();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, startSearching] = React.useTransition();
  const [isAddingSongId, setIsAddingSongId] = React.useState<string | null>(null);
  const [isAddPending, startAddTransition] = React.useTransition();
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setTitle(setlist.title);
    setDescription(setlist.description ?? "");
  }, [setlist.title, setlist.description]);

  const handleSaveDetails = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startSavingDetails(async () => {
      const result = await updateSetlistDetailsAction({
        id: setlist.id,
        title,
        description,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Setlist updated");
      router.refresh();
    });
  };

  const handleSongSearch = React.useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) {
        setSearchResults([]);
        return;
      }
      startSearching(async () => {
        const result = await searchSongsAction(trimmed);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setSearchResults(result.data ?? []);
      });
    },
    [],
  );

  React.useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      handleSongSearch(searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, handleSongSearch]);

  const handleAddSong = (songId: string) => {
    setIsAddingSongId(songId);
    startAddTransition(async () => {
      const result = await addSetlistSongAction({ setlistId: setlist.id, songId });
      if (!result.success) {
        toast.error(result.error);
        setIsAddingSongId(null);
        return;
      }
      toast.success("Song added to setlist");
      setIsAddingSongId(null);
      setSearchResults([]);
      setSearchTerm("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Setlist</CardTitle>
          <CardDescription>
            Update your setlist details and share the public link with your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSaveDetails}>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="setlist-title">Title</Label>
              <Input
                id="setlist-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Sunday Morning Worship"
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="setlist-description">Description</Label>
              <Textarea
                id="setlist-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add context, scripture, or service flow notes."
                rows={3}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <Button type="submit" disabled={isSavingDetails}>
                {isSavingDetails ? "Saving..." : "Save details"}
              </Button>
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                <span className="font-medium text-foreground">Share link</span>
                <code className="rounded bg-background px-2 py-1 text-xs text-foreground">
                  /s/{setlist.shareToken}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(setlist.shareUrl)
                      .then(() => toast.success("Share link copied"))
                      .catch(() => toast.error("Unable to copy share link"));
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Songs</CardTitle>
          <CardDescription>
            Adjust order, customise keys and tempos, and add notes for each song.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {songs.length === 0 ? (
            <div className="rounded border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              This setlist is empty. Use the search below to add the first song.
            </div>
          ) : (
            <div className="space-y-4">
              {songs.map((entry, index) => (
                <SetlistSongRow
                  key={entry.id}
                  index={index}
                  total={songs.length}
                  setlistId={setlist.id}
                  entry={entry}
                  onUpdate={() => router.refresh()}
                />
              ))}
            </div>
          )}

          <div className="rounded-lg border border-border/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="song-search">Add songs</Label>
                <Input
                  id="song-search"
                  placeholder="Search by title, artist, or writer"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              {isSearching ? (
                <p className="text-sm text-muted-foreground sm:w-32">Searching…</p>
              ) : null}
            </div>
            {searchResults.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{result.title}</p>
                        <p>{result.artist ?? "Unknown artist"}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary">Key {result.key}</Badge>
                          <Badge variant="secondary">
                            Tempo {result.tempo ? `${result.tempo} BPM` : "—"}
                          </Badge>
                          <Badge variant="secondary">
                            Time {result.time_signature ?? "—"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isAddingSongId === result.id || isAddPending}
                        onClick={() => handleAddSong(result.id)}
                      >
                        {isAddingSongId === result.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.trim().length > 0 && !isSearching ? (
              <p className="mt-4 text-sm text-muted-foreground">No songs found.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type SetlistSongRowProps = {
  index: number;
  total: number;
  setlistId: string;
  entry: {
    id: string;
    order_index: number;
    custom_key: string | null;
    custom_tempo: number | null;
    custom_time_signature: string | null;
    notes: string | null;
    song: Song | null;
  };
  onUpdate: () => void;
};

function SetlistSongRow({ index, total, setlistId, entry, onUpdate }: SetlistSongRowProps) {
  const [customKey, setCustomKey] = React.useState(entry.custom_key ?? "");
  const [customTempo, setCustomTempo] = React.useState(
    entry.custom_tempo !== null ? String(entry.custom_tempo) : "",
  );
  const [customTimeSignature, setCustomTimeSignature] = React.useState(
    entry.custom_time_signature ?? "",
  );
  const [notes, setNotes] = React.useState(entry.notes ?? "");
  const [isUpdating, startUpdating] = React.useTransition();
  const [isMoving, startMoving] = React.useTransition();
  const [isRemoving, startRemoving] = React.useTransition();

  React.useEffect(() => {
    setCustomKey(entry.custom_key ?? "");
    setCustomTempo(entry.custom_tempo !== null ? String(entry.custom_tempo) : "");
    setCustomTimeSignature(entry.custom_time_signature ?? "");
    setNotes(entry.notes ?? "");
  }, [entry.custom_key, entry.custom_tempo, entry.custom_time_signature, entry.notes]);

  const handleSave = () => {
    startUpdating(async () => {
      const tempoValue = customTempo.trim() ? Number(customTempo) : null;
      if (tempoValue !== null && Number.isNaN(tempoValue)) {
        toast.error("Tempo must be a number between 30 and 260.");
        return;
      }
      if (tempoValue !== null && (tempoValue < 30 || tempoValue > 260)) {
        toast.error("Tempo must be between 30 and 260 BPM.");
        return;
      }

      const result = await updateSetlistSongAction({
        id: entry.id,
        setlistId,
        customKey: customKey || null,
        customTempo: tempoValue,
        customTimeSignature: customTimeSignature.trim() || null,
        notes: notes.trim() || null,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Song updated");
      onUpdate();
    });
  };

  const handleMove = (direction: "up" | "down") => {
    startMoving(async () => {
      const result = await moveSetlistSongAction({
        id: entry.id,
        setlistId,
        direction,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onUpdate();
    });
  };

  const handleRemove = () => {
    startRemoving(async () => {
      const result = await removeSetlistSongAction({ id: entry.id, setlistId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Removed from setlist");
      onUpdate();
    });
  };

  const baseSong = entry.song;
  const canonicalUrl = baseSong
    ? `/songs/${baseSong.id}?${new URLSearchParams({
        setlistId,
        entryId: entry.id,
      }).toString()}`
    : null;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {index + 1}. {baseSong?.title ?? "Unknown Song"}
          </p>
          <p className="text-xs text-muted-foreground">
            {baseSong?.artist ?? "Unknown artist"}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
            <Badge variant="outline">Original key {baseSong?.key ?? "—"}</Badge>
            <Badge variant="outline">
              Original tempo {baseSong?.tempo ? `${baseSong.tempo} BPM` : "—"}
            </Badge>
            <Badge variant="outline">
              Original time {baseSong?.time_signature ?? "—"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleMove("up")}
            disabled={isMoving || index === 0}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Move up</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleMove("down")}
            disabled={isMoving || index === total - 1}
          >
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only">Move down</span>
          </Button>
          {baseSong ? (
            <Button asChild variant="ghost" size="icon">
              <Link href={`/setlists/${setlistId}/songs/${entry.id}`}>
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View in setlist</span>
              </Link>
            </Button>
          ) : null}
          {canonicalUrl ? (
            <Button asChild variant="ghost" size="icon">
              <Link href={canonicalUrl}>
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Open canonical song</span>
              </Link>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Custom key</Label>
          <Select
            value={customKey || "inherit"}
            onValueChange={(value) => {
              setCustomKey(value === "inherit" ? "" : value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Use original key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Use original key ({baseSong?.key ?? "—"})</SelectItem>
              {KEY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Custom tempo (BPM)</Label>
          <Input
            type="number"
            min={30}
            max={260}
            value={customTempo}
            onChange={(event) => setCustomTempo(event.target.value)}
            placeholder={baseSong?.tempo ? String(baseSong.tempo) : "Original tempo"}
          />
        </div>
        <div className="space-y-2">
          <Label>Custom time signature</Label>
          <Input
            value={customTimeSignature}
            onChange={(event) => setCustomTimeSignature(event.target.value)}
            placeholder={baseSong?.time_signature ?? "Original time signature"}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Band cues, scripture, transitions, etc."
            rows={3}
          />
        </div>
      </div>

      <div className="mt-4">
        <Button type="button" size="sm" onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save song settings"}
        </Button>
      </div>
    </div>
  );
}
