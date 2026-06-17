import { EventForm } from "@/components/event/event-form";

// 이벤트 생성 (PRD 6.2 /events/new).
// 폼은 클라이언트 컴포넌트(EventForm)로 분리하고, 페이지는 셸만 제공한다.
export default function EventNewPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <EventForm mode="create" />
    </div>
  );
}
