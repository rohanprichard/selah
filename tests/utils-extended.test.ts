import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("px-4")).toBe("px-4");
  });

  it("joins multiple classes", () => {
    expect(cn("px-4", "py-2", "text-sm")).toBe("px-4 py-2 text-sm");
  });

  it("drops falsy conditional classes", () => {
    const isActive = false;
    expect(cn("text-muted", isActive && "text-primary")).toBe("text-muted");
  });

  it("ignores undefined and null values", () => {
    expect(cn("px-4", undefined, null, "py-2")).toBe("px-4 py-2");
  });

  it("merges conflicting tailwind utilities, keeping the last one", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("flattens array arguments", () => {
    expect(cn(["px-4", "py-2"], "text-sm")).toBe("px-4 py-2 text-sm");
  });

  it("returns an empty string when given no classes", () => {
    expect(cn()).toBe("");
  });
});
