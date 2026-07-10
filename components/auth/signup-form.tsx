"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthCallbackUrl } from "@/lib/auth/constants";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl("/onboarding"),
      },
    });

    if (signUpError) {
      setError(getAuthErrorMessage(signUpError.message));
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    setMessage(
      "가입 확인 메일을 보냈습니다. 메일함에서 링크를 클릭하시면 프로필 설정이 시작됩니다.",
    );
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">회원가입</CardTitle>
        <CardDescription>대화형 이력서를 만들어 보세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium">
              이메일
            </label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium">
              비밀번호
            </label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="6자리 이상 입력해 주세요"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? (
            <p className="text-sm text-primary font-medium">{message}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "가입 중..." : "이메일로 가입하기"}
          </Button>
        </form>

        <div className="relative text-center text-xs text-muted-foreground">
          <span className="bg-card px-2">또는</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 border-t" />
        </div>

        <GoogleOAuthButton
          nextPath="/onboarding"
          label="Google 계정으로 가입하기"
        />

        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            로그인
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
