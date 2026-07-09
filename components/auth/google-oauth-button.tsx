"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getAuthCallbackUrl } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";

interface GoogleOAuthButtonProps {
  nextPath: string;
  label?: string;
}

export function GoogleOAuthButton({
  nextPath,
  label = "Google로 계속하기",
}: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(nextPath),
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={handleGoogleSignIn}
      >
        {loading ? "Google 연결 중..." : label}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
