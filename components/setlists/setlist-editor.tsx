"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  addSetlistSongAction,
  deleteSetlistAction,
  fetchSongSectionsAction,
  moveSetlistSongAction,
  removeSetlistSongAction,
  searchSongsAction,
  updateSetlistDetailsAction,
  updateSetlistSongAction,
} from "@/app/setlists/actions";
import { KEY_OPTIONS } from "@/lib/constants/music";
import type { Song, ArrangementItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, ExternalLink, Loader2, Trash2, ListOrdered, Monitor, Edit3 } from "lucide-react";
import { SongArrangerModal } from "@/components/setlists/song-arranger-modal";

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
    arrangement: ArrangementItem[] | null;
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

  // Arranger modal state
  const [arrangerOpen, setArrangerOpen] = React.useState(false);
  const [arrangerSongId, setArrangerSongId] = React.useState<string | null>(null);
  const [arrangerSections, setArrangerSections] = React.useState<
    Array<{ id: string; type: string; label: string; order_index: number }>
  >([]);
  const [arrangerInitialArrangement, setArrangerInitialArrangement] = React.useState<
    ArrangementItem[] | null
  >(null);
  const [arrangerSong, setArrangerSong] = React.useState<SearchResult | null>(null);
  const [isSavingArrangement, setIsSavingArrangement] = React.useState(false);

  // Delete state
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setTitle(setlist.title);
    setDescription(setlist.description ?? "");
  }, [setlist.title, setlist.description]);

  // Local state for optimistic updates
  const [localSongs, setLocalSongs] = React.useState(songs);
  const [pendingOperations, setPendingOperations] = React.useState<Set<string>>(new Set());

  // Sync local state when server props change
  React.useEffect(() => {
    setLocalSongs(songs);
  }, [songs]);

  const handleMoveSong = (entryId: string, direction: "up" | "down") => {
    // Prevent multiple operations on the same item
    if (pendingOperations.has(entryId)) return;

    // Calculate indices
    const currentIndex = localSongs.findIndex((s) => s.id === entryId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Boundary checks
    if (targetIndex < 0 || targetIndex >= localSongs.length) return;

    // 1. Optimistic Update
    const previousSongs = [...localSongs];
    const newSongs = [...localSongs];

    // Swap items
    [newSongs[currentIndex], newSongs[targetIndex]] = [newSongs[targetIndex], newSongs[currentIndex]];

    // Update local state immediately
    setLocalSongs(newSongs);
    setPendingOperations((prev) => new Set(prev).add(entryId));

    // Execute server action
    const executeMove = async () => {
      try {
        const result = await moveSetlistSongAction({
          id: entryId,
          setlistId: setlist.id,
          direction,
        });

        if (!result.success) {
          // 2. Rollback on error
          setLocalSongs(previousSongs);
          toast.error(result.error);
        } else {
          // Success - server revalidation will eventually update props
          router.refresh();
        }
      } catch (error) {
        // Rollback on unexpected error
        setLocalSongs(previousSongs);
        toast.error("Failed to move song. Please try again.");
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(entryId);
          return next;
        });
      }
    };

    executeMove();
  };

  const handleRemoveSong = (entryId: string) => {
    // Prevent multiple operations
    if (pendingOperations.has(entryId)) return;

    // 1. Optimistic Update
    const previousSongs = [...localSongs];
    const newSongs = localSongs.filter((s) => s.id !== entryId);

    setLocalSongs(newSongs);
    setPendingOperations((prev) => new Set(prev).add(entryId));

    const executeRemove = async () => {
      try {
        const result = await removeSetlistSongAction({ id: entryId, setlistId: setlist.id });

        if (!result.success) {
          // 2. Rollback on error
          setLocalSongs(previousSongs);
          toast.error(result.error);
        } else {
          // Success
          toast.success("Removed from setlist");
          router.refresh();
        }
      } catch (error) {
        setLocalSongs(previousSongs);
        toast.error("Failed to remove song.");
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(entryId);
          return next;
        });
      }
    };

    executeRemove();
  };

  // Auto-save title
  React.useEffect(() => {
    if (title === setlist.title) return;
    if (!title.trim()) return;

    const timeout = setTimeout(() => {
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

        router.refresh();
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [title, setlist.id, setlist.title, description, router]);

  // Auto-save description
  React.useEffect(() => {
    if (description === (setlist.description ?? "")) return;

    const timeout = setTimeout(() => {
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

        router.refresh();
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [description, setlist.id, setlist.description, title, router]);

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

  const handleAddSong = async (song: SearchResult) => {
    setIsAddingSongId(song.id);

    // Fetch sections for the arranger
    const sectionsResult = await fetchSongSectionsAction(song.id);
    if (!sectionsResult.success) {
      toast.error(sectionsResult.error);
      setIsAddingSongId(null);
      return;
    }

    // Open arranger modal
    setArrangerSongId(song.id);
    setArrangerSong(song);
    setArrangerSections(sectionsResult.data ?? []);
    setArrangerInitialArrangement(null);
    setArrangerOpen(true);
    setIsAddingSongId(null);
  };

  const handleSaveArrangement = async (arrangement: ArrangementItem[] | null) => {
    if (!arrangerSongId || !arrangerSong) return;

    // 1. Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const previousSongs = [...localSongs];

    const nextOrder = localSongs.length > 0
      ? Math.max(...localSongs.map(s => s.order_index)) + 1
      : 0;

    const optimisticEntry = {
      id: tempId,
      order_index: nextOrder,
      custom_key: null,
      custom_tempo: null,
      custom_time_signature: null,
      notes: null,
      arrangement,
      song: {
        id: arrangerSong.id,
        title: arrangerSong.title,
        artist: arrangerSong.artist,
        key: arrangerSong.key,
        tempo: arrangerSong.tempo,
        time_signature: arrangerSong.time_signature,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "", // Placeholder
        original_key: arrangerSong.key,
        slug: "", // Placeholder
        content: "", // Placeholder
        writer: null,
        youtube_url: null,
        tags: [],
        is_public: false,
      },
    };

    setLocalSongs([...localSongs, optimisticEntry]);
    setPendingOperations((prev) => new Set(prev).add(tempId));

    // Close modal immediately
    setArrangerOpen(false);
    setArrangerSongId(null);
    setArrangerSong(null);
    setArrangerSections([]);
    setArrangerInitialArrangement(null);
    setSearchResults([]);
    setSearchTerm("");

    setIsSavingArrangement(true);

    const executeAdd = async () => {
      try {
        const result = await addSetlistSongAction({
          setlistId: setlist.id,
          songId: arrangerSongId,
          arrangement,
        });

        if (!result.success) {
          // 2. Rollback on error
          setLocalSongs(previousSongs);
          toast.error(result.error);
          // Re-open modal? Maybe just show error.
        } else {
          // Success
          toast.success("Song added to setlist");
          router.refresh();
        }
      } catch (error) {
        setLocalSongs(previousSongs);
        toast.error("Failed to add song.");
      } finally {
        setIsSavingArrangement(false);
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });
      }
    };

    executeAdd();
  };

  const handleDeleteSetlist = async () => {
    setIsDeleting(true);
    const result = await deleteSetlistAction({ id: setlist.id });

    if (!result.success) {
      toast.error(result.error);
      setIsDeleting(false);
      return;
    }

    toast.success("Setlist deleted");
    router.push("/setlists");
  };

  const [isEditingHeader, setIsEditingHeader] = React.useState(false);

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          {!isEditingHeader ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-3xl">{title}</CardTitle>
                  {description && (
                    <CardDescription className="text-base">{description}</CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingHeader(true)}
                  title="Edit setlist details"
                  className="shrink-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <CardTitle>Edit Setlist Details</CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="setlist-title">Title</Label>
                    {isSavingDetails && (
                      <span className="text-xs text-muted-foreground">Saving...</span>
                    )}
                  </div>
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
                <div className="sm:col-span-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingHeader(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
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
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const firstSongId = localSongs.length > 0 ? localSongs[0].id : null;
                    if (firstSongId) {
                      router.push(`/setlists/${setlist.id}?live=true&current=${firstSongId}`);
                    } else {
                      router.push(`/setlists/${setlist.id}?live=true`);
                    }
                  }}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Live Mode
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete Setlist
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this setlist?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the setlist and remove all associated songs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSetlist}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
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
              {localSongs.map((entry, index) => (
                <SetlistSongRow
                  key={entry.id}
                  index={index}
                  total={localSongs.length}
                  setlistId={setlist.id}
                  entry={entry}
                  onUpdate={() => router.refresh()}
                  onMove={(direction) => handleMoveSong(entry.id, direction)}
                  onRemove={() => handleRemoveSong(entry.id)}
                  isPending={pendingOperations.has(entry.id)}
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
                        onClick={() => handleAddSong(result)}
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

      <SongArrangerModal
        open={arrangerOpen}
        onOpenChange={setArrangerOpen}
        sections={arrangerSections}
        initialArrangement={arrangerInitialArrangement}
        onSave={handleSaveArrangement}
        isLoading={isSavingArrangement}
      />
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
    arrangement: ArrangementItem[] | null;
    song: Song | null;
  };
  onUpdate: () => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
  isPending: boolean;
};

function SetlistSongRow({ index, total, setlistId, entry, onUpdate, onMove, onRemove, isPending }: SetlistSongRowProps) {
  const [customKey, setCustomKey] = React.useState(entry.custom_key ?? "");
  const [customTempo, setCustomTempo] = React.useState(
    entry.custom_tempo !== null ? String(entry.custom_tempo) : "",
  );
  const [customTimeSignature, setCustomTimeSignature] = React.useState(
    entry.custom_time_signature ?? "",
  );
  const [notes, setNotes] = React.useState(entry.notes ?? "");
  const [isUpdating, startUpdating] = React.useTransition();

  // Arranger modal state
  const [arrangerOpen, setArrangerOpen] = React.useState(false);
  const [arrangerSections, setArrangerSections] = React.useState<
    Array<{ id: string; type: string; label: string; order_index: number }>
  >([]);
  const [isSavingArrangement, setIsSavingArrangement] = React.useState(false);

  React.useEffect(() => {
    setCustomKey(entry.custom_key ?? "");
    setCustomTempo(entry.custom_tempo !== null ? String(entry.custom_tempo) : "");
    setCustomTimeSignature(entry.custom_time_signature ?? "");
    setNotes(entry.notes ?? "");
  }, [entry.custom_key, entry.custom_tempo, entry.custom_time_signature, entry.notes]);

  // Auto-save custom key
  React.useEffect(() => {
    if (customKey === (entry.custom_key ?? "")) return;

    const timeout = setTimeout(() => {
      startUpdating(async () => {
        const tempoValue = customTempo.trim() ? Number(customTempo) : null;
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

        onUpdate();
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [customKey, entry.custom_key, entry.id, setlistId, customTempo, customTimeSignature, notes, onUpdate]);

  // Auto-save custom tempo
  React.useEffect(() => {
    const entryTempo = entry.custom_tempo !== null ? String(entry.custom_tempo) : "";
    if (customTempo === entryTempo) return;

    const timeout = setTimeout(() => {
      const tempoValue = customTempo.trim() ? Number(customTempo) : null;
      if (tempoValue !== null && Number.isNaN(tempoValue)) {
        toast.error("Tempo must be a number between 30 and 260.");
        return;
      }
      if (tempoValue !== null && (tempoValue < 30 || tempoValue > 260)) {
        toast.error("Tempo must be between 30 and 260 BPM.");
        return;
      }

      startUpdating(async () => {
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

        onUpdate();
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [customTempo, entry.custom_tempo, entry.id, setlistId, customKey, customTimeSignature, notes, onUpdate]);

  // Auto-save custom time signature
  React.useEffect(() => {
    if (customTimeSignature === (entry.custom_time_signature ?? "")) return;

    const timeout = setTimeout(() => {
      startUpdating(async () => {
        const tempoValue = customTempo.trim() ? Number(customTempo) : null;
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

        onUpdate();
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [customTimeSignature, entry.custom_time_signature, entry.id, setlistId, customKey, customTempo, notes, onUpdate]);

  // Auto-save notes
  React.useEffect(() => {
    if (notes === (entry.notes ?? "")) return;

    const timeout = setTimeout(() => {
      startUpdating(async () => {
        const tempoValue = customTempo.trim() ? Number(customTempo) : null;
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

        onUpdate();
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [notes, entry.notes, entry.id, setlistId, customKey, customTempo, customTimeSignature, onUpdate]);



  const handleOpenArranger = async () => {
    if (!entry.song?.id) return;

    const sectionsResult = await fetchSongSectionsAction(entry.song.id);
    if (!sectionsResult.success) {
      toast.error(sectionsResult.error);
      return;
    }

    setArrangerSections(sectionsResult.data ?? []);
    setArrangerOpen(true);
  };

  const handleSaveArrangement = async (arrangement: ArrangementItem[] | null) => {
    setIsSavingArrangement(true);

    const result = await updateSetlistSongAction({
      id: entry.id,
      setlistId,
      arrangement,
    });

    if (!result.success) {
      toast.error(result.error);
      setIsSavingArrangement(false);
      return;
    }

    toast.success("Arrangement updated");
    setArrangerOpen(false);
    setIsSavingArrangement(false);
    onUpdate();
  };

  const baseSong = entry.song;
  const canonicalUrl = baseSong
    ? `/songs/${baseSong.id}?${new URLSearchParams({
      setlistId,
      entryId: entry.id,
    }).toString()}`
    : null;

  return (
    <div className={`rounded-lg border border-border/60 bg-muted/20 p-4 transition-opacity ${isPending ? "opacity-60" : ""}`}>
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
            onClick={() => onMove("up")}
            disabled={isPending || index === 0}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Move up</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMove("down")}
            disabled={isPending || index === total - 1}
          >
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only">Move down</span>
          </Button>
          {baseSong ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleOpenArranger}
                title="Arrange sections"
              >
                <ListOrdered className="h-4 w-4" />
                <span className="sr-only">Arrange sections</span>
              </Button>
              <Button asChild variant="ghost" size="icon" title="View in setlist">
                <Link href={`/setlists/${setlistId}/songs/${entry.id}`}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View in setlist</span>
                </Link>
              </Button>
            </>
          ) : null}
          {canonicalUrl ? (
            <Button asChild variant="ghost" size="icon" title="View original song">
              <Link href={canonicalUrl}>
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View original song</span>
              </Link>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Custom key</Label>
            {isUpdating && (
              <span className="text-xs text-muted-foreground">Saving...</span>
            )}
          </div>
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

      <SongArrangerModal
        open={arrangerOpen}
        onOpenChange={setArrangerOpen}
        sections={arrangerSections}
        initialArrangement={entry.arrangement}
        onSave={handleSaveArrangement}
        isLoading={isSavingArrangement}
      />
    </div>
  );
}
