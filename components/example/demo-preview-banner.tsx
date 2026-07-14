import Link from "next/link";

import { EXAMPLE_PROFILE_SLUG } from "@/lib/example/demo-profile";
import { getPublicProfilePath } from "@/lib/site/url";

export function DemoPreviewBanner() {
  return (
    <div className="border-b bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
      <span className="font-medium">예시 화면</span>
      <span className="text-amber-900/80">
        {" "}
        — @kimdev 가상 데이터로 구성된 미리보기입니다. 저장·발행은 동작하지
        않습니다.{" "}
      </span>
      <Link
        href={getPublicProfilePath(EXAMPLE_PROFILE_SLUG)}
        className="font-medium underline underline-offset-2"
      >
        @{EXAMPLE_PROFILE_SLUG} 공개 프로필 보기
      </Link>
    </div>
  );
}
