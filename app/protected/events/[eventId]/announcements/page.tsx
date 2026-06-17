import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pin } from "lucide-react";

import { getEventById } from "@/lib/mock/events";
import { listAnnouncementsByEvent } from "@/lib/mock/announcements";
import { getDisplayName } from "@/lib/mock/profiles";

// 공지 탭 (PRD 6.2). 핀 고정 우선 정렬된 공지 피드를 mock으로 표시한다.
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

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">공지</h1>
      <p className="text-sm text-muted-foreground">
        &ldquo;{event.title}&rdquo;의 공지 피드입니다. (mock 데이터)
      </p>
      <ul className="flex flex-col gap-3">
        {announcements.map((announcement) => (
          <li key={announcement.id} className="rounded-2xl border p-5">
            <Link
              href={`/protected/events/${event.id}/announcements/${announcement.id}`}
              className="flex items-start gap-1.5 text-base font-semibold hover:underline"
            >
              {announcement.is_pinned && (
                <Pin
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-label="고정됨"
                />
              )}
              <span>{announcement.content}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {getDisplayName(announcement.author_id)}
            </p>
          </li>
        ))}
      </ul>
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
