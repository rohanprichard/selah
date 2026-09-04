import { describe, expect, it } from "vitest";

import { BaseSongSchema, CreateSongSchema, UpdateSongSchema } from "@/lib/validation/songs";

const validSong = {
  title: "Amazing Grace",
  key: "G",
  timeSignature: "4/4",
  sections: [
    { type: "verse", label: "Verse 1", lyrics: "[G]Amazing grace", order: 0 },
  ],
};

describe("CreateSongSchema", () => {
  it("accepts valid input", () => {
    const result = CreateSongSchema.safeParse(validSong);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const withoutTitle: Record<string, unknown> = { ...validSong };
    delete withoutTitle.title;
    const result = CreateSongSchema.safeParse(withoutTitle);
    expect(result.success).toBe(false);
  });

  it("rejects invalid key", () => {
    const result = CreateSongSchema.safeParse({ ...validSong, key: "H" });
    expect(result.success).toBe(false);
  });
});

describe("UpdateSongSchema", () => {
  it("requires an id field", () => {
    const result = UpdateSongSchema.safeParse(validSong);
    expect(result.success).toBe(false);
  });

  it("accepts a valid id", () => {
    const result = UpdateSongSchema.safeParse({
      ...validSong,
      id: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });
});

describe("BaseSongSchema tempo validation", () => {
  it("accepts tempo within range", () => {
    const result = BaseSongSchema.safeParse({ ...validSong, tempo: 120 });
    expect(result.success).toBe(true);
  });

  it("accepts the boundary values", () => {
    expect(BaseSongSchema.safeParse({ ...validSong, tempo: 30 }).success).toBe(true);
    expect(BaseSongSchema.safeParse({ ...validSong, tempo: 260 }).success).toBe(true);
  });

  it("rejects tempo below 30", () => {
    const result = BaseSongSchema.safeParse({ ...validSong, tempo: 29 });
    expect(result.success).toBe(false);
  });

  it("rejects tempo above 260", () => {
    const result = BaseSongSchema.safeParse({ ...validSong, tempo: 261 });
    expect(result.success).toBe(false);
  });

  it("allows tempo to be null", () => {
    const result = BaseSongSchema.safeParse({ ...validSong, tempo: null });
    expect(result.success).toBe(true);
  });
});
