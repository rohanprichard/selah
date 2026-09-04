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

type SignUpFormProps = React.ComponentPropsWithoutRef<"div"> & {
  redirectTo?: string;
};

export function SignUpForm({
  className,
  redirectTo = "/my-songs",
  ...props
}: SignUpFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a Selah account</CardTitle>
          <CardDescription>Use Google to create your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleAuthButton redirectTo={redirectTo}>
            Continue with Google
          </GoogleAuthButton>
          <p className="text-center text-sm text-muted-foreground">
            Google creates your Selah account when you sign in.
          </p>
          <Link
            href="/auth/login"
            className="text-center text-sm underline underline-offset-4"
          >
            Sign in to an existing account
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
