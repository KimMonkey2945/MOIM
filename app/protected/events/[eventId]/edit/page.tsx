import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getEventById } from "@/lib/mock/events";
import { EventForm } from "@/components/event/event-form";

// 이벤트 수정 (주최자 전용, PRD 6.1). mock 조회 후 EventForm을 edit 모드로 프리필한다.
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

  return <EventForm mode="edit" initialEvent={event} />;
}

export default function EventEditPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <EventEdit params={params} />
      </Suspense>
    </div>
  );
}
