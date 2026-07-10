"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardInquiry } from "@/lib/dashboard/types";

interface InquiriesTabProps {
  inquiries: DashboardInquiry[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function InquiriesTab({ inquiries }: InquiriesTabProps) {
  if (inquiries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>받은 질문</CardTitle>
          <CardDescription>
            AI가 답변하기 어려운 질문이 방문자에게 전달되면 여기에 표시됩니다.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>받은 질문</CardTitle>
        <CardDescription>방문자 직접 문의 {inquiries.length}건</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {inquiry.visitor_name ?? "이름 없음"} · {inquiry.visitor_email}
              </span>
              <span>{formatDate(inquiry.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {inquiry.question}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
