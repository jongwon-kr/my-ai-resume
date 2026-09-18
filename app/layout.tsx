import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Sans_KR,
  Nanum_Myeongjo,
} from "next/font/google";
import localFont from "next/font/local";

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

/**
 * Profile theme fonts.
 *
 * Pretendard is not on Google Fonts, so it loads from the npm package's woff2 —
 * no binaries in the repo. The other two cover the serif and alternate-sans
 * presets. All three carry Korean glyphs, unlike Geist (`subsets: ["latin"]`),
 * which is why Pretendard is now the app-wide default.
 */
const pretendard = localFont({
  variable: "--font-pretendard",
  display: "swap",
  src: [
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

const plexSansKr = IBM_Plex_Sans_KR({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--font-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
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
      className={`${pretendard.variable} ${plexSansKr.variable} ${nanumMyeongjo.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
