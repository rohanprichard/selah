"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteSongAction } from "@/app/songs/actions";
import type { Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, ExternalLink } from "lucide-react";

type MySongsTableProps = {
  songs: Song[];
};

export function MySongsTable({ songs }: MySongsTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const handleDelete = (song: Song) => {
    const confirmed = window.confirm(`Delete “${song.title}”? This cannot be undone.`);
    if (!confirmed) return;

    setPendingId(song.id);
    deleteSongAction(song.id).then((result) => {
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete song");
        return;
      }
      toast.success("Song deleted");
      router.refresh();
    });
  };

  if (songs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        You haven’t created any songs yet. Start by clicking “Create song”.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <table className="w-full divide-y divide-border/60 text-sm">
        <thead className="bg-muted/40 text-left font-medium text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Key</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3">Visibility</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {songs.map((song) => (
            <tr key={song.id} className="border-t border-border/60">
              <td className="px-4 py-3 font-medium text-foreground">
                <Link href={`/songs/${song.id}`} className="hover:underline">
                  {song.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {song.artist ?? "Unknown artist"}
                </p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{song.key}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(song.updated_at)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={song.is_public ? "secondary" : "outline"}>
                  {song.is_public ? "Public" : "Private"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/songs/${song.id}`}>
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View song</span>
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/songs/${song.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit song</span>
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(song)}
                    disabled={pendingId === song.id}
                  >
                    {pendingId === song.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete song</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(input: string | null): string {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

