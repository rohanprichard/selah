export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Selah. Pause. Prepare. Worship.</p>
        <div className="flex items-center gap-4">
        </div>
      </div>
    </footer>
  );
}

