import { Suspense } from "react";

import { listEventsByUser } from "@/lib/mock/events";
import { MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";
import { Skeleton } from "@/components/ui/skeleton";
import { EventFeed } from "@/components/event/event-feed";

// 홈 피드 (PRD 6.2) — 내가 참여/주최한 이벤트 카드 목록.
// 동적 mock 조회를 async 컴포넌트로 분리해 Suspense로 감싼다(cacheComponents 패턴).
async function HomeFeed() {
  const events = listEventsByUser(MOCK_CURRENT_USER_ID);
  return <EventFeed events={events} />;
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-9 w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-60 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function ProtectedHomePage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">홈 피드</h1>
        <p className="text-sm text-muted-foreground">
          내가 참여하거나 주최한 이벤트 목록입니다.
        </p>
      </div>
      <Suspense fallback={<FeedSkeleton />}>
        <HomeFeed />
      </Suspense>
    </div>
  );
}
