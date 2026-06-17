import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pin } from "lucide-react";

import { getEventById } from "@/lib/mock/events";
import { getAnnouncementById } from "@/lib/mock/announcements";
import { listCommentsByAnnouncement } from "@/lib/mock/comments";
import { getDisplayName, MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";
import { formatEventDate } from "@/lib/event-display";
import { CommentThread } from "@/components/announcement/comment-thread";

// 공지 상세 + 댓글 스레드 (PRD 6.1). server에서 mock 로드 + isHost 계산 후
// 댓글 인터랙션은 client(CommentThread)에 위임한다.
async function AnnouncementDetail({
  params,
}: {
  params: Promise<{ eventId: string; annoId: string }>;
}) {
  const { eventId, annoId } = await params;
  const announcement = getAnnouncementById(annoId);

  // 공지가 없거나 URL의 eventId에 속하지 않으면 404(경로 위변조 방어).
  if (!announcement || announcement.event_id !== eventId) {
    notFound();
  }

  const event = getEventById(eventId);
  const comments = listCommentsByAnnouncement(announcement.id);
  // 주최자 판별 — Phase 3에서 getClaims().sub === event.host_id로 교체.
  const isHost = event?.host_id === MOCK_CURRENT_USER_ID;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">공지 상세</h1>
      <div className="rounded-2xl border p-5">
        <p className="whitespace-pre-wrap text-base">{announcement.content}</p>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <span>{getDisplayName(announcement.author_id)}</span>
          <span>·</span>
          <span>{formatEventDate(announcement.created_at)}</span>
          {announcement.is_pinned && (
            <>
              <span>·</span>
              <Pin className="h-3.5 w-3.5 text-primary" aria-label="고정됨" />
              <span>고정됨</span>
            </>
          )}
        </p>
      </div>

      <CommentThread
        announcementId={announcement.id}
        initialComments={comments}
        isHost={isHost}
      />
    </div>
  );
}

export default function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; annoId: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}
    >
      <AnnouncementDetail params={params} />
    </Suspense>
  );
}
