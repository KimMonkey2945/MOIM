import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getEventById } from "@/lib/mock/events";
import { getDisplayName } from "@/lib/mock/profiles";
import { countRsvpByEvent } from "@/lib/mock/participants";
import { EventTabNav } from "@/components/nav/event-tab-nav";

// 동적 mock 조회는 별도 async 컴포넌트로 분리해 Suspense로 감싼다
// (cacheComponents 환경 패턴). 존재하지 않는 eventId는 notFound()로 404 처리.
async function EventDetail({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = getEventById(eventId);

  if (!event) {
    notFound();
  }

  const counts = countRsvpByEvent(event.id);

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          {event.status === "cancelled" && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              취소됨
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          주최: {getDisplayName(event.host_id)} · {event.category} ·{" "}
          {event.location}
        </p>
        <p className="text-sm text-muted-foreground">
          참석 {counts.going} · 미정 {counts.maybe} · 불참 {counts.not_going}
        </p>
      </div>

      <EventTabNav eventId={event.id} />
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}
    >
      <EventDetail params={params} />
    </Suspense>
  );
}
