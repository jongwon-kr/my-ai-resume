"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AiUsageSummary } from "@/lib/dashboard/ai-usage";
import { cn } from "@/lib/utils";

interface AiUsageCardProps {
  usage: AiUsageSummary;
}

function formatCount(value: number) {
  return value.toLocaleString("ko-KR");
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Fill and track come from one ramp so the state reads across the whole bar. */
function severityClasses(ratio: number) {
  if (ratio >= 0.9) {
    return { fill: "bg-destructive", track: "bg-destructive/15" };
  }
  if (ratio >= 0.7) {
    return { fill: "bg-amber-500", track: "bg-amber-500/15" };
  }
  return { fill: "bg-primary", track: "bg-primary/15" };
}

function Meter({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const ratio = max > 0 ? Math.min(used / max, 1) : 0;
  const { fill, track } = severityClasses(ratio);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm">{label}</span>
        {/* The numbers carry the state; color only reinforces it. */}
        <span className="text-sm text-muted-foreground">
          {formatCount(used)} / {formatCount(max)}
        </span>
      </div>
      <div
        className={cn("h-2 overflow-hidden rounded-full", track)}
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width]", fill)}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

export function AiUsageCard({ usage }: AiUsageCardProps) {
  const { measured, estimated } = usage;
  const totalInput = measured.inputTokens + estimated.inputTokens;
  const totalOutput = measured.outputTokens + estimated.outputTokens;
  const hasEstimate = estimated.turns > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI 사용량</CardTitle>
        <CardDescription>
          Gemini 호출량과 남은 한도입니다. 모의 면접·미리보기도 함께 집계됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="오늘 Gemini 호출"
            value={
              usage.callsToday === null
                ? "측정 불가"
                : formatCount(usage.callsToday)
            }
            hint={
              usage.callsToday === null
                ? "Redis가 설정되지 않았습니다"
                : "답변·꼬리질문·검색 호출 합계"
            }
          />
          <StatTile
            label={`최근 ${usage.windowDays}일 입력 토큰`}
            value={formatCount(totalInput)}
            hint={`${formatCount(measured.turns + estimated.turns)}회 응답`}
          />
          <StatTile
            label={`최근 ${usage.windowDays}일 출력 토큰`}
            value={formatCount(totalOutput)}
          />
        </div>

        {hasEstimate ? (
          <p className="text-xs text-muted-foreground">
            이 중 {formatCount(estimated.turns)}회는 토큰 기록 이전의 대화라
            글자 수 기반 추정치입니다. 실측은 {formatCount(measured.turns)}회.
          </p>
        ) : null}

        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">내 모의 면접·미리보기 한도</p>
          {usage.ownerQuota ? (
            <>
              <Meter
                label="분당"
                used={usage.ownerQuota.minuteUsed}
                max={usage.ownerQuota.minuteMax}
              />
              <Meter
                label="오늘"
                used={usage.ownerQuota.dayUsed}
                max={usage.ownerQuota.dayMax}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              한도 상태를 읽을 수 없습니다. Redis 설정을 확인해 주세요.
            </p>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium">방문자 한도</p>
          <p className="mt-1 text-sm text-muted-foreground">
            방문자 1명당 분당 {usage.visitorPolicy.perMinute}회 · 하루{" "}
            {usage.visitorPolicy.perDay}회. 방문자별로 따로 세기 때문에 전체
            소비량은 합산되지 않습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
