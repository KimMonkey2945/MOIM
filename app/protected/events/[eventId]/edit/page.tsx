import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getEventById } from "@/lib/mock/events";

// 이벤트 수정 (주최자 전용, PRD 6.1). 현재는 빈 껍데기.
// 실제 수정 폼은 Phase 1 Task에서 구현한다.
async function EventEdit({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = getEventById(eventId);

  if (!event) {
    notFound();
  }

  // ── Phase 3 wire-up 지점 ───────────────────────────────────────────────
  // 수정은 주최자 전용(PRD 9). getClaims().sub === event.host_id 검증 후
  // 불일치 시 redirect('/protected/events/${eventId}') 또는 notFound() 처리한다.
  // ──────────────────────────────────────────────────────────────────────

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">이벤트 수정</h1>
      <p className="text-sm text-muted-foreground">
        &ldquo;{event.title}&rdquo; 정보를 수정합니다. (폼은 추후 구현)
      </p>
    </div>
  );
}

export default function EventEditPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}
    >
      <EventEdit params={params} />
    </Suspense>
  );
}
