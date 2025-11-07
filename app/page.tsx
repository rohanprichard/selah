import { Hero } from "@/components/hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Song Library",
      description:
        "Curate public and private chord charts with metadata for key, tempo, tags, and embedded videos.",
    },
    {
      title: "Arrangements",
      description:
        "Compose sections with inline chord notation, fast reordering, and instant chord-over-lyric previews.",
    },
    {
      title: "Team-Friendly",
      description:
        "Invite your worship team to view setlists, transpose charts on the fly, and stay aligned week to week.",
    },
  ];

  const workflow = [
    {
      title: "Search the catalog",
      description: "Discover trusted arrangements from other ministries or reuse your past charts in seconds.",
    },
    {
      title: "Customize sections",
      description: "Update chords, lyrics, and ordering with a purpose-built editor that keeps everything in sync.",
    },
    {
      title: "Share with your team",
      description: "Send polished charts to vocalists, band members, and tech volunteers so everyone shows up ready.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16">
      <Hero />

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border-primary/10 bg-card">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Run your next setlist with confidence</CardTitle>
            <CardDescription>
              CCM Setlist Builder keeps your entire worship workflow in one place—from discovery to rehearsal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            {workflow.map((item) => (
              <div key={item.title}>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Ready to get started?</CardTitle>
            <CardDescription>
              Create a free account to save private charts or jump straight into the public library to find inspiration.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link
              href="/auth/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Create an account
            </Link>
            <Link
              href="/songs"
              className="rounded-md border border-border px-4 py-2 text-center text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Search the library
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
