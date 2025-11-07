import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = typeof user?.email === "string" ? user.email : undefined;

  return user ? (
    <div className="flex items-center gap-3 text-sm">
      {email ? (
        <span className="hidden text-muted-foreground sm:inline" title={email}>
          Signed in as {email}
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
