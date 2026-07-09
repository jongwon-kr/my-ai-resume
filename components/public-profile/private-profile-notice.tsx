import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PrivateProfileNotice({ slug }: { slug: string }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center p-6">
      <Card>
        <CardHeader>
          <CardTitle>비공개 프로필입니다</CardTitle>
          <CardDescription>@{slug}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            프로필 소유자가 공개 설정을 하지 않아 현재 열람할 수 없습니다.
          </p>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            홈으로 돌아가기
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
