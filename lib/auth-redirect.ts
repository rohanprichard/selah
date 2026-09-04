const defaultRedirectTo = "/my-songs";

export function getAuthCallbackUrl(origin: string, redirectTo: string) {
  const safeRedirectTo =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : defaultRedirectTo;

  return `${origin}/auth/callback?next=${encodeURIComponent(safeRedirectTo)}`;
}
