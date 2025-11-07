"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
};

export function PaginationControls({
  currentPage,
  pageSize,
  totalItems,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const paramString = params.toString();
    const basePath = pathname || "/songs";
    router.push(paramString ? `${basePath}?${paramString}` : basePath);
  };

  if (totalItems <= pageSize && currentPage === 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card p-4 text-sm">
      <p className="text-muted-foreground">
        Showing {(currentPage - 1) * pageSize + 1}–
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage - 1)}
          disabled={!hasPrev}
        >
          Previous
        </Button>
        <span className="text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage + 1)}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

