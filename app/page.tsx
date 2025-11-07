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

  const roadmapLinks = [
    {
      href: "/auth/sign-up",
      title: "Create your account",
      description:
        "Enable secure email-based access so you can save private songs and manage your team’s library.",
    },
    {
      href: "/my-songs",
      title: "Draft your first song",
      description:
        "Use the editor stub to outline metadata and sections that we’ll flesh out in the next milestone.",
    },
    {
      href: "https://tonaljs.github.io/tonal/",
      title: "Review transpose tooling",
      description:
        "We’ll integrate Tonal.js to power the live chord transposition workflow described in the spec.",
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

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 bg-muted/30">
          <CardHeader>
            <CardTitle>Project status</CardTitle>
            <CardDescription>
              Milestone 1 delivers authentication, Supabase connectivity, and the
              groundwork for the song catalog experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Upcoming work focuses on browse/search, the chord-aware song editor,
              and collaborative workflows as outlined in the design doc.
            </p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>What’s next</CardTitle>
            <CardDescription>
              Key follow-ups to finish the MVP feature set.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {roadmapLinks.map((item) => (
              <div key={item.href} className="rounded-md border border-border/60 p-4">
                <Link href={item.href} className="text-base font-medium text-primary">
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
