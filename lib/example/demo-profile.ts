import { buildSystemPrompt, type SystemPromptInput } from "@/lib/prompt/build-system-prompt";
import {
  buildSuggestedQuestions,
  buildWelcomeMessage,
} from "@/lib/public-profile/suggested-questions";
import type { PublicProfileData } from "@/lib/public-profile/types";
import { DEFAULT_SECTION_ORDER } from "@/lib/resume/schema";

/** Public slug for the fictional demo profile (not a real user). */
export const EXAMPLE_PROFILE_SLUG = "kimdev";

/** Stable UUID for the in-app demo profile (not stored in DB). */
export const EXAMPLE_PROFILE_ID = "00000000-0000-4000-8000-000000000001";

export function isExampleProfileSlug(slug: string) {
  return slug === EXAMPLE_PROFILE_SLUG;
}

export function isExampleProfileId(profileId: string) {
  return profileId === EXAMPLE_PROFILE_ID;
}

const EXAMPLE_OWNER_FAQS = [
  {
    question: "왜 프론트엔드 개발자가 되었나요?",
    answer:
      "화면을 직접 만들며 사용자 반응을 확인하는 과정이 가장 재미있어서 프론트엔드 개발자가 되었습니다.",
    match_mode: "semantic" as const,
    sort_order: 0,
  },
  {
    question: "협업할 때 가장 중요하게 생각하는 점은?",
    answer:
      "요구사항을 문서로 남기고, 작은 단위로 자주 공유하는 것을 가장 중요하게 생각합니다.",
    match_mode: "semantic" as const,
    sort_order: 1,
  },
];

function buildExamplePromptInput(): SystemPromptInput {
  return {
    profile: {
      name: "김개발",
      role_title: "프론트엔드 개발자",
      intro: "React와 TypeScript로 B2B SaaS 제품을 3년간 개발했습니다.",
      birth_year: 1996,
      location: "서울",
      public_email: "kimdev@example.com",
      phone: null,
    },
    profileLinks: [
      {
        label: "GitHub",
        url: "https://github.com/example/kimdev",
        sort_order: 0,
      },
      {
        label: "기술 블로그",
        url: "https://example.com/kimdev-blog",
        sort_order: 1,
      },
    ],
    skills: [
      { name: "TypeScript", proficiency: "고급" },
      { name: "React", proficiency: "고급" },
      { name: "Next.js", proficiency: "중급" },
    ],
    projects: [
      {
        title: "실시간 대시보드 리뉴얼",
        period: "2024.03 - 2024.11",
        role: "프론트엔드 리드",
        tech_stack: "Next.js, React Query, Recharts",
        situation:
          "레거시 jQuery 대시보드의 느린 렌더링과 유지보수 비용이 문제였습니다.",
        actions:
          "컴포넌트 단위로 점진적 마이그레이션하고, 서버 상태 캐싱 전략을 설계했습니다.",
        results: "초기 로딩 3.2초 → 1.1초, 월간 CS 문의 18% 감소",
        troubleshooting:
          "대용량 테이블 스크롤 버벅임 → 가상 스크롤과 메모이제이션으로 해결",
        sort_order: 0,
      },
      {
        title: "온보딩 플로우 개선",
        period: "2023.06 - 2023.12",
        role: "프론트엔드 개발",
        tech_stack: "React, Zustand, Storybook",
        situation: "신규 사용자의 첫 주 이탈률이 높았습니다.",
        actions:
          "단계별 온보딩 UI를 재설계하고 A/B 테스트를 반복했습니다.",
        results: "첫 주 활성 사용자 비율 12%p 상승",
        troubleshooting:
          "폼 상태 꼬임 이슈 → 단방향 데이터 흐름으로 단순화",
        sort_order: 1,
      },
    ],
    careers: [
      {
        company: "스마트웍스",
        position: "프론트엔드 개발자",
        period: "2022.03 - 현재",
        description:
          "B2B 협업 SaaS의 핵심 화면 개발, 디자인 시스템 도입, 성능 개선",
        sort_order: 0,
      },
      {
        company: "네오소프트",
        position: "주니어 프론트엔드 개발자",
        period: "2020.07 - 2022.02",
        description: "사내 어드민 도구와 마케팅 랜딩 페이지 유지보수",
        sort_order: 1,
      },
    ],
    education: [
      {
        school: "한빛대학교",
        major: "컴퓨터공학",
        degree: "학사",
        status: "졸업",
        period: "2015.03 - 2020.02",
        sort_order: 0,
      },
    ],
    certifications: [
      {
        category: "자격",
        name: "정보처리기사",
        issuer: "한국산업인력공단",
        acquired_date: "2020.11",
        sort_order: 0,
      },
      {
        category: "어학",
        name: "OPIC IH",
        issuer: "ACTFL",
        acquired_date: "2021.08",
        sort_order: 1,
      },
    ],
    activities: [
      {
        title: "프론트엔드 스터디 운영",
        organization: "서울 개발 모임",
        period: "2023.01 - 2024.06",
        description: "주 1회 React 패턴과 성능 최적화 사례 공유",
        sort_order: 0,
      },
    ],
    coverLetters: [
      {
        title: "지원 동기",
        content:
          "사용자 경험을 데이터로 검증하고 개선하는 일에 보람을 느껴 지원했습니다. 빠르게 배우고 팀과 투명하게 소통하는 개발자가 되겠습니다.",
        sort_order: 0,
      },
    ],
    ownerFaqs: EXAMPLE_OWNER_FAQS.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order,
      match_mode: faq.match_mode,
    })),
    enabledSections: [
      "careers",
      "education",
      "certifications",
      "activities",
      "cover_letters",
      "owner_faqs",
    ],
  };
}

export function getExampleSystemInstruction() {
  return buildSystemPrompt(buildExamplePromptInput());
}

export function getExampleOwnerFaqs() {
  return EXAMPLE_OWNER_FAQS;
}

export function getExamplePublicProfileData(): PublicProfileData {
  const careers = [
    {
      id: "ex-career-1",
      company: "스마트웍스",
      position: "프론트엔드 개발자",
      period: "2022.03 - 현재",
      description:
        "B2B 협업 SaaS의 핵심 화면 개발, 디자인 시스템 도입, 성능 개선",
      sort_order: 0,
    },
    {
      id: "ex-career-2",
      company: "네오소프트",
      position: "주니어 프론트엔드 개발자",
      period: "2020.07 - 2022.02",
      description: "사내 어드민 도구와 마케팅 랜딩 페이지 유지보수",
      sort_order: 1,
    },
  ];

  const projects = [
    {
      id: "ex-project-1",
      title: "실시간 대시보드 리뉴얼",
      period: "2024.03 - 2024.11",
      role: "프론트엔드 리드",
      tech_stack: "Next.js, React Query, Recharts",
      situation:
        "레거시 jQuery 대시보드의 느린 렌더링과 유지보수 비용이 문제였습니다.",
      actions:
        "컴포넌트 단위로 점진적 마이그레이션하고, 서버 상태 캐싱 전략을 설계했습니다.",
      results: "초기 로딩 3.2초 → 1.1초, 월간 CS 문의 18% 감소",
      troubleshooting:
        "대용량 테이블 스크롤 버벅임 → 가상 스크롤과 메모이제이션으로 해결",
      sort_order: 0,
    },
    {
      id: "ex-project-2",
      title: "온보딩 플로우 개선",
      period: "2023.06 - 2023.12",
      role: "프론트엔드 개발",
      tech_stack: "React, Zustand, Storybook",
      situation: "신규 사용자의 첫 주 이탈률이 높았습니다.",
      actions: "단계별 온보딩 UI를 재설계하고 A/B 테스트를 반복했습니다.",
      results: "첫 주 활성 사용자 비율 12%p 상승",
      troubleshooting: "폼 상태 꼬임 이슈 → 단방향 데이터 흐름으로 단순화",
      sort_order: 1,
    },
  ];

  const skills = [
    { id: "ex-skill-1", name: "TypeScript", proficiency: "고급" },
    { id: "ex-skill-2", name: "React", proficiency: "고급" },
    { id: "ex-skill-3", name: "Next.js", proficiency: "중급" },
    { id: "ex-skill-4", name: "Tailwind CSS", proficiency: "중급" },
  ];

  const coverLetters = [
    {
      id: "ex-cover-1",
      title: "지원 동기",
      content:
        "사용자 경험을 데이터로 검증하고 개선하는 일에 보람을 느껴 지원했습니다. 빠르게 배우고 팀과 투명하게 소통하는 개발자가 되겠습니다.",
      sort_order: 0,
    },
  ];

  const suggestedQuestions = buildSuggestedQuestions({
    name: "김개발",
    roleTitle: "프론트엔드 개발자",
    projects,
    careers,
    skills,
    coverLetters,
    ownerFaqQuestions: EXAMPLE_OWNER_FAQS.map((faq) => faq.question),
  });

  return {
    profile: {
      id: EXAMPLE_PROFILE_ID,
      slug: EXAMPLE_PROFILE_SLUG,
      name: "김개발",
      role_title: "프론트엔드 개발자",
      intro: "React와 TypeScript로 B2B SaaS 제품을 3년간 개발했습니다.",
      avatar_url: null,
      status: "published",
      is_private: false,
      birth_year: 1996,
      phone: null,
      public_email: "kimdev@example.com",
      location: "서울",
      show_phone: false,
      show_exact_age: false,
      suggest_top_questions_in_chat: false,
    },
    profileLinks: [
      {
        id: "ex-link-1",
        label: "GitHub",
        url: "https://github.com/example/kimdev",
        sort_order: 0,
      },
      {
        id: "ex-link-2",
        label: "기술 블로그",
        url: "https://example.com/kimdev-blog",
        sort_order: 1,
      },
    ],
    skills,
    projects,
    careers,
    education: [
      {
        id: "ex-edu-1",
        school: "한빛대학교",
        major: "컴퓨터공학",
        degree: "학사",
        status: "졸업",
        period: "2015.03 - 2020.02",
        sort_order: 0,
      },
    ],
    certifications: [
      {
        id: "ex-cert-1",
        category: "자격",
        name: "정보처리기사",
        issuer: "한국산업인력공단",
        acquired_date: "2020.11",
        sort_order: 0,
      },
      {
        id: "ex-cert-2",
        category: "어학",
        name: "OPIC IH",
        issuer: "ACTFL",
        acquired_date: "2021.08",
        sort_order: 1,
      },
    ],
    activities: [
      {
        id: "ex-act-1",
        title: "프론트엔드 스터디 운영",
        organization: "서울 개발 모임",
        period: "2023.01 - 2024.06",
        description: "주 1회 React 패턴과 성능 최적화 사례 공유",
        sort_order: 0,
      },
    ],
    coverLetters,
    enabledSections: [
      "careers",
      "education",
      "certifications",
      "activities",
      "cover_letters",
      "owner_faqs",
    ],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    suggestedQuestions,
    welcomeMessage: buildWelcomeMessage({ name: "김개발" }),
    ownerEmail: "kimdev@example.com",
  };
}
