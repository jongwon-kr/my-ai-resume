import Link from "next/link";

import { Container } from "@/components/marketing/section";

interface SiteFooterProps {
  isAuthenticated?: boolean;
}

export function SiteFooter({ isAuthenticated = false }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t py-8">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} CloneCV</span>
        <p className="text-center sm:text-right">
          AI 클론이며 참고용입니다. 실제 채용 결정과는 무관합니다.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground">
            홈
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard" className="hover:text-foreground">
              대시보드
            </Link>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
