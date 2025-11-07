import { Hero } from "@/components/hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Song Library",
      description: "Collect chords, lyrics, and resources in one trusted place for your team.",
    },
    {
      title: "Arrangements",
      description: "Shape sections quickly with inline chords, reordering, and clean previews.",
    },
    {
      title: "Team-Friendly",
      description: "Share transposable charts so every musician arrives prepared and confident.",
    },
  ];

  const workflow = [
    {
      title: "Search the catalog",
      description: "Find proven arrangements from the community or resurface your own favourites.",
    },
    {
      title: "Customize sections",
      description: "Fine-tune lyrics, chords, and flow without breaking your rhythm.",
    },
    {
      title: "Share with your team",
      description: "Send beautiful charts to vocals, band, and tech so everyone leads together.",
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
            <CardTitle>Pause. Prepare. Worship.</CardTitle>
            <CardDescription>
              Selah keeps your worship workflow calm and coordinated from discovery to rehearsal.
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
            <CardTitle>Begin with Selah</CardTitle>
            <CardDescription>
              Create a free account to save private charts or explore the public library for inspiration.
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
