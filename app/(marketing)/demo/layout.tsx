import { DemoPreviewBanner } from "@/components/example/demo-preview-banner";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DemoPreviewBanner />
      {children}
    </>
  );
}
