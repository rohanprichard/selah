import Link from "next/link";

import { GoogleAuthButton } from "@/components/google-auth-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LoginFormProps = React.ComponentPropsWithoutRef<"div"> & {
  redirectTo?: string;
};

export function LoginForm({
  className,
  redirectTo = "/my-songs",
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to Selah</CardTitle>
          <CardDescription>Use Google to continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleAuthButton redirectTo={redirectTo}>
            Continue with Google
          </GoogleAuthButton>
          <p className="text-center text-sm text-muted-foreground">
            New to Selah? Your Google account creates an account when you sign in.
          </p>
          <Link
            href="/auth/sign-up"
            className="text-center text-sm underline underline-offset-4"
          >
            Create an account
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
