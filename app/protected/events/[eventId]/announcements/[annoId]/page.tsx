import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pin } from "lucide-react";

import { getAnnouncementById } from "@/lib/mock/announcements";
import { listCommentsByAnnouncement } from "@/lib/mock/comments";
import { getDisplayName } from "@/lib/mock/profiles";

// 공지 상세 + 댓글 스레드 (PRD 6.1). mock 공지/댓글을 표시한다.
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

  const comments = listCommentsByAnnouncement(announcement.id);

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">공지 상세</h1>
      <div className="rounded-2xl border p-5">
        <p className="text-base">{announcement.content}</p>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <span>{getDisplayName(announcement.author_id)}</span>
          {announcement.is_pinned && (
            <>
              <span>·</span>
              <Pin className="h-3.5 w-3.5 text-primary" aria-label="고정됨" />
              <span>고정됨</span>
            </>
          )}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">댓글 {comments.length}</h2>
        <ul className="flex flex-col gap-2">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-md border p-3 text-sm">
              <span className="font-semibold">
                {getDisplayName(comment.author_id)}
              </span>
              <span className="text-muted-foreground"> · </span>
              {comment.content}
            </li>
          ))}
        </ul>
      </section>
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
