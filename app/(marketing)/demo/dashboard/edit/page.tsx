import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { ResumeBuilderClient } from "@/components/resume-builder/resume-builder-client";
import {
  EXAMPLE_PROFILE_ID,
  EXAMPLE_PROFILE_SLUG,
  getExampleResumeFormValues,
} from "@/lib/example/demo-profile";

export default function DemoDashboardEditPage() {
  const initialValues = getExampleResumeFormValues();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 p-6">
      <PageBreadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "대시보드 (예시)", href: "/demo/dashboard" },
          { label: "프로필 편집" },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">프로필 편집</h1>
        <p className="text-muted-foreground">
          섹션별로 이력서 정보를 입력하고 발행하세요.
        </p>
      </div>

      <ResumeBuilderClient
        profileId={EXAMPLE_PROFILE_ID}
        slug={EXAMPLE_PROFILE_SLUG}
        initialValues={initialValues}
        demoMode
      />
    </div>
  );
}
