"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getPostAuthPath } from "@/lib/auth/post-auth-path";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth_callback_error"
      ? "인증 처리에 실패했습니다. 다시 시도해 주세요."
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(Boolean(user));
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(getAuthErrorMessage(signInError.message));
      setLoading(false);
      return;
    }

    const nextPath = await getPostAuthPath(supabase, "/dashboard");
    router.push(nextPath);
    router.refresh();
  }

  if (checkingSession) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          세션 확인 중...
        </CardContent>
      </Card>
    );
  }

  if (isLoggedIn) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>이미 로그인되어 있습니다</CardTitle>
          <CardDescription>
            다른 계정으로 접속하시려면 먼저 로그아웃해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            href="/dashboard"
            className={buttonVariants({ className: "w-full" })}
          >
            내 대시보드로 이동
          </Link>
          <LogoutButton variant="outline" className="w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">로그인</CardTitle>
        <CardDescription>나만의 대화형 이력서를 완성하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "이메일로 로그인"}
          </Button>
        </form>

        <div className="relative text-center text-xs text-muted-foreground">
          <span className="bg-card px-2">또는</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 border-t" />
        </div>

        <GoogleOAuthButton nextPath="/dashboard" />

        <p className="text-center text-sm text-muted-foreground">
          아직 계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            가입 하기
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
