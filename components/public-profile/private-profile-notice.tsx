import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PrivateProfileNoticeProps {
  slug: string;
  isOwner?: boolean;
}

export function PrivateProfileNotice({
  slug,
  isOwner = false,
}: PrivateProfileNoticeProps) {
  return (
    <AppShell header={<SiteHeader variant="public-profile" isProfileOwner={isOwner} />}>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center p-6">
        <Card>
          <CardHeader>
            <CardTitle>비공개 프로필입니다</CardTitle>
            <CardDescription>@{slug}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isOwner
                ? "현재 비공개 설정입니다. 대시보드에서 공개로 전환할 수 있습니다."
                : "프로필 소유자가 공개 설정을 하지 않아 현재 열람할 수 없습니다."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/" className={buttonVariants({ variant: "outline" })}>
                홈으로 돌아가기
              </Link>
              {isOwner ? (
                <Link href="/dashboard" className={buttonVariants()}>
                  내 대시보드
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
