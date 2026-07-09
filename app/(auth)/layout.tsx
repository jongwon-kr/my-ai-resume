import { AppShell } from "@/components/layout/app-shell";
import { SiteHeader } from "@/components/layout/site-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell header={<SiteHeader variant="minimal" />}>{children}</AppShell>
  );
}
