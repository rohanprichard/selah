"use client";

import * as React from "react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed unused import
import { GuitarVisualizer } from "./guitar-visualizer";
import { PianoVisualizer } from "./piano-visualizer";
import { getGuitarChord, type GuitarChord } from "@/lib/guitar-chords";
import { cn } from "@/lib/utils";

type ChordTooltipProps = {
    chord: string;
    children: React.ReactNode;
    className?: string;
};

export function ChordTooltip({ chord, children, className }: ChordTooltipProps) {
    const guitarChord = getGuitarChord(chord);

    // If we don't have a guitar chord mapping and it's not a simple chord, 
    // we might still want to show piano or just the name.
    // For now, let's always try to show the tooltip.

    return (
        <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
                <span className={cn("cursor-pointer hover:text-primary hover:underline decoration-dotted underline-offset-4", className)}>
                    {children}
                </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-0 overflow-hidden">
                <div className="bg-muted/50 p-2 border-b">
                    <h4 className="font-bold text-center text-lg">{chord}</h4>
                </div>

                <div className="p-4 bg-background">
                    <div className="flex flex-col items-center gap-4">
                        {/* 
              Simple toggle for now. 
              If we had Tabs component we could use it. 
              Let's check if Tabs exists or just implement a simple state switch.
            */}
                        <VisualizerTabs chord={chord} guitarChord={guitarChord} />
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

function VisualizerTabs({ chord, guitarChord }: { chord: string, guitarChord: GuitarChord | null }) {
    const [mode, setMode] = React.useState<"guitar" | "piano">("guitar");

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="flex p-1 bg-muted rounded-lg">
                <button
                    onClick={() => setMode("guitar")}
                    className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        mode === "guitar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Guitar
                </button>
                <button
                    onClick={() => setMode("piano")}
                    className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        mode === "piano" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Piano
                </button>
            </div>

            <div className="w-[200px] h-[240px] flex items-center justify-center">
                {mode === "guitar" ? (
                    guitarChord ? (
                        <GuitarVisualizer chord={guitarChord} className="w-full h-full" />
                    ) : (
                        <div className="text-center text-muted-foreground text-sm p-4">
                            No guitar diagram available for {chord}
                        </div>
                    )
                ) : (
                    <div className="w-full flex items-center">
                        <PianoVisualizer chordName={chord} className="w-full" />
                    </div>
                )}
            </div>
        </div>
    );
}
