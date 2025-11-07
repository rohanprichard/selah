import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind class names without duplicates", () => {
    expect(cn("px-4", "px-4", "text-sm", undefined)).toBe("px-4 text-sm");
  });

  it("concatenates conditional classes", () => {
    const isActive = true;
    expect(cn("text-muted", isActive && "text-primary")).toBe("text-primary");
  });
});

