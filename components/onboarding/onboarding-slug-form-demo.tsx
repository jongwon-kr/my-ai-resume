"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeSlugInput } from "@/lib/slug/validation";

export function OnboardingSlugFormDemo() {
  const [slug, setSlug] = useState("frontend-kim");

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 슬러그 설정</CardTitle>
        <CardDescription>
          공개 URL은 clonecv.com/@슬러그 형태로 제공됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">
              고유 ID
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">@</span>
              <Input
                id="slug"
                value={slug}
                onChange={(event) =>
                  setSlug(normalizeSlugInput(event.target.value))
                }
                placeholder="my-slug"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="size-4 text-green-600" />
              <span>사용 가능한 슬러그입니다.</span>
            </div>
          </div>

          <Button type="button" className="w-full" disabled>
            프로필 편집 시작하기
          </Button>
          <Link
            href="/demo/dashboard/edit"
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            예시 프로필 편집 화면 보기
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
