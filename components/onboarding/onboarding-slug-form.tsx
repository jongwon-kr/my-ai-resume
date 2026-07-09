"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { SLUG_DEBOUNCE_MS } from "@/lib/slug/constants";
import { normalizeSlugInput, validateSlugFormat } from "@/lib/slug/validation";
import { createClient } from "@/lib/supabase/client";

interface SlugCheckResponse {
  available: boolean;
  message: string;
  suggestions?: string[];
}

export function OnboardingSlugForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [fetchState, setFetchState] = useState<{
    slug: string;
    result: SlugCheckResponse;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSlug = useDebouncedValue(
    normalizeSlugInput(slug),
    SLUG_DEBOUNCE_MS,
  );

  const formatResult = useMemo(
    () => (debouncedSlug ? validateSlugFormat(debouncedSlug) : null),
    [debouncedSlug],
  );

  useEffect(() => {
    if (!debouncedSlug || !formatResult?.valid) {
      return;
    }

    let cancelled = false;

    fetch(`/api/slug/check?slug=${encodeURIComponent(debouncedSlug)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("슬러그 확인에 실패했습니다.");
        }
        return response.json() as Promise<SlugCheckResponse>;
      })
      .then((result) => {
        if (!cancelled) {
          setFetchState({ slug: debouncedSlug, result });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchState({
            slug: debouncedSlug,
            result: {
              available: false,
              message: "슬러그 확인에 실패했습니다.",
              suggestions: [],
            },
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSlug, formatResult]);

  const isChecking = Boolean(
    debouncedSlug && formatResult?.valid && fetchState?.slug !== debouncedSlug,
  );

  const apiResult =
    fetchState?.slug === debouncedSlug ? fetchState.result : null;

  const status = useMemo(() => {
    if (!debouncedSlug) {
      return {
        state: "idle" as const,
        message: "영문 소문자, 숫자, 하이픈 3~20자",
        suggestions: [] as string[],
        canSubmit: false,
      };
    }

    if (formatResult && !formatResult.valid) {
      return {
        state: "invalid" as const,
        message: formatResult.message,
        suggestions: [],
        canSubmit: false,
      };
    }

    if (isChecking) {
      return {
        state: "checking" as const,
        message: "중복 확인 중...",
        suggestions: [] as string[],
        canSubmit: false,
      };
    }

    if (apiResult) {
      return {
        state: apiResult.available
          ? ("available" as const)
          : ("unavailable" as const),
        message: apiResult.message,
        suggestions: apiResult.suggestions ?? [],
        canSubmit: apiResult.available,
      };
    }

    return {
      state: "idle" as const,
      message: "슬러그를 확인하는 중입니다.",
      suggestions: [] as string[],
      canSubmit: false,
    };
  }, [debouncedSlug, formatResult, isChecking, apiResult]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!status.canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 필요합니다.");
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ slug: debouncedSlug })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard/edit");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 슬러그 설정</CardTitle>
        <CardDescription>
          공개 URL은 clonecv.com/@슬러그 형태로 제공됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <SlugStatus
              state={status.state}
              message={status.message}
              suggestions={status.suggestions}
              onSelectSuggestion={setSlug}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !status.canSubmit}
          >
            {submitting ? "저장 중..." : "다음"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SlugStatus({
  state,
  message,
  suggestions,
  onSelectSuggestion,
}: {
  state: "idle" | "checking" | "available" | "unavailable" | "invalid";
  message: string;
  suggestions: string[];
  onSelectSuggestion: (slug: string) => void;
}) {
  const icon =
    state === "checking" ? (
      <Loader2 className="size-4 animate-spin text-muted-foreground" />
    ) : state === "available" ? (
      <CheckCircle2 className="size-4 text-green-600" />
    ) : state === "idle" ? null : (
      <XCircle className="size-4 text-destructive" />
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span
          className={
            state === "available"
              ? "text-green-700"
              : state === "checking" || state === "idle"
                ? "text-muted-foreground"
                : "text-destructive"
          }
        >
          {message}
        </span>
      </div>
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              @{suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
