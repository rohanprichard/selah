"use client";

import * as React from "react";
import { type GuitarChord } from "@/lib/guitar-chords";

type GuitarVisualizerProps = {
    chord: GuitarChord;
    className?: string;
};

export function GuitarVisualizer({ chord, className }: GuitarVisualizerProps) {
    // Standard tuning E A D G B e
    // 6 strings, usually show 4-5 frets

    // Calculate min/max fret to determine window
    const frets = chord.positions
        .map(p => p.fret)
        .filter(f => f > 0);

    const minFret = frets.length > 0 ? Math.min(...frets) : 1;
    const maxFret = frets.length > 0 ? Math.max(...frets) : 1;

    // If chord is high up the neck, shift view
    const startFret = minFret > 1 ? minFret : 1;
    const numFrets = Math.max(4, maxFret - startFret + 1);

    const width = 200;
    const height = 240;
    const padding = 30;

    const stringSpacing = (width - 2 * padding) / 5;
    const fretSpacing = (height - 2 * padding) / numFrets;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            role="img"
            aria-label={`Guitar chord diagram for ${chord.name}`}
        >
            {/* Fretboard Background */}
            <rect x="0" y="0" width={width} height={height} fill="transparent" />

            {/* Nut (only if startFret is 1) */}
            {startFret === 1 && (
                <line
                    x1={padding}
                    y1={padding}
                    x2={width - padding}
                    y2={padding}
                    stroke="currentColor"
                    strokeWidth="4"
                />
            )}

            {/* Frets */}
            {Array.from({ length: numFrets + 1 }).map((_, i) => {
                const y = padding + i * fretSpacing;
                return (
                    <line
                        key={`fret-${i}`}
                        x1={padding}
                        y1={y}
                        x2={width - padding}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth={i === 0 && startFret === 1 ? 0 : 1} // Skip 0 if nut is drawn
                        className="text-muted-foreground"
                    />
                );
            })}

            {/* Strings */}
            {Array.from({ length: 6 }).map((_, i) => {
                const x = padding + i * stringSpacing;
                return (
                    <line
                        key={`string-${i}`}
                        x1={x}
                        y1={padding}
                        x2={x}
                        y2={height - padding}
                        stroke="currentColor"
                        strokeWidth={1 + (5 - i) * 0.2} // Thicker for lower strings
                        className="text-muted-foreground/80"
                    />
                );
            })}

            {/* Fret Number Label */}
            {startFret > 1 && (
                <text
                    x={padding - 15}
                    y={padding + fretSpacing / 2}
                    dy=".3em"
                    className="text-xs font-bold fill-muted-foreground"
                    textAnchor="middle"
                >
                    {startFret}fr
                </text>
            )}

            {/* Barres */}
            {chord.barres?.map((barre, i) => {
                // Strings are 1-6 (high e to low E), but visualizer is 0-5 (low E to high e)
                // So string 6 -> index 0, string 1 -> index 5
                const fromIndex = 6 - barre.fromString;
                const toIndex = 6 - barre.toString;
                const fretOffset = barre.fret - startFret;

                if (fretOffset < 0) return null;

                const x1 = padding + fromIndex * stringSpacing;
                const x2 = padding + toIndex * stringSpacing;
                const y = padding + fretOffset * fretSpacing + fretSpacing / 2;

                return (
                    <line
                        key={`barre-${i}`}
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="14"
                        strokeLinecap="round"
                        className="text-primary"
                    />
                );
            })}

            {/* Finger Positions */}
            {chord.positions.map((pos, i) => {
                const stringIndex = 6 - pos.string; // Convert 1-6 to 0-5
                const x = padding + stringIndex * stringSpacing;

                // Muted or Open
                if (pos.fret <= 0) {
                    const y = padding - 15;
                    return (
                        <text
                            key={`pos-${i}`}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            className="text-sm fill-muted-foreground"
                        >
                            {pos.fret === -1 ? "x" : "o"}
                        </text>
                    );
                }

                // Fretted note
                const fretOffset = pos.fret - startFret;
                if (fretOffset < 0) return null; // Should not happen if logic is correct

                const y = padding + fretOffset * fretSpacing + fretSpacing / 2;

                return (
                    <g key={`pos-${i}`}>
                        <circle
                            cx={x}
                            cy={y}
                            r="8"
                            className="fill-primary"
                        />
                        {pos.finger && (
                            <text
                                x={x}
                                y={y}
                                dy=".3em"
                                textAnchor="middle"
                                className="text-[10px] font-bold fill-primary-foreground"
                            >
                                {pos.finger}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
