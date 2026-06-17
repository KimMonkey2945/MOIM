import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import type { FeedEvent, PublicProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { EventFeed } from "@/components/event/event-feed";

// 홈 피드 (PRD 6.2) — 내가 참여/주최한 이벤트 카드 목록.
// RLS(events SELECT = 참여자+주최자)가 가시 범위를 강제하므로 별도 필터가 필요 없다.
// 참석자 프로필을 한 번에 조인해 카드 N+1을 방지한다(cacheComponents + Suspense).
async function HomeFeed() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(
      "*, event_participants(user_id, rsvp_status, profile:profiles(id, display_name, avatar_url))",
    )
    .order("event_at", { ascending: true });

  const events: FeedEvent[] = (data ?? []).map(
    ({ event_participants, ...event }) => ({
      ...event,
      goingProfiles: (event_participants ?? [])
        .filter((p) => p.rsvp_status === "going")
        .map((p) => p.profile)
        .filter((p): p is PublicProfile => p !== null),
    }),
  );

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
