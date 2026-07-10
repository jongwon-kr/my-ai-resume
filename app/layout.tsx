import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 마케팅 페이지의 히어로 섹션 카피와 일치하도록 메타데이터 수정
export const metadata: Metadata = {
  title: "CloneCV",
  description:
    "흩어져 있던 이력서와 포트폴리오를 한 곳에 모으고 나를 대변하는 AI 챗봇을 더했습니다. 링크 하나로 생동감 있는 경험을 선사하세요.",
  icons: {
    icon: "/clone_cv.png",
    shortcut: "/clone_cv.png",
    apple: "/clone_cv.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
