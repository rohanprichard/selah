export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 py-6 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Selah. Pause. Prepare. Worship.</p>

      </div>
    </footer>
  );
}

