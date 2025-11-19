export type FingerPosition = {
    string: number; // 1-6, 1 is high E
    fret: number; // 0 for open, -1 for muted
    finger?: number; // 1-4 (index to pinky), optional
};

export type GuitarChord = {
    name: string;
    positions: FingerPosition[];
    barres?: { fret: number; fromString: number; toString: number }[];
};

// Basic chord dictionary
// Strings: 6=E, 5=A, 4=D, 3=G, 2=B, 1=e
export const GUITAR_CHORDS: Record<string, GuitarChord> = {
    // Major
    C: {
        name: "C",
        positions: [
            { string: 6, fret: -1 }, // x
            { string: 5, fret: 3, finger: 3 }, // 3
            { string: 4, fret: 2, finger: 2 }, // 2
            { string: 3, fret: 0 }, // 0
            { string: 2, fret: 1, finger: 1 }, // 1
            { string: 1, fret: 0 }, // 0
        ],
    },
    D: {
        name: "D",
        positions: [
            { string: 6, fret: -1 },
            { string: 5, fret: -1 },
            { string: 4, fret: 0 },
            { string: 3, fret: 2, finger: 1 },
            { string: 2, fret: 3, finger: 3 },
            { string: 1, fret: 2, finger: 2 },
        ],
    },
    E: {
        name: "E",
        positions: [
            { string: 6, fret: 0 },
            { string: 5, fret: 2, finger: 2 },
            { string: 4, fret: 2, finger: 3 },
            { string: 3, fret: 1, finger: 1 },
            { string: 2, fret: 0 },
            { string: 1, fret: 0 },
        ],
    },
    F: {
        name: "F",
        positions: [
            { string: 6, fret: 1, finger: 1 },
            { string: 5, fret: 3, finger: 3 },
            { string: 4, fret: 3, finger: 4 },
            { string: 3, fret: 2, finger: 2 },
            { string: 2, fret: 1, finger: 1 },
            { string: 1, fret: 1, finger: 1 },
        ],
        barres: [{ fret: 1, fromString: 6, toString: 1 }],
    },
    G: {
        name: "G",
        positions: [
            { string: 6, fret: 3, finger: 2 },
            { string: 5, fret: 2, finger: 1 },
            { string: 4, fret: 0 },
            { string: 3, fret: 0 },
            { string: 2, fret: 0 }, // or 3
            { string: 1, fret: 3, finger: 3 },
        ],
    },
    A: {
        name: "A",
        positions: [
            { string: 6, fret: -1 },
            { string: 5, fret: 0 },
            { string: 4, fret: 2, finger: 1 },
            { string: 3, fret: 2, finger: 2 },
            { string: 2, fret: 2, finger: 3 },
            { string: 1, fret: 0 },
        ],
    },
    B: {
        name: "B",
        positions: [
            { string: 6, fret: -1 },
            { string: 5, fret: 2, finger: 1 },
            { string: 4, fret: 4, finger: 2 },
            { string: 3, fret: 4, finger: 3 },
            { string: 2, fret: 4, finger: 4 },
            { string: 1, fret: 2, finger: 1 },
        ],
        barres: [{ fret: 2, fromString: 5, toString: 1 }],
    },

    // Minor
    Cm: {
        name: "Cm",
        positions: [
            { string: 6, fret: -1 },
            { string: 5, fret: 3, finger: 1 },
            { string: 4, fret: 5, finger: 3 },
            { string: 3, fret: 5, finger: 4 },
            { string: 2, fret: 4, finger: 2 },
            { string: 1, fret: 3, finger: 1 },
        ],
        barres: [{ fret: 3, fromString: 5, toString: 1 }],
    },
    Dm: {
        name: "Dm",
        positions: [
            { string: 6, fret: -1 },
            { string: 5, fret: -1 },
            { string: 4, fret: 0 },
            { string: 3, fret: 2, finger: 2 },
            { string: 2, fret: 3, finger: 3 },
            { string: 1, fret: 1, finger: 1 },
        ],
    },
    Em: {
        name: "Em",
        positions: [
            { string: 6, fret: 0 },
            { string: 5, fret: 2, finger: 2 },
            { string: 4, fret: 2, finger: 3 },
            { string: 3, fret: 0 },
            { string: 2, fret: 0 },
            { string: 1, fret: 0 },
        ],
    },
    Fm: {
        name: "Fm",
        positions: [
            { string: 6, fret: 1, finger: 1 },
            { string: 5, fret: 3, finger: 3 },
            { string: 4, fret: 3, finger: 4 },
            { string: 3, fret: 1, finger: 1 },
            { string: 2, fret: 1, finger: 1 },
            { string: 1, fret: 1, finger: 1 },
        ],
        barres: [{ fret: 1, fromString: 6, toString: 1 }],
    },
    Gm: {
        name: "Gm",
        positions: [
            { string: 6, fret: 3, finger: 1 },
            { string: 5, fret: 5, finger: 3 },
            { string: 4, fret: 5, finger: 4 },
            { string: 3, fret: 3, finger: 1 },
            { string: 2, fret: 3, finger: 1 },
            { string: 1, fret: 3, finger: 1 },
        ],
        barres: [{ fret: 3, fromString: 6, toString: 1 }],
    },
    Am: {
        name: "Am",
        positions: [
            { string: 6, fret: -1 },
            { string: 5, fret: 0 },
            { string: 4, fret: 2, finger: 2 },
            { string: 3, fret: 2, finger: 3 },
            { string: 2, fret: 1, finger: 1 },
            { string: 1, fret: 0 },
        ],
    },
    Bm: {
        name: "Bm",
        positions: [
            { string: 6, fret: -1 },
            { string: 5, fret: 2, finger: 1 },
            { string: 4, fret: 4, finger: 3 },
            { string: 3, fret: 4, finger: 4 },
            { string: 2, fret: 3, finger: 2 },
            { string: 1, fret: 2, finger: 1 },
        ],
        barres: [{ fret: 2, fromString: 5, toString: 1 }],
    },
};

export function getGuitarChord(chordName: string): GuitarChord | null {
    // Normalize: remove slash bass for guitar shape lookup if needed,
    // but ideally we'd have slash chords too. For now, simple lookup.
    // Also handle simple variations like "min" -> "m"

    let search = chordName.replace("min", "m");

    // Try direct match
    if (GUITAR_CHORDS[search]) return GUITAR_CHORDS[search];

    // Try removing bass note (e.g., C/G -> C)
    if (search.includes("/")) {
        const base = search.split("/")[0];
        if (GUITAR_CHORDS[base]) return GUITAR_CHORDS[base];
    }

    return null;
}
