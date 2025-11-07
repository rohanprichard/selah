import * as React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Song } from "@/lib/types";

type SongCardProps = {
  song: Song;
};

export const SongCard = React.memo(function SongCard({ song }: SongCardProps) {
  const formattedDate = React.useMemo(() => {
    const createdAt = new Date(song.created_at);
    if (Number.isNaN(createdAt.getTime())) return null;
    return createdAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [song.created_at]);

  return (
    <Card className="h-full transition hover:border-primary/40 hover:shadow-md">
      <Link href={`/songs/${song.id}`} className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="text-xl font-semibold leading-tight">
            {song.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {song.artist || "Unknown artist"}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-4 text-sm">
          <dl className="grid grid-cols-2 gap-3 text-muted-foreground">
            <div className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wide">Key</dt>
              <dd className="font-medium text-foreground">{song.key}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wide">Time</dt>
              <dd className="font-medium text-foreground">
                {song.time_signature || "4/4"}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wide">Tempo</dt>
              <dd className="font-medium text-foreground">
                {song.tempo ? `${song.tempo} BPM` : "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wide">Added</dt>
              <dd className="font-medium text-foreground">{formattedDate ?? "—"}</dd>
            </div>
          </dl>

          {Array.isArray(song.tags) && song.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {song.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {song.tags.length > 4 ? (
                <Badge variant="outline">+{song.tags.length - 4}</Badge>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Link>
    </Card>
  );
});

