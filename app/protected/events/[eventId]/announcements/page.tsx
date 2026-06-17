import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getEventById } from "@/lib/mock/events";
import { listAnnouncementsByEvent } from "@/lib/mock/announcements";
import { MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";
import { AnnouncementFeed } from "@/components/announcement/announcement-feed";

// 공지 탭 (PRD 6.2). server에서 mock 로드 + isHost 계산 후 client 피드에 위임한다.
async function AnnouncementList({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = getEventById(eventId);

  if (!event) {
    notFound();
  }

  const announcements = listAnnouncementsByEvent(event.id);
  // 주최자 판별 — Phase 3에서 getClaims().sub === event.host_id로 교체.
  const isHost = event.host_id === MOCK_CURRENT_USER_ID;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">공지</h1>
        <p className="text-sm text-muted-foreground">
          &ldquo;{event.title}&rdquo;의 공지 피드입니다.
        </p>
      </div>
      <AnnouncementFeed
        eventId={event.id}
        initialAnnouncements={announcements}
        isHost={isHost}
      />
    </div>
  );
}

export default function AnnouncementsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}
    >
      <AnnouncementList params={params} />
    </Suspense>
  );
}
