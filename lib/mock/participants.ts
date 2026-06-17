import type { Participant, RsvpStatus } from "@/lib/mock/types";

// 정적 참여자 mock. event_id/user_id는 events/profiles의 id를 참조한다.
export const mockParticipants: Participant[] = [
  // event-1 (한강 수영)
  {
    id: "part-1",
    event_id: "event-1",
    user_id: "user-1",
    rsvp_status: "going",
    joined_at: "2026-06-10T08:05:00.000Z",
  },
  {
    id: "part-2",
    event_id: "event-1",
    user_id: "user-2",
    rsvp_status: "going",
    joined_at: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "part-3",
    event_id: "event-1",
    user_id: "user-3",
    rsvp_status: "maybe",
    joined_at: "2026-06-11T10:00:00.000Z",
  },
  {
    id: "part-4",
    event_id: "event-1",
    user_id: "user-4",
    rsvp_status: "not_going",
    joined_at: "2026-06-11T12:00:00.000Z",
  },
  // event-2 (보드게임)
  {
    id: "part-5",
    event_id: "event-2",
    user_id: "user-1",
    rsvp_status: "going",
    joined_at: "2026-06-11T08:05:00.000Z",
  },
  {
    id: "part-6",
    event_id: "event-2",
    user_id: "user-4",
    rsvp_status: "going",
    joined_at: "2026-06-12T08:00:00.000Z",
  },
  // event-3 (알고리즘 스터디)
  {
    id: "part-7",
    event_id: "event-3",
    user_id: "user-2",
    rsvp_status: "going",
    joined_at: "2026-06-12T08:05:00.000Z",
  },
  {
    id: "part-8",
    event_id: "event-3",
    user_id: "user-1",
    rsvp_status: "maybe",
    joined_at: "2026-06-13T08:00:00.000Z",
  },
];

/** 이벤트별 참여자 목록 (순수 함수) */
export function listParticipantsByEvent(eventId: string): Participant[] {
  return mockParticipants.filter(
    (participant) => participant.event_id === eventId,
  );
}

/** 이벤트별 RSVP 상태 카운트 (대시보드 D-02 위젯 대비) */
export function countRsvpByEvent(eventId: string): Record<RsvpStatus, number> {
  const counts: Record<RsvpStatus, number> = {
    going: 0,
    maybe: 0,
    not_going: 0,
  };
  for (const participant of listParticipantsByEvent(eventId)) {
    counts[participant.rsvp_status] += 1;
  }
  return counts;
}

/** 특정 사용자의 특정 이벤트 RSVP 상태 조회 */
export function getParticipantRsvp(
  eventId: string,
  userId: string,
): RsvpStatus | undefined {
  return mockParticipants.find(
    (participant) =>
      participant.event_id === eventId && participant.user_id === userId,
  )?.rsvp_status;
}
