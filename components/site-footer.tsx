export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Selah. Pause. Prepare. Worship.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-foreground"
          >
            Built on Supabase
          </a>
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-foreground"
          >
            Powered by Next.js
          </a>
        </div>
      </div>
    </footer>
  );
}

