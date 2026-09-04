import { MUSICAL_KEYS } from "@/lib/constants/music";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseSongLibraryParams(params: SearchParams) {
  const query = getSingleValue(params.q)?.trim() ?? "";
  const keyValue = getSingleValue(params.key);
  const tag = getSingleValue(params.tag)?.trim() ?? "";
  const pageValue = getSingleValue(params.page);
  const page = Math.max(1, Number.parseInt(pageValue ?? "1", 10) || 1);
  const key = keyValue && MUSICAL_KEYS.includes(keyValue as (typeof MUSICAL_KEYS)[number]) ? keyValue : "";

  return { query, key, tag, page };
}
