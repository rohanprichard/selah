"use client";

import * as React from "react";
import { Chord, Note } from "@tonaljs/tonal";

type PianoVisualizerProps = {
    chordName: string;
    className?: string;
};

export function PianoVisualizer({ chordName, className }: PianoVisualizerProps) {
    const chord = Chord.get(chordName);
    const notes = chord.notes.map(n => Note.simplify(n)); // e.g., ["C", "E", "G"]

    // We'll show a range of keys, e.g., C3 to B4 (2 octaves)
    // Standard piano keys
    const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
    const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

    // Map notes to key indices for 2 octaves
    // C3 is index 0 (white)

    const keys = [];
    const startOctave = 3;
    const numOctaves = 2;

    // Generate keys data
    let whiteKeyIndex = 0;
    for (let oct = 0; oct < numOctaves; oct++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            const noteName = whiteKeys[i];
            const currentOctave = startOctave + oct;
            const fullName = `${noteName}${currentOctave}`; // e.g. C3

            keys.push({
                type: "white",
                note: noteName,
                fullName,
                index: whiteKeyIndex,
                x: whiteKeyIndex * 24,
            });

            // Check for black key after this white key
            // C, D, F, G, A have sharps
            if (["C", "D", "F", "G", "A"].includes(noteName)) {
                const sharpName = `${noteName}#`;
                const fullSharpName = `${sharpName}${currentOctave}`;
                keys.push({
                    type: "black",
                    note: sharpName,
                    fullName: fullSharpName,
                    x: whiteKeyIndex * 24 + 16, // Offset
                });
            }

            whiteKeyIndex++;
        }
    }

    const width = whiteKeyIndex * 24;
    const height = 100;

    // Determine which keys are active
    // We need to map the chord notes (pitch classes) to specific keys
    // For simplicity, we'll light up ALL matching pitch classes in the range
    const activeKeys = new Set<string>();

    keys.forEach(key => {
        // Check if key.note matches any of the chord notes
        // Handle enharmonics simply by checking simplified versions
        const simplifiedKey = Note.simplify(key.note);
        if (notes.includes(simplifiedKey)) {
            activeKeys.add(key.fullName);
        }
    });

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            role="img"
            aria-label={`Piano keyboard chord diagram for ${chordName}`}
        >
            {/* White Keys */}
            {keys.filter(k => k.type === "white").map((key) => {
                const isActive = activeKeys.has(key.fullName);
                return (
                    <rect
                        key={key.fullName}
                        x={key.x}
                        y={0}
                        width={24}
                        height={100}
                        className={`stroke-border stroke-1 ${isActive ? "fill-primary" : "fill-white"}`}
                        rx={2}
                    />
                );
            })}

            {/* Black Keys */}
            {keys.filter(k => k.type === "black").map((key) => {
                const isActive = activeKeys.has(key.fullName);
                return (
                    <rect
                        key={key.fullName}
                        x={key.x}
                        y={0}
                        width={14}
                        height={60}
                        className={`stroke-border stroke-1 ${isActive ? "fill-primary" : "fill-black"}`}
                        rx={1}
                    />
                );
            })}

            {/* Active Key Markers (Dots) for better visibility on black keys? 
          Or just color change is enough. Primary color usually contrasts well.
      */}
        </svg>
    );
}
