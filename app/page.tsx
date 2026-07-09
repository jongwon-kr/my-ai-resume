import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFeaturedPublicSlug } from "@/lib/dashboard/queries";
import { getPublicProfilePath } from "@/lib/site/url";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    title: "4단계 이력서 입력",
    description:
      "기본 정보, 기술 스택, 프로젝트 STAR 서술까지 구조화된 폼으로 빠르게 작성합니다.",
  },
  {
    title: "AI 클론 자동 생성",
    description:
      "입력한 이력서를 바탕으로 시스템 프롬프트를 생성해 면접관과 대화할 수 있는 AI 클론을 만듭니다.",
  },
  {
    title: "공유 가능한 퍼블릭 URL",
    description:
      "발행 후 /@슬러그 링크 하나로 이력서와 AI 챗봇을 동시에 공유할 수 있습니다.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const featuredSlug = await getFeaturedPublicSlug(supabase);
  const exampleHref = featuredSlug
    ? getPublicProfilePath(featuredSlug)
    : "/signup";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4">
          <span className="text-lg font-semibold">CloneCV</span>
          <div className="flex gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost" })}
            >
              로그인
            </Link>
            <Link href="/signup" className={buttonVariants()}>
              무료로 시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 p-6">
        <section className="flex flex-col items-center gap-8 pt-10 text-center">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary">AI Resume Clone</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              이력서를 AI 클론으로
              <br />
              면접관과 대화하게 하세요
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              CloneCV는 개발자 이력서를 기반으로 AI 클론 프로필을 만들고,
              공유 링크 하나로 채용 담당자와 실시간 대화할 수 있게 해줍니다.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              무료로 시작하기
            </Link>
            <Link
              href={exampleHref}
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              {featuredSlug
                ? `@${featuredSlug} 예시 보기`
                : "예시 프로필 만들기"}
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border bg-muted/30 p-8 text-center">
          <h2 className="text-2xl font-semibold">바이럴 성장은 자동으로</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            모든 퍼블릭 프로필 하단에는 CloneCV 워터마크가 노출되고, 카카오톡·X·링크
            복사 공유 버튼으로 쉽게 퍼뜨릴 수 있습니다.
          </p>
          <Link
            href="/signup"
            className={buttonVariants({ className: "mt-6" })}
          >
            내 이력서 봇 만들기
          </Link>
        </section>

        <section className="pb-10">
          <Card>
            <CardHeader>
              <CardTitle>이런 분께 추천합니다</CardTitle>
              <CardDescription>
                취업 준비생, 이직 중인 개발자, 프리랜서 포트폴리오를 강화하고
                싶은 분
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p>• 채용 담당자에게 이력서 대신 대화형 프로필을 공유</p>
              <p>• 프로젝트 경험을 AI가 대신 설명하는 면접 시뮬레이션</p>
              <p>• 대시보드에서 방문자 대화 로그와 조회 통계 확인</p>
              <p>• 5분 안에 퍼블릭 URL 발행까지 완료</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
