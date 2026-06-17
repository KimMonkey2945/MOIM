import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getEventById } from "@/lib/mock/events";

// 정산 탭 (PRD 6.2). 현재는 빈 껍데기.
// 비용 항목·분배·송금 체크 등은 Phase 4 Task에서 구현한다(expenses mock 포함).
async function ExpenseList({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = getEventById(eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">정산</h1>
      <p className="text-sm text-muted-foreground">
        &ldquo;{event.title}&rdquo;의 정산 내역입니다. (추후 구현)
      </p>
    </div>
  );
}

export default function ExpensesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}
    >
      <ExpenseList params={params} />
    </Suspense>
  );
}
