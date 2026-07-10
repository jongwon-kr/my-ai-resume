import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { OnboardingSlugFormDemo } from "@/components/onboarding/onboarding-slug-form-demo";

export default function DemoOnboardingPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center p-6">
      <PageBreadcrumb
        items={[{ label: "홈", href: "/" }, { label: "온보딩 (예시)" }]}
      />
      <OnboardingSlugFormDemo />
    </div>
  );
}
