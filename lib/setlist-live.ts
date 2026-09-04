type LiveSetlistPathOptions = {
  shareToken?: string;
  setlistId?: string;
  currentEntryId: string | null;
};

export function getAdjacentEntryId(
  entryIds: string[],
  currentEntryId: string | null,
  direction: -1 | 1,
) {
  const currentIndex = currentEntryId ? entryIds.indexOf(currentEntryId) : -1;
  const nextIndex = Math.min(Math.max(currentIndex + direction, 0), entryIds.length - 1);

  return entryIds[nextIndex] ?? null;
}

export function getLiveSetlistPath({
  shareToken,
  setlistId,
  currentEntryId,
}: LiveSetlistPathOptions) {
  const basePath = shareToken ? `/s/${shareToken}` : `/setlists/${setlistId}`;
  const params = new URLSearchParams({ live: "true" });

  if (currentEntryId) {
    params.set("current", currentEntryId);
  }

  return `${basePath}?${params.toString()}`;
}
