import Link from "next/link";
import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";

const howItWorks = [
  {
    step: "1",
    title: "Upload the chart",
    description:
      "Chords and lyrics in one place. Add a link to the YouTube or live take you\u2019re following.",
  },
  {
    step: "2",
    title: "Keep versions straight",
    description:
      "Same song, different arrangements. Fork a chart. Mark the one your team uses.",
  },
  {
    step: "3",
    title: "Share the right one",
    description:
      "Send a link. Everyone opens the same version — no scavenger hunt in the group chat.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />

      {/* How it works */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
          <h2 className="mb-12 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            How it works
          </h2>
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center sm:text-left">
                <span className="mb-3 inline-block text-xs font-semibold text-muted-foreground">
                  {item.step}
                </span>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Selah */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-24">
          <h2 className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Why Selah
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>Official catalogs sell the song.</p>
            <p>Drive folders bury the take you meant.</p>
            <p className="font-medium text-foreground">
              Selah is for the chart that matches <em>this</em> recording — bass
              line, key, and all.
            </p>
          </div>
        </div>
      </section>

      {/* Closing strip */}
      <section className="border-t border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-20">
          <p className="mb-1 text-base text-background/70">
            Praising with the chart.
          </p>
          <h2 className="mb-8 text-xl font-semibold tracking-tight sm:text-2xl">
            Let everything that has breath praise the Lord.
          </h2>
          <Button
            asChild
            size="lg"
            className="h-11 bg-background px-6 text-base text-foreground hover:bg-background/90"
          >
            <Link href="/auth/login">Upload a song</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
