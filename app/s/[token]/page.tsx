import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchSetlistByShareToken } from "@/lib/supabase/setlists";

type SharedSetlistPageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharedSetlistPage({ params }: SharedSetlistPageProps) {
  const { token } = await params;

  const detail = await fetchSetlistByShareToken(token);

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-foreground">
            {detail.setlist.title}
          </CardTitle>
          {detail.setlist.description ? (
            <CardDescription>{detail.setlist.description}</CardDescription>
          ) : null}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Songs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {detail.songs.length === 0 ? (
            <p className="text-sm text-muted-foreground">This setlist does not include any songs yet.</p>
          ) : (
            detail.songs.map((entry, index) => {
              const song = entry.song;
              const songTitle = song?.title ?? "Unavailable song";
              const songHref = song ? `/s/${detail.setlist.share_token}/songs/${entry.id}` : null;
              
              return songHref ? (
                <Link
                  key={entry.id}
                  href={songHref}
                  className="block rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {index + 1}. {songTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {song?.artist ?? "Unknown artist"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">
                      Key {entry.custom_key ?? song?.key ?? "—"}
                    </Badge>
                    <Badge variant="secondary">
                      Tempo{" "}
                      {entry.custom_tempo
                        ? `${entry.custom_tempo} BPM`
                        : song?.tempo
                          ? `${song.tempo} BPM`
                          : "—"}
                    </Badge>
                    <Badge variant="secondary">
                      Time {entry.custom_time_signature ?? song?.time_signature ?? "—"}
                    </Badge>
                  </div>
                  {entry.notes ? (
                    <p className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap">{entry.notes}</p>
                  ) : null}
                </Link>
              ) : (
                <div key={entry.id} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <div className="flex flex-col gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {index + 1}. {songTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">Unknown artist</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}


