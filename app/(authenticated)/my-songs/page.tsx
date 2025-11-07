import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function MySongsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login?next=/my-songs");
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">My Songs</h1>
        <p className="text-sm text-muted-foreground">
          Manage the chord charts you create for your team. Publishing controls,
          collaborative editing, and section ordering arrive in the next
          milestone.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            The setlist builder will show your saved songs, quick filters, and
            actions like edit, duplicate, and publish.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>
            While we implement the editor experience, sketch out the metadata and
            sections you’ll need using the product spec.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/auth/sign-up">Invite your team</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Browse library</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

