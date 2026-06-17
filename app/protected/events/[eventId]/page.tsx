import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, MapPin, User } from "lucide-react";

import { getEventById } from "@/lib/mock/events";
import { getDisplayName, MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";
import { listParticipantsByEvent } from "@/lib/mock/participants";
import {
  categoryGradients,
  categoryStyles,
  formatEventDate,
} from "@/lib/event-display";
import { cn } from "@/lib/utils";
import { EventTabNav } from "@/components/nav/event-tab-nav";
import { AvatarStack } from "@/components/event/avatar-stack";
import { ParticipantList } from "@/components/event/participant-list";
import { RsvpControl } from "@/components/event/rsvp-control";

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

  const participants = listParticipantsByEvent(event.id);
  const goingUserIds = participants
    .filter((p) => p.rsvp_status === "going")
    .map((p) => p.user_id);
  const myRsvp = participants.find(
    (p) => p.user_id === MOCK_CURRENT_USER_ID,
  )?.rsvp_status;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* 히어로 배너 — 썸네일 없으면 카테고리 그라데이션 */}
      <div
        className={cn(
          "relative flex h-40 items-end overflow-hidden rounded-2xl bg-gradient-to-br p-5 sm:h-52",
          categoryGradients[event.category],
        )}
      >
        {event.thumbnail_url && (
          // 외부 임의 URL이라 next/image 도메인 설정을 피해 img 사용
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.thumbnail_url}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="relative flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              categoryStyles[event.category],
            )}
          >
            {event.category}
          </span>
          {event.status === "cancelled" && (
            <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
              취소됨
            </span>
          )}
        </div>
      </div>

      {/* 이벤트 정보 */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        <dl className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatEventDate(event.event_at)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            주최: {getDisplayName(event.host_id)}
          </div>
        </dl>
        <AvatarStack userIds={goingUserIds} size="lg" />
      </div>

      {/* RSVP 컨트롤 (취소된 이벤트는 비노출) */}
      {event.status === "active" && <RsvpControl initialStatus={myRsvp} />}

      {/* 탭 내비 (공지/카풀/정산/수정) */}
      <EventTabNav eventId={event.id} />

      {/* 참여자 목록 + 상태별 필터 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">참여자</h2>
        <ParticipantList participants={participants} />
      </section>
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
