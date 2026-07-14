"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Plus, XCircle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { PROFILE_LABEL_MAX_LENGTH } from "@/lib/profile/display";
import { SLUG_DEBOUNCE_MS } from "@/lib/slug/constants";
import { normalizeSlugInput, validateSlugFormat } from "@/lib/slug/validation";

interface SlugCheckResponse {
  available: boolean;
  message: string;
  suggestions?: string[];
}

interface CreateProfileDialogProps {
  onCreated: (profileId: string) => void;
}

export function CreateProfileDialog({ onCreated }: CreateProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
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
    if (!open || !debouncedSlug || !formatResult?.valid) {
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
  }, [open, debouncedSlug, formatResult]);

  const isChecking = Boolean(
    debouncedSlug && formatResult?.valid && fetchState?.slug !== debouncedSlug,
  );

  const apiResult =
    fetchState?.slug === debouncedSlug ? fetchState.result : null;

  const canSubmit = Boolean(
    debouncedSlug && formatResult?.valid && !isChecking && apiResult?.available,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: debouncedSlug,
          label: label.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        profile?: { id: string };
      } | null;

      if (!response.ok || !payload?.profile?.id) {
        throw new Error(payload?.error ?? "프로필 생성에 실패했습니다.");
      }

      setOpen(false);
      setSlug("");
      setLabel("");
      setFetchState(null);
      onCreated(payload.profile.id);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "프로필 생성에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Plus className="size-4" />
            프로필 추가
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 프로필 만들기</DialogTitle>
          <DialogDescription>
            계정당 최대 3개까지 프로필을 만들 수 있습니다. 고유 슬러그를
            설정하세요.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="new-profile-slug" className="text-sm font-medium">
              고유 ID
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">@</span>
              <Input
                id="new-profile-slug"
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
              debouncedSlug={debouncedSlug}
              formatResult={formatResult}
              isChecking={isChecking}
              apiResult={apiResult}
              onSelectSuggestion={setSlug}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="new-profile-label" className="text-sm font-medium">
              프로필 라벨 <span className="text-muted-foreground">(선택)</span>
            </label>
            <Input
              id="new-profile-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="예: 프론트엔드 지원용"
              maxLength={PROFILE_LABEL_MAX_LENGTH}
              autoComplete="off"
            />
            <p className="text-sm text-muted-foreground">
              대시보드에서 프로필을 구분할 이름입니다.
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !canSubmit}
          >
            {submitting ? "생성 중..." : "프로필 만들기"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SlugStatus({
  debouncedSlug,
  formatResult,
  isChecking,
  apiResult,
  onSelectSuggestion,
}: {
  debouncedSlug: string;
  formatResult: ReturnType<typeof validateSlugFormat> | null;
  isChecking: boolean;
  apiResult: SlugCheckResponse | null;
  onSelectSuggestion: (slug: string) => void;
}) {
  if (!debouncedSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        영문 소문자, 숫자, 하이픈 3~20자
      </p>
    );
  }

  if (formatResult && !formatResult.valid) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="size-4" />
        <span>{formatResult.message}</span>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>중복 확인 중...</span>
      </div>
    );
  }

  if (!apiResult) {
    return null;
  }

  const icon = apiResult.available ? (
    <CheckCircle2 className="size-4 text-green-600" />
  ) : (
    <XCircle className="size-4 text-destructive" />
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span
          className={
            apiResult.available ? "text-green-700" : "text-destructive"
          }
        >
          {apiResult.message}
        </span>
      </div>
      {apiResult.suggestions && apiResult.suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {apiResult.suggestions.map((suggestion) => (
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
