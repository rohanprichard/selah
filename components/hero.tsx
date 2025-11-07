import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-10 text-center">
      <div className="flex max-w-3xl flex-col gap-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Worship-ready from rehearsal to Sunday
        </div>
        <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
          Plan setlists, share chord charts, and lead worship with confidence.
        </h1>
        <p className="text-pretty text-base text-muted-foreground sm:text-lg">
          CCM Setlist Builder gives your team a single home for lyrics, chord
          progressions, and service prep. Browse community-approved songs or
          craft your own arrangements without juggling docs and PDFs.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/auth/sign-up">Create free account</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/songs">Search public songs</Link>
        </Button>
      </div>
    </section>
  );
}
