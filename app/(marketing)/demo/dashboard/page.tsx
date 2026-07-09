import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { getExampleDashboardData } from "@/lib/example/demo-profile";

const DEMO_TABS = ["profile", "logs", "inquiries", "stats"] as const;
type DemoTab = (typeof DEMO_TABS)[number];

function resolveDemoTab(tab: string | undefined): DemoTab {
  if (tab && DEMO_TABS.includes(tab as DemoTab)) {
    return tab as DemoTab;
  }

  return "profile";
}

export default async function DemoDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const defaultTab = resolveDemoTab(tab);
  const data = getExampleDashboardData();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 p-6">
      <PageBreadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "대시보드 (예시)" },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-muted-foreground">
          프로필 관리, 방문자 대화, 통계를 확인하세요.
        </p>
      </div>

      <DashboardTabs data={data} demoMode defaultTab={defaultTab} />
    </div>
  );
}
