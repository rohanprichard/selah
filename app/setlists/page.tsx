import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateSetlistForm } from "@/components/setlists/create-setlist-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { fetchUserSetlists } from "@/lib/supabase/setlists";

export default async function SetlistsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/setlists");
  }

  const setlists = await fetchUserSetlists();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:py-14">
      <header className="flex flex-col gap-6 border-b border-border/70 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Service planning</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Plan a service with your team</h1>
          <p className="leading-7 text-muted-foreground">
            Build a clear song order, share charts, and switch to live mode when the service starts.
          </p>
        </div>
        <CreateSetlistForm />
      </header>

      <section aria-labelledby="setlist-heading" className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 id="setlist-heading" className="text-xl font-semibold sm:text-2xl">Your setlists</h2>
          <span className="text-sm text-muted-foreground">{setlists.length} total</span>
        </div>
        {setlists.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="space-y-2 py-12 text-center">
              <h3 className="text-lg font-semibold">Start with a setlist</h3>
              <p className="text-sm text-muted-foreground">Use the Create setlist button to plan your next service.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {setlists.map((setlist) => (
              <Card key={setlist.id} className="transition-colors hover:border-primary/40">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg text-foreground">{setlist.title}</CardTitle>
                  {setlist.description ? <CardDescription className="line-clamp-2">{setlist.description}</CardDescription> : null}
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <time dateTime={setlist.updated_at}>Updated {new Date(setlist.updated_at).toLocaleDateString()}</time>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/setlists/${setlist.id}`}>Open setlist</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
