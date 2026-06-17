import { notFound } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import type { AnnouncementWithAuthor } from "@/lib/types";
import { AnnouncementFeed } from "@/components/announcement/announcement-feed";

// 공지 탭 (PRD 6.2). server에서 이벤트·공지 조회 + isHost 계산 후 client 피드에 위임한다.
// 비참여자는 RLS로 이벤트가 보이지 않아 notFound(404)로 처리된다.
async function AnnouncementList({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  const currentUserId = claims?.claims?.sub as string | undefined;

  const { data: event } = await supabase
    .from("events")
    .select("id, title, host_id")
    .eq("id", eventId)
    .single();

  if (!event) {
    notFound();
  }

  const { data: announcementRows } = await supabase
    .from("announcements")
    .select(
      "*, author:profiles!announcements_author_id_fkey(id, display_name, avatar_url)",
    )
    .eq("event_id", eventId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const announcements: AnnouncementWithAuthor[] = announcementRows ?? [];
  const isHost = event.host_id === currentUserId;

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
        announcements={announcements}
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
