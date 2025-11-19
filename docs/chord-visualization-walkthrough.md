# Chord Visualization Walkthrough

I have implemented the chord visualization feature, which allows users to hover over chords in the song viewer to see guitar and piano diagrams.

## Changes

### 1. Chord Tooltip Component
I created a `ChordTooltip` component that wraps the chord text. It uses `HoverCard` from `shadcn/ui` to display a popup on hover.

### 2. Visualizers
- **Guitar Visualizer**: Renders an SVG fretboard with finger positions. It uses a new `guitar-chords.ts` library for chord data.
    - **Expanded Dictionary**: Now supports Major, Minor, 7th, Minor 7th, Major 7th, and Suspended chords.
    - **Sharp/Flat Support**: Includes standard voicings for sharps and flats (e.g., D#, Bb, C#m).
- **Piano Visualizer**: Renders an SVG keyboard and highlights the keys corresponding to the chord notes using `@tonaljs/tonal`.
    - **Enharmonic Handling**: Correctly handles enharmonic equivalents (e.g., D# vs Eb) using chroma comparison.
    - **Complex Chords**: Dynamically visualizes any chord supported by Tonal.js (aug, dim, sus, etc.).

### 3. Song Viewer Integration
I updated `SongViewer` to render chords using absolute positioning (`left: Xch`) instead of a pre-formatted string. This allows each chord to be an interactive element while maintaining perfect alignment with the lyrics.

## Verification Results

### Automated Tests
- `npm test` passed.

### Manual Verification
- **Alignment**: Chords are positioned using `ch` units, ensuring they align with the monospace lyrics.
- **Interaction**: Hovering over a chord triggers the tooltip.
- **Visuals**:
    -   **Guitar**: Verified standard open chords, barre chords for sharps/flats, and complex variations (7ths, sus).
    -   **Piano**: Verified correct key highlighting for major, minor, and complex chords, including correct handling of enharmonics (D# matches Eb keys).

## Files Created/Modified
- `components/ui/hover-card.tsx`
- `components/chords/chord-tooltip.tsx`
- `components/chords/guitar-visualizer.tsx`
- `components/chords/piano-visualizer.tsx`
- `lib/guitar-chords.ts`
- `components/song-viewer.tsx`
