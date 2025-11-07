"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { KEY_OPTIONS } from "@/lib/constants/music";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SongFiltersProps = {
  initialQuery?: string;
  initialKey?: string;
  initialTag?: string;
  availableTags: string[];
};

const QUERY_DEBOUNCE_MS = 350;

export function SongFilters({
  initialQuery = "",
  initialKey = "",
  initialTag = "",
  availableTags,
}: SongFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = React.useState(initialQuery);
  const [selectedKey, setSelectedKey] = React.useState(initialKey || "any");
  const [selectedTag, setSelectedTag] = React.useState(initialTag || "any");
  const isFirstRender = React.useRef(true);

  const searchParamsString = React.useMemo(() => searchParams.toString(), [searchParams]);

  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  React.useEffect(() => {
    setSelectedKey(initialKey || "any");
  }, [initialKey]);

  React.useEffect(() => {
    setSelectedTag(initialTag || "any");
  }, [initialTag]);

  const updateParam = React.useCallback(
    (key: string, value?: string, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParamsString);
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");

      const basePath = pathname || "/songs";
      const newParamString = params.toString();
      const target = newParamString ? `${basePath}?${newParamString}` : basePath;
      const current = searchParamsString ? `${basePath}?${searchParamsString}` : basePath;

      if (target === current) {
        return;
      }

      if (options?.replace) {
        router.replace(target);
      } else {
        router.push(target);
      }
    },
    [pathname, router, searchParamsString],
  );

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      updateParam("q", query || undefined, { replace: true });
    }, QUERY_DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [query, updateParam]);

  const handleKeyChange = (value: string) => {
    setSelectedKey(value);
    updateParam("key", value === "any" ? undefined : value);
  };

  const handleTagChange = (value: string) => {
    setSelectedTag(value);
    updateParam("tag", value === "any" ? undefined : value);
  };

  const handleReset = () => {
    setQuery("");
    setSelectedKey("any");
    setSelectedTag("any");
    const base = pathname || "/songs";
    router.push(base);
  };

  return (
    <form
      className="grid grid-cols-1 gap-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm md:grid-cols-4"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="song-search">Search</Label>
        <Input
          id="song-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, artist, or writer"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="song-key">Key</Label>
        <Select value={selectedKey} onValueChange={handleKeyChange}>
          <SelectTrigger id="song-key">
            <SelectValue placeholder="Any key" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any key</SelectItem>
            {KEY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="song-tag">Tag</Label>
        <Select value={selectedTag} onValueChange={handleTagChange}>
          <SelectTrigger id="song-tag">
            <SelectValue placeholder="Any tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any tag</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end justify-start md:justify-end">
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset filters
        </Button>
      </div>
    </form>
  );
}

