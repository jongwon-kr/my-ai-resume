import Link from "next/link";
import { Bot, FileText, Share2 } from "lucide-react";

import { HeroChatDemo } from "@/components/marketing/hero-chat-demo";
import { Reveal } from "@/components/marketing/reveal";
import { Container, SectionHeading } from "@/components/marketing/section";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAMPLE_PROFILE_SLUG } from "@/lib/example/demo-profile";
import { getNavContext } from "@/lib/layout/nav-context";
import { RESUME_BUILDER_STEPS } from "@/lib/resume/schema";
import { getPublicProfilePath } from "@/lib/site/url";

const STEPS = [
  {
    icon: FileText,
    title: "경력 입력 · PDF 가져오기",
    description:
      "가진 이력서 PDF를 올리면 항목을 자동으로 채워 줍니다. 프로젝트와 포트폴리오, 외부 링크도 한곳에 담깁니다.",
  },
  {
    icon: Bot,
    title: "AI 챗봇 생성",
    description:
      "입력된 데이터를 바탕으로 나의 강점과 이야기를 정확히 이해하고 질문에 답변하는 맞춤형 AI 챗봇이 탄생합니다.",
  },
  {
    icon: Share2,
    title: "@ID 링크 공유 · 인사이트 수집",
    description:
      "주소 하나에 이력서와 챗봇이 모두 담깁니다. 방문자가 무엇을 물었고 무엇을 답하지 못했는지 대시보드에서 확인하세요.",
  },
];

const FAQ = [
  {
    q: "무료로 사용할 수 있나요?",
    a: "네, 이력서 작성부터 AI 챗봇 발행까지 모든 핵심 기능을 무료로 이용하며 나만의 올인원 프로필을 만들 수 있습니다.",
  },
  {
    q: "AI가 제 이력에 없는 내용을 지어내면 어쩌죠?",
    a: "오직 작성해주신 데이터만을 기반으로 답변하여 없는 사실은 지어내지 않습니다. AI가 대답하기 어려운 내용은 방문자가 '직접 문의'를 남기도록 자연스럽게 안내합니다.",
  },
  {
    q: "민감한 개인정보도 무분별하게 노출되나요?",
    a: "아닙니다. 전화번호나 정확한 생년월일 같은 민감 정보는 채팅에서 안전하게 비공개 처리됩니다. 노출하고 싶은 정보 항목은 대시보드에서 직접 켜고 끌 수 있습니다.",
  },
  {
    q: "개발자만 쓸 수 있는 서비스인가요?",
    a: "직군에 상관없이 누구나 유용하게 활용할 수 있습니다. 자신만의 경험과 프로젝트를 단순한 글을 넘어, 더 생동감 있게 보여주고 싶은 분들을 위해 만들어졌습니다.",
  },
];

/**
 * Product facts, not social proof. Invented user counts or testimonials would
 * be a lie, and the real numbers are too small to help this early — these are
 * verifiable from the builder itself.
 */
const PROOF = [
  {
    value: `${RESUME_BUILDER_STEPS.length}개 섹션`,
    label: "경력·프로젝트·포트폴리오까지 한 번에",
  },
  {
    // Mirrors `faqsStepSchema`'s `.max(20)` in lib/resume/schema.ts.
    value: "예상 질문 20개",
    label: "미리 답을 적어두면 그대로 답변합니다",
  },
  { value: "3분", label: "가입부터 링크 발행까지 · 무료" },
];

export default async function Home() {
  const nav = await getNavContext();
  const exampleHref = getPublicProfilePath(EXAMPLE_PROFILE_SLUG);
  const primaryCtaHref = nav.isAuthenticated ? "/dashboard" : "/signup";
  const primaryCtaLabel = nav.isAuthenticated
    ? "대시보드"
    : "3분 만에 내 AI 이력서 만들기";

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
              1인칭으로 답하는 AI 클론 이력서
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:leading-[1.05]">
              대화하는 AI 이력서,
              <br className="hidden sm:inline" /> 나 대신 답합니다
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              이력서와 포트폴리오를 한 곳에 모으면, 내 경력을 근거로 1인칭으로
              답하는 챗봇이 만들어집니다. 면접관은 문서를 끝까지 읽지 않아도
              궁금한 걸 바로 물어볼 수 있습니다.
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
                @{EXAMPLE_PROFILE_SLUG} 예시 보기
              </Link>
            </div>
          </div>

          <HeroChatDemo />
        </Container>
      </section>

      {/* Product facts */}
      <section className="border-b py-10">
        <Container>
          <dl className="grid gap-4 sm:grid-cols-3">
            {PROOF.map((item, index) => (
              <Reveal key={item.value} delayMs={index * 60}>
                <div className="rounded-xl border bg-card p-5 text-center sm:text-left">
                  <dt className="text-2xl font-semibold">{item.value}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {item.label}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* How it works */}
      <section className="border-b py-16 lg:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="간편하고 스마트한 과정"
            title="세 가지가 하나로 합쳐지는 3단계"
            description="복잡한 과정 없이 나의 가치를 가장 잘 보여줄 수 있는 프로필을 완성해 보세요."
          />
          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Connector rail — decorative, desktop only. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[16%] top-11 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
            />
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delayMs={index * 80}>
                <Card className="relative h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-4 ring-background">
                      <step.icon className="size-5" />
                    </span>
                    <CardTitle className="mt-3 flex items-center gap-2 text-lg">
                      <span className="text-sm font-normal text-muted-foreground tabular-nums">
                        0{index + 1}
                      </span>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Example */}
      <section className="border-b py-16 lg:py-20">
        <Container>
          <div className="rounded-3xl border bg-muted/30 p-8 text-center sm:p-12">
            <SectionHeading
              title="생동감 있는 이력서를 직접 만나보세요"
              description="가상의 사용자 '김개발'의 프로필에서 직접 체험해 보세요. 챗봇과 대화하며 동적인 이력서의 매력을 느낄 수 있습니다."
            />
            <Link
              href={exampleHref}
              className={buttonVariants({ size: "lg", className: "mt-6" })}
            >
              @{EXAMPLE_PROFILE_SLUG} 챗봇과 대화하기
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
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
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
              나를 알려주는 AI 프로필을 경험해보세요
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
              가입하고 이력서를 채우면 바로 발행됩니다. 카드 등록 없이 무료로
              시작하세요.
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
