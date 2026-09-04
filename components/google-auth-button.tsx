"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

type GoogleAuthButtonProps = {
  redirectTo: string;
  children: string;
};

export function GoogleAuthButton({
  redirectTo,
  children,
}: GoogleAuthButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(window.location.origin, redirectTo),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Google sign-in did not start.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      <Button
        type="button"
        className="w-full"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
      >
        {isLoading ? "Opening Google..." : children}
      </Button>
    </div>
  );
}
