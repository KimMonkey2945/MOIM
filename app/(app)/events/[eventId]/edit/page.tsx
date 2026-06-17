import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/event/event-form";

// 이벤트 수정 (주최자 전용, PRD 6.1·9장).
// RLS로 비참여자는 행이 보이지 않고, 추가로 주최자 본인인지 페이지 단에서 이중 가드한다.
async function EventEdit({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  const currentUserId = claims?.claims?.sub as string | undefined;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    notFound();
  }

  // 주최자가 아니면 상세로 돌려보낸다(RLS는 UPDATE를 막지만 UI도 노출하지 않는다).
  if (event.host_id !== currentUserId) {
    redirect(`/events/${eventId}`);
  }

  return <EventForm mode="edit" initialEvent={event} />;
}

export default function EventEditPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <EventEdit params={params} />
      </Suspense>
    </div>
  );
}
