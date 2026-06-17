import type { Announcement } from "@/lib/mock/types";

// 정적 공지 mock. event_id/author_id는 events/profiles의 id를 참조한다.
export const mockAnnouncements: Announcement[] = [
  // event-1 (한강 수영) — 핀 고정 1개 + 일반 1개
  {
    id: "anno-1",
    event_id: "event-1",
    author_id: "user-1",
    content: "준비물: 수영복, 수경, 수건. 09시까지 정문 앞으로 모여주세요!",
    is_pinned: true,
    created_at: "2026-06-12T08:00:00.000Z",
  },
  {
    id: "anno-2",
    event_id: "event-1",
    author_id: "user-1",
    content: "수영 후 근처 식당에서 점심 함께해요. 참석 여부 댓글 부탁!",
    is_pinned: false,
    created_at: "2026-06-13T08:00:00.000Z",
  },
  // event-3 (알고리즘 스터디)
  {
    id: "anno-3",
    event_id: "event-3",
    author_id: "user-2",
    content:
      "이번 주 과제: 백준 1260, 2606 풀어오기. Zoom 링크는 당일 공유합니다.",
    is_pinned: true,
    created_at: "2026-06-14T08:00:00.000Z",
  },
];

/** 이벤트별 공지 목록 — 핀 고정 우선, 그다음 최신순 (순수 함수) */
export function listAnnouncementsByEvent(eventId: string): Announcement[] {
  return mockAnnouncements
    .filter((announcement) => announcement.event_id === eventId)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      return b.created_at.localeCompare(a.created_at);
    });
}

/** id로 공지 단건 조회 (순수 함수) */
export function getAnnouncementById(id: string): Announcement | undefined {
  return mockAnnouncements.find((announcement) => announcement.id === id);
}
