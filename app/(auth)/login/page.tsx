import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">로딩 중...</p>}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
