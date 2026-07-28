import * as React from "react";
import { cn } from "@/lib/utils";

export function YouTubeEmbed({ url, className }: { url: string; className?: string }) {
  const embedUrl = React.useMemo(() => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com")) {
        const videoId = parsed.searchParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (parsed.hostname === "youtu.be") {
        return `https://www.youtube.com/embed${parsed.pathname}`;
      }
    } catch (error) {
      console.warn("Invalid YouTube URL", error);
    }
    return null;
  }, [url]);

  if (!embedUrl) return null;

  return (
    <div className={cn("aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-lg", className)}>
      <iframe
        title="YouTube video player"
        src={`${embedUrl}?rel=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
