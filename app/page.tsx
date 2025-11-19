import { Hero } from "@/components/hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Library, ListMusic, Users, Search, Edit3, Share2 } from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "Song Library",
      description: "Collect chords, lyrics, and resources in one trusted place.",
      icon: Library,
    },
    {
      title: "Arrangements",
      description: "Shape sections quickly with inline chords, reordering, and clean previews.",
      icon: Edit3,
    },
    {
      title: "Team-Friendly",
      description: "Share transposable charts so every musician arrives prepared and confident.",
      icon: Users,
    },
  ];

  const workflow = [
    {
      title: "Search the catalog",
      description: "Find proven arrangements from the community or remix your own favourites.",
      icon: Search,
    },
    {
      title: "Customize sections",
      description: "Fine-tune lyrics, chords, and flow without breaking your rhythm.",
      icon: ListMusic,
    },
    {
      title: "Share with your team",
      description: "Send detailed lyrics to vocals, chords to band, and the flow to tech.",
      icon: Share2,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 py-16">
      <Hero />

      <section className="grid gap-8 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="glass border-white/20 bg-white/40 dark:bg-black/20 transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground px-6 py-16 sm:px-12 sm:py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
              Workflow
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pause. Prepare. Worship.
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Selah keeps your worship prep smooth and coordinated from discovery to rehearsal.
            </p>
            <div className="flex flex-col gap-4 pt-4">
              {workflow.map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
                    <item.icon className="h-3 w-3" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-primary-foreground/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="glass bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Begin with Selah</CardTitle>
              <CardDescription className="text-white/70">
                Create a free account to save private charts or explore the public library for inspiration.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link
                href="/auth/sign-up"
                className="rounded-md bg-white text-primary px-4 py-3 text-center text-sm font-bold shadow-sm transition hover:bg-white/90"
              >
                Create an account
              </Link>
              <Link
                href="/songs"
                className="rounded-md border border-white/30 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
              >
                Search the library
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
