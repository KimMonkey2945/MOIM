import type { MockEvent } from "@/lib/mock/types";
import { MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";
import { mockParticipants } from "@/lib/mock/participants";

// 정적 이벤트 mock. host_id는 mockProfiles의 id를 참조한다.
export const mockEvents: MockEvent[] = [
  {
    id: "event-1",
    host_id: "user-1",
    title: "주말 한강 수영 모임",
    description: "토요일 오전 잠실 한강수영장에서 함께 수영해요. 초보 환영!",
    category: "운동",
    event_at: "2026-06-20T01:00:00.000Z",
    location: "잠실 한강수영장",
    thumbnail_url: null,
    status: "active",
    created_at: "2026-06-10T08:00:00.000Z",
  },
  {
    id: "event-2",
    host_id: "user-1",
    title: "금요일 보드게임 친목회",
    description: "퇴근 후 강남에서 가볍게 보드게임 한 판!",
    category: "친목",
    event_at: "2026-06-19T11:00:00.000Z",
    location: "강남 보드게임 카페",
    thumbnail_url: null,
    status: "active",
    created_at: "2026-06-11T08:00:00.000Z",
  },
  {
    id: "event-3",
    host_id: "user-2",
    title: "알고리즘 스터디 7회차",
    description: "이번 주는 그래프 탐색(BFS/DFS) 문제 풀이를 진행합니다.",
    category: "스터디",
    event_at: "2026-06-22T10:00:00.000Z",
    location: "온라인 (Zoom)",
    thumbnail_url: null,
    status: "active",
    created_at: "2026-06-12T08:00:00.000Z",
  },
  {
    id: "event-4",
    host_id: "user-3",
    title: "북한산 등산 (취소됨)",
    description: "우천 예보로 이번 일정은 취소되었습니다.",
    category: "운동",
    event_at: "2026-06-15T23:00:00.000Z",
    location: "북한산 우이역 집결",
    thumbnail_url: null,
    status: "cancelled",
    created_at: "2026-06-05T08:00:00.000Z",
  },
];

/** id로 이벤트 단건 조회 (순수 함수) */
export function getEventById(id: string): MockEvent | undefined {
  return mockEvents.find((event) => event.id === id);
}

/** 특정 사용자가 주최한 이벤트 목록 */
export function listEventsByHost(hostId: string): MockEvent[] {
  return mockEvents.filter((event) => event.host_id === hostId);
}

/**
 * 사용자와 연관된 이벤트 목록(홈 피드용) — 주최했거나 참여(event_participants)한 이벤트.
 * Phase 3에서는 동일 의미를 Supabase event_participants 조인 쿼리로 교체한다.
 */
export function listEventsByUser(
  userId: string = MOCK_CURRENT_USER_ID,
): MockEvent[] {
  const participatedEventIds = new Set(
    mockParticipants
      .filter((participant) => participant.user_id === userId)
      .map((participant) => participant.event_id),
  );
  return mockEvents.filter(
    (event) => event.host_id === userId || participatedEventIds.has(event.id),
  );
}

/** 카테고리로 필터링 (PRD E-07 칩 필터 대비) */
export function listEventsByCategory(
  category: MockEvent["category"],
): MockEvent[] {
  return mockEvents.filter((event) => event.category === category);
}
