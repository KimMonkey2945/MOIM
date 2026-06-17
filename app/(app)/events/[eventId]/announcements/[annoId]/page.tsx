import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { CommentWithAuthor } from "@/lib/types";
import { formatEventDate } from "@/lib/event-display";
import { CommentThread } from "@/components/announcement/comment-thread";

// 공지 상세 + 댓글 스레드 (PRD 6.1). server에서 공지·댓글·작성자 조회 + isHost 계산 후
// 댓글 인터랙션은 client(CommentThread)에 위임한다.
async function AnnouncementDetail({
  params,
}: {
  params: Promise<{ eventId: string; annoId: string }>;
}) {
  const { eventId, annoId } = await params;
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  const currentUserId = (claims?.claims?.sub as string | undefined) ?? null;

  const { data: announcement } = await supabase
    .from("announcements")
    .select(
      "*, author:profiles!announcements_author_id_fkey(id, display_name, avatar_url), event:events!announcements_event_id_fkey(host_id)",
    )
    .eq("id", annoId)
    .single();

  // 공지가 없거나(또는 RLS 차단) URL의 eventId에 속하지 않으면 404(경로 위변조 방어).
  if (!announcement || announcement.event_id !== eventId) {
    notFound();
  }

  const { data: commentRows } = await supabase
    .from("comments")
    .select(
      "id, author_id, content, created_at, author:profiles!comments_author_id_fkey(id, display_name, avatar_url)",
    )
    .eq("announcement_id", annoId)
    .order("created_at", { ascending: true });

  const comments: CommentWithAuthor[] = commentRows ?? [];
  const isHost = announcement.event?.host_id === currentUserId;
  const authorName = announcement.author?.display_name ?? "알 수 없음";

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">공지 상세</h1>
      <div className="rounded-2xl border p-5">
        <p className="whitespace-pre-wrap text-base">{announcement.content}</p>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <span>{authorName}</span>
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
        eventId={eventId}
        announcementId={announcement.id}
        comments={comments}
        isHost={isHost}
        currentUserId={currentUserId}
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
