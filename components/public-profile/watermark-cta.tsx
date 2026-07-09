import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function WatermarkCta() {
  return (
    <div className="border-t bg-muted/40 px-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">
        이 이력서 봇, 어떻게 만들었을까요?
      </p>
      <Link href="/signup" className={buttonVariants({ className: "mt-3" })}>
        무료로 만들기 →
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        AI 클론이며 참고용입니다. 실제 채용 결정과는 무관합니다.
      </p>
    </div>
  );
}
