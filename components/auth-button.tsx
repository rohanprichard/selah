import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileName = user
    ? (
        await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle()
      ).data?.full_name ?? undefined
    : undefined;

  const displayName = profileName || user?.email || undefined;

  return user ? (
    <div className="flex items-center gap-3 text-sm">
      {displayName ? (
        <span className="hidden text-muted-foreground sm:inline" title={displayName}>
          Hey, {displayName}!
        </span>
      ) : null}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login?next=/my-songs">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up?next=/my-songs">Sign up</Link>
      </Button>
    </div>
  );
}
