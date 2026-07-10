"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminReportRow } from "@/lib/admin/queries";
import { REPORT_REASONS } from "@/lib/reports/constants";
import { getPublicProfilePath } from "@/lib/site/url";
import { cn } from "@/lib/utils";

interface AdminReportsPanelProps {
  initialReports: AdminReportRow[];
}

function getReasonLabel(value: string | null) {
  return (
    REPORT_REASONS.find((item) => item.value === value)?.label ??
    value ??
    "미상"
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminReportsPanel({ initialReports }: AdminReportsPanelProps) {
  const [reports, setReports] = useState(initialReports);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function forcePrivate(profileId: string | null, reportId: string) {
    if (!profileId) {
      return;
    }

    setProcessingId(reportId);
    setError(null);

    try {
      const response = await fetch("/api/admin/profiles/force-private", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "비공개 처리에 실패했습니다.");
      }

      setReports((prev) =>
        prev.map((report) =>
          report.profile_id === profileId && report.profile
            ? {
                ...report,
                profile: { ...report.profile, is_private: true },
              }
            : report,
        ),
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "비공개 처리에 실패했습니다.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function resolveReport(reportId: string) {
    setProcessingId(reportId);
    setError(null);

    try {
      const response = await fetch("/api/admin/reports/resolve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        resolvedAt?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "신고 처리에 실패했습니다.");
      }

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "resolved",
                resolved_at: payload?.resolvedAt ?? new Date().toISOString(),
              }
            : report,
        ),
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "신고 처리에 실패했습니다.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {reports.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>신고 없음</CardTitle>
            <CardDescription>접수된 신고가 없습니다.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">
                  {report.profile
                    ? `${report.profile.name} (@${report.profile.slug})`
                    : "삭제된 프로필"}
                </CardTitle>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    report.status === "resolved"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800",
                  )}
                >
                  {report.status === "resolved" ? "처리 완료" : "대기 중"}
                </span>
              </div>
              <CardDescription>{formatDate(report.created_at)}</CardDescription>
              {report.resolved_at ? (
                <CardDescription>
                  처리일: {formatDate(report.resolved_at)}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                <span className="font-medium">사유:</span>{" "}
                {getReasonLabel(report.reason)}
              </p>
              {report.detail ? (
                <p className="text-sm text-muted-foreground">{report.detail}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {report.profile ? (
                  <Link
                    href={getPublicProfilePath(report.profile.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                    aria-label={`@${report.profile.slug} 프로필 열기`}
                  >
                    프로필 보기
                  </Link>
                ) : null}

                {report.profile_id &&
                report.profile &&
                !report.profile.is_private ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={processingId === report.id}
                    aria-label={`@${report.profile.slug} 강제 비공개 처리`}
                    onClick={() =>
                      void forcePrivate(report.profile_id, report.id)
                    }
                  >
                    {processingId === report.id ? "처리 중..." : "강제 비공개"}
                  </Button>
                ) : report.profile?.is_private ? (
                  <span className="text-xs text-muted-foreground">
                    이미 비공개 처리됨
                  </span>
                ) : null}

                {report.status === "pending" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={processingId === report.id}
                    aria-label="신고 처리 완료로 표시"
                    onClick={() => void resolveReport(report.id)}
                  >
                    {processingId === report.id ? "처리 중..." : "처리 완료"}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
