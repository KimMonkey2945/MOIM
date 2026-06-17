import Link from "next/link";

import { listEventsByUser } from "@/lib/mock/events";
import { MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";

// 홈 피드 — 이벤트 카드 목록 (PRD 6.2). 현재는 mock 정적 데이터 기반 빈 껍데기.
// 실제 디자인/카드 컴포넌트는 Phase 1 Task에서 구현한다.
export default function ProtectedHomePage() {
  const events = listEventsByUser(MOCK_CURRENT_USER_ID);

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">홈 피드</h1>
      <p className="text-sm text-muted-foreground">
        내가 참여하거나 주최한 이벤트 목록입니다. (mock 데이터)
      </p>
      <ul className="flex flex-col gap-3">
        {events.map((event) => (
          <li key={event.id} className="rounded-2xl border p-5">
            <Link
              href={`/protected/events/${event.id}`}
              className="text-base font-semibold hover:underline"
            >
              {event.title}
            </Link>
            <p className="text-sm text-muted-foreground">
              {event.category} · {event.location}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
