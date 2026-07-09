import { AppShell } from "@/components/layout/app-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getNavContext } from "@/lib/layout/nav-context";

export default async function AppAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getNavContext();

  return (
    <AppShell
      header={
        <SiteHeader
          variant="full"
          isAuthenticated={nav.isAuthenticated}
          profile={nav.profile}
        />
      }
      footer={<SiteFooter isAuthenticated={nav.isAuthenticated} />}
    >
      {children}
    </AppShell>
  );
}
