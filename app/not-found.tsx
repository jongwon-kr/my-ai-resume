import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getNavContext } from "@/lib/layout/nav-context";

export default async function NotFound() {
  const nav = await getNavContext();

  return (
    <AppShell
      header={
        <SiteHeader
          variant="full"
          isAuthenticated={nav.isAuthenticated}
          profile={nav.profile}
        />
      }
      footer={<SiteFooter isAuthenticated={nav.isAuthenticated} />}
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center p-6">
        <Card>
          <CardHeader>
            <CardTitle>페이지를 찾을 수 없습니다</CardTitle>
            <CardDescription>
              주소가 잘못되었거나 삭제된 페이지일 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Link href="/" className={buttonVariants()}>
              홈으로
            </Link>
            {nav.isAuthenticated ? (
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "outline" })}
              >
                대시보드
              </Link>
            ) : (
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline" })}
              >
                로그인
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
