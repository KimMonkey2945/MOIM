import { listEventsByHost } from "@/lib/mock/events";
import { countRsvpByEvent } from "@/lib/mock/participants";
import { MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";

// 주최자 대시보드 (PRD 5.6 / 6.2). 현재는 mock 기반 빈 껍데기.
// RSVP·미승인 카풀·미정산 위젯은 Phase 5 Task에서 구현한다.
export default function DashboardPage() {
  const myEvents = listEventsByHost(MOCK_CURRENT_USER_ID);

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">주최자 대시보드</h1>
      <p className="text-sm text-muted-foreground">
        내가 주최한 이벤트의 현황 요약입니다. (mock 데이터)
      </p>
      <ul className="flex flex-col gap-3">
        {myEvents.map((event) => {
          const counts = countRsvpByEvent(event.id);
          return (
            <li key={event.id} className="rounded-2xl border p-5">
              <p className="text-base font-semibold">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                참석 {counts.going} · 미정 {counts.maybe} · 불참{" "}
                {counts.not_going}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
