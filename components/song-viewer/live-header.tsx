"use client";

import * as React from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type LiveHeaderProps = {
  title: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExit: () => void;
};

export function LiveHeader({ title, isFullscreen, onToggleFullscreen, onExit }: LiveHeaderProps) {
  return (
    <div className="sticky top-0 z-50 -mx-4 px-4 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <Clock />
        </div>
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="h-10 w-10"
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
        <Button variant="default" size="sm" onClick={onExit} className="h-9 px-3 sm:px-4 font-medium">
          <span className="sm:hidden">Exit</span>
          <span className="hidden sm:inline">Exit Live Mode</span>
        </Button>
      </div>
    </div>
  );
}

function Clock() {
  const [time, setTime] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <div className="flex items-center px-2 text-lg font-mono font-medium text-muted-foreground tabular-nums">
      {time}
    </div>
  );
}
