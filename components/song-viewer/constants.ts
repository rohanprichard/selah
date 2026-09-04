export const FONT_SIZES = {
  sm: "text-sm leading-6",
  md: "text-base leading-7",
  lg: "text-lg leading-8",
  xl: "text-xl leading-9",
} as const;

export type FontSize = keyof typeof FONT_SIZES;

export const FONT_SIZE_ORDER = ["sm", "md", "lg", "xl"] as const satisfies readonly FontSize[];
