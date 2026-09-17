import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function WatermarkCta() {
  return (
    <div className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">
          이 이력서 봇, 어떻게 만들었을까요?
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-3" })}>
          알아보기 →
        </Link>
      </div>
    </div>
  );
}
