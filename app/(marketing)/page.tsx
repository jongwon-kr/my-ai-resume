import Link from "next/link";
import { Bot, FileText, Share2 } from "lucide-react";

import { Container, SectionHeading } from "@/components/marketing/section";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFeaturedPublicSlug } from "@/lib/dashboard/queries";
import { getNavContext } from "@/lib/layout/nav-context";
import { getPublicProfilePath } from "@/lib/site/url";
import { createClient } from "@/lib/supabase/server";

const STEPS = [
  {
    icon: FileText,
    title: "이력서 입력",
    description:
      "기본 정보·경력·학력·기술 스택·프로젝트를 구조화된 폼으로 작성합니다. 자동 저장되어 이어서 작업할 수 있어요.",
  },
  {
    icon: Bot,
    title: "AI 클론 생성",
    description:
      "입력한 이력서를 바탕으로 시스템 프롬프트를 만들어, 면접관과 대화할 수 있는 나만의 AI 클론을 생성합니다.",
  },
  {
    icon: Share2,
    title: "링크로 공유",
    description:
      "/@슬러그 링크 하나로 이력서와 AI 챗봇을 동시에 공유합니다. 채용 담당자가 직접 질문하며 대화할 수 있어요.",
  },
];

const FAQ = [
  {
    q: "무료로 사용할 수 있나요?",
    a: "네, 이력서 작성부터 AI 클론 생성, 공개 프로필 발행까지 무료로 시작할 수 있습니다.",
  },
  {
    q: "AI 챗봇은 어떤 정보로 답변하나요?",
    a: "직접 입력한 이력서 데이터(경력·학력·자격증·프로젝트·자기소개서 등)만을 근거로 1인칭으로 답변합니다. 없는 사실은 지어내지 않습니다.",
  },
  {
    q: "민감한 개인정보도 노출되나요?",
    a: "전화번호나 정확한 생년월일 같은 민감 정보는 답변하지 않도록 가드레일이 적용되어 있습니다. 이메일·링크 등 공개해도 되는 정보만 답합니다.",
  },
  {
    q: "개발자만 사용할 수 있나요?",
    a: "프로젝트 STAR 서술 등 개발 직군에 최적화되어 있지만, 경력과 프로젝트가 있는 누구나 사용할 수 있습니다.",
  },
];

const CHAT_PREVIEW = [
  { role: "user" as const, text: "가장 어려웠던 프로젝트는 무엇인가요?" },
  {
    role: "assistant" as const,
    text: "대량 알림 발송 시스템에서 서버 부하 문제가 가장 어려웠습니다. Redis 기반 메시지 큐를 도입해 DB 부하를 분산하고 안정성을 확보했습니다.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const [featuredSlug, nav] = await Promise.all([
    getFeaturedPublicSlug(supabase),
    getNavContext(),
  ]);
  const exampleHref = featuredSlug
    ? getPublicProfilePath(featuredSlug)
    : "/signup";
  const primaryCtaHref = nav.isAuthenticated ? "/dashboard" : "/signup";
  const primaryCtaLabel = nav.isAuthenticated
    ? "대시보드"
    : "무료로 시작하기";

  return (
    <div className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-brand-accent/5 to-transparent"
          />
          <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
            <div className="space-y-6 text-center lg:text-left">
              <p className="text-sm font-medium text-primary">
                AI Resume Clone
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                이력서를 AI 클론으로
                <br />
                면접관과 대화하게 하세요
              </h1>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
                CloneCV는 이력서를 기반으로 AI 클론 프로필을 만들고, 공유 링크
                하나로 채용 담당자와 실시간 대화할 수 있게 해줍니다.
              </p>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link
                  href={primaryCtaHref}
                  className={buttonVariants({ size: "lg" })}
                >
                  {primaryCtaLabel}
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
            </div>

            <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </span>
                <div className="text-sm">
                  <p className="font-medium">AI 클론</p>
                  <p className="text-xs text-muted-foreground">
                    면접관과 실시간 대화
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {CHAT_PREVIEW.map((message) => (
                  <div
                    key={message.text}
                    className={
                      message.role === "user"
                        ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                        : "max-w-[90%] rounded-2xl bg-muted px-4 py-2 text-sm"
                    }
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section className="border-b py-16 lg:py-20">
          <Container className="space-y-10">
            <SectionHeading
              eyebrow="How it works"
              title="3단계면 충분합니다"
              description="입력에서 공유까지, 5분 안에 나만의 대화형 이력서를 완성하세요."
            />
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <Card key={step.title} className="relative">
                  <CardHeader>
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon className="size-5" />
                    </span>
                    <CardTitle className="mt-3 flex items-center gap-2 text-lg">
                      <span className="text-sm font-normal text-muted-foreground">
                        0{index + 1}
                      </span>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Example */}
        <section className="border-b py-16 lg:py-20">
          <Container>
            <div className="rounded-3xl border bg-muted/30 p-8 text-center sm:p-12">
              <SectionHeading
                eyebrow="Example"
                title="실제 클론을 먼저 만나보세요"
                description="예시 프로필에서 AI 클론에게 직접 질문해볼 수 있습니다."
              />
              <Link
                href={exampleHref}
                className={buttonVariants({ size: "lg", className: "mt-6" })}
              >
                {featuredSlug
                  ? `@${featuredSlug} 예시 열기`
                  : "예시 만들어보기"}
              </Link>
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="border-b py-16 lg:py-20">
          <Container className="space-y-10">
            <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" />
            <div className="mx-auto max-w-2xl divide-y rounded-xl border">
              {FAQ.map((item) => (
                <details key={item.q} className="group p-5">
                  <summary className="cursor-pointer list-none font-medium">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <Container>
            <div className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground sm:px-12">
              <h2 className="text-2xl font-bold sm:text-3xl">
                지금 바로 내 AI 이력서를 만들어보세요
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
                무료로 시작하고, 링크 하나로 이력서와 AI 챗봇을 함께 공유하세요.
              </p>
              <Link
                href={primaryCtaHref}
                className={buttonVariants({
                  size: "lg",
                  variant: "secondary",
                  className: "mt-6",
                })}
              >
                {primaryCtaLabel}
              </Link>
            </div>
          </Container>
        </section>
    </div>
  );
}
