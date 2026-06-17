import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getEventById } from "@/lib/mock/events";

// 카풀 탭 (PRD 6.2). 현재는 빈 껍데기.
// 운전자 카드·탑승 신청 등은 Phase 3 Task에서 구현한다(carpools mock 포함).
async function CarpoolList({
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
      <h1 className="text-3xl font-bold tracking-tight">카풀</h1>
      <p className="text-sm text-muted-foreground">
        &ldquo;{event.title}&rdquo;의 카풀 현황입니다. (추후 구현)
      </p>
    </div>
  );
}

export default function CarpoolsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}
    >
      <CarpoolList params={params} />
    </Suspense>
  );
}
