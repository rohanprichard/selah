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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12">
      <CreateSetlistForm />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your setlists</h2>
        {setlists.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
            You haven&apos;t created a setlist yet. Use the form above to start planning your service.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {setlists.map((setlist) => (
              <Card key={setlist.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {setlist.title}
                  </CardTitle>
                  {setlist.description ? (
                    <CardDescription className="line-clamp-2">{setlist.description}</CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <div>
                    <p>Updated {new Date(setlist.updated_at).toLocaleDateString()}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/setlists/${setlist.id}`}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


