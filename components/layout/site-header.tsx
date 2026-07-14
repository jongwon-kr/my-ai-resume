"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import type { NavProfile } from "@/lib/layout/nav-context";
import { cn } from "@/lib/utils";

export type SiteHeaderVariant = "full" | "minimal" | "public-profile";

interface SiteHeaderProps {
  variant?: SiteHeaderVariant;
  isAuthenticated?: boolean;
  profile?: NavProfile | null;
  isProfileOwner?: boolean;
}

function navLinkClass(isActive: boolean) {
  return cn(
    buttonVariants({ variant: "ghost", size: "sm" }),
    isActive && "bg-muted text-foreground",
  );
}

export function SiteHeader({
  variant = "full",
  isAuthenticated = false,
  isProfileOwner = false,
}: SiteHeaderProps) {
  const pathname = usePathname();

  if (variant === "minimal") {
    return (
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Image
              src="/clone_cv.png"
              alt="CloneCV Logo"
              width={32}
              height={32}
            />
          </Link>
        </div>
      </header>
    );
  }

  if (variant === "public-profile") {
    return (
      <header className="shrink-0 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <Image
              src="/clone_cv.png"
              alt="CloneCV Logo"
              width={32}
              height={32}
            />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isProfileOwner ? (
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                내 대시보드
              </Link>
            ) : null}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Image
            src="/clone_cv.png"
            alt="CloneCV Logo"
            width={32}
            height={32}
          />
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={navLinkClass(pathname === "/dashboard")}
              >
                대시보드
              </Link>
              <LogoutButton variant="ghost" size="sm" className="h-8 px-3" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={navLinkClass(
                  pathname === "/login" ||
                    pathname.startsWith("/forgot-password"),
                )}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  pathname === "/signup" && "ring-2 ring-primary/30",
                )}
              >
                가입하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
