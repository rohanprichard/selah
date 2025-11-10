"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ArrangementItem } from "@/lib/types";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

function generateShareToken() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to perform this action.");
  }

  return { supabase, user };
}

export async function createSetlistAction(input: {
  title: string;
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireUser();
    const shareToken = generateShareToken();

    const { data, error } = await supabase
      .from("setlists")
      .insert({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        share_token: shareToken,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message ?? "Unable to create setlist." };
    }

    await revalidatePath("/setlists");

    return { success: true, data: { id: data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to create setlist.",
    };
  }
}

export async function updateSetlistDetailsAction(input: {
  id: string;
  title: string;
  description?: string;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();

    const { error } = await supabase
      .from("setlists")
      .update({
        title: input.title.trim(),
        description: input.description?.trim() || null,
      })
      .eq("id", input.id);

    if (error) {
      return { success: false, error: error.message };
    }

    await revalidatePath("/setlists");
    await revalidatePath(`/setlists/${input.id}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to update setlist.",
    };
  }
}

export async function addSetlistSongAction(input: {
  setlistId: string;
  songId: string;
  arrangement?: ArrangementItem[] | null;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();

    // Check for duplicates
    const { data: existing, error: checkError } = await supabase
      .from("setlist_songs")
      .select("id")
      .eq("setlist_id", input.setlistId)
      .eq("song_id", input.songId)
      .maybeSingle();

    if (checkError) {
      return { success: false, error: checkError.message };
    }

    if (existing) {
      return { success: false, error: "This song is already in the setlist." };
    }

    const { data: currentMax, error: maxError } = await supabase
      .from("setlist_songs")
      .select("order_index")
      .eq("setlist_id", input.setlistId)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxError) {
      return { success: false, error: maxError.message };
    }

    const nextOrder = currentMax ? currentMax.order_index + 1 : 0;

    const { error } = await supabase.from("setlist_songs").insert({
      setlist_id: input.setlistId,
      song_id: input.songId,
      order_index: nextOrder,
      arrangement: input.arrangement ?? null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    await revalidatePath(`/setlists/${input.setlistId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to add song to setlist.",
    };
  }
}

export async function updateSetlistSongAction(input: {
  id: string;
  setlistId: string;
  customKey?: string | null;
  customTempo?: number | null;
  customTimeSignature?: string | null;
  notes?: string | null;
  arrangement?: ArrangementItem[] | null;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();

    const updates: Record<string, unknown> = {};
    
    if (input.customKey !== undefined) {
      updates.custom_key = input.customKey ?? null;
    }
    if (input.customTempo !== undefined) {
      updates.custom_tempo = input.customTempo ?? null;
    }
    if (input.customTimeSignature !== undefined) {
      updates.custom_time_signature = input.customTimeSignature ?? null;
    }
    if (input.notes !== undefined) {
      updates.notes = input.notes ?? null;
    }
    if (input.arrangement !== undefined) {
      updates.arrangement = input.arrangement ?? null;
    }

    const { error } = await supabase
      .from("setlist_songs")
      .update(updates)
      .eq("id", input.id);

    if (error) {
      return { success: false, error: error.message };
    }

    await revalidatePath(`/setlists/${input.setlistId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to update setlist song.",
    };
  }
}

export async function removeSetlistSongAction(input: {
  id: string;
  setlistId: string;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();

    const { error: deleteError } = await supabase
      .from("setlist_songs")
      .delete()
      .eq("id", input.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    const { data: remaining, error: remainingError } = await supabase
      .from("setlist_songs")
      .select("id, order_index")
      .eq("setlist_id", input.setlistId)
      .order("order_index", { ascending: true });

    if (remainingError) {
      return { success: false, error: remainingError.message };
    }

    if (remaining && remaining.length > 0) {
      for (let index = 0; index < remaining.length; index += 1) {
        const entry = remaining[index];
        const { error: reorderError } = await supabase
          .from("setlist_songs")
          .update({ order_index: index })
          .eq("id", entry.id);
        if (reorderError) {
          return { success: false, error: reorderError.message };
        }
      }
    }

    await revalidatePath(`/setlists/${input.setlistId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to remove song from setlist.",
    };
  }
}

export async function moveSetlistSongAction(input: {
  id: string;
  setlistId: string;
  direction: "up" | "down";
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();

    const { data: current, error: currentError } = await supabase
      .from("setlist_songs")
      .select("id, order_index")
      .eq("id", input.id)
      .maybeSingle();

    if (currentError || !current) {
      return { success: false, error: currentError?.message ?? "Setlist song not found." };
    }

    const targetOrder = current.order_index + (input.direction === "up" ? -1 : 1);

    const { data: swapCandidate, error: swapError } = await supabase
      .from("setlist_songs")
      .select("id, order_index")
      .eq("setlist_id", input.setlistId)
      .eq("order_index", targetOrder)
      .maybeSingle();

    if (swapError) {
      return { success: false, error: swapError.message };
    }

    if (!swapCandidate) {
      return { success: true };
    }

    const { error: moveCurrentError } = await supabase
      .from("setlist_songs")
      .update({ order_index: targetOrder })
      .eq("id", current.id);
    if (moveCurrentError) {
      return { success: false, error: moveCurrentError.message };
    }

    const { error: moveSwapError } = await supabase
      .from("setlist_songs")
      .update({ order_index: current.order_index })
      .eq("id", swapCandidate.id);
    if (moveSwapError) {
      return { success: false, error: moveSwapError.message };
    }

    await revalidatePath(`/setlists/${input.setlistId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to reorder song.",
    };
  }
}

export async function searchSongsAction(query: string): Promise<
  ActionResult<
    Array<{
      id: string;
      title: string;
      artist: string | null;
      key: string;
      tempo: number | null;
      time_signature: string | null;
    }>
  >
> {
  try {
    const { supabase } = await requireUser();

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from("songs")
      .select("id, title, artist, key, tempo, time_signature")
      .or(
        `title.ilike.%${trimmed}%,artist.ilike.%${trimmed}%,writer.ilike.%${trimmed}%`,
      )
      .order("title", { ascending: true })
      .limit(10);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to search songs.",
    };
  }
}

export async function fetchSongSectionsAction(
  songId: string,
): Promise<
  ActionResult<
    Array<{
      id: string;
      type: string;
      label: string;
      order_index: number;
    }>
  >
> {
  try {
    const { supabase } = await requireUser();

    const { data, error } = await supabase
      .from("song_sections")
      .select("id, type, label, order_index")
      .eq("song_id", songId)
      .order("order_index", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to fetch song sections.",
    };
  }
}

