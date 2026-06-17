// PRD 8.2 핵심 필드와 1:1 정렬된 mock 타입 정의.
// 향후 Tables<"...">(생성 타입)와 컬럼명/유니온 리터럴이 일치하도록 선언해
// Phase 3 실제 쿼리 교체 시 스키마 드리프트를 방지한다.

/** 이벤트 카테고리 (PRD 5.2 / 7.4 칩 필터) */
export type EventCategory = "운동" | "친목" | "스터디" | "기타";

/** 이벤트 상태 (PRD 8.2 events.status) */
export type EventStatus = "active" | "cancelled";

/** RSVP 상태 (PRD 8.2 event_participants.rsvp_status) */
export type RsvpStatus = "going" | "maybe" | "not_going";

/** 사용자 공개 프로필 (PRD 8.2 profiles) */
export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  updated_at: string;
}

/** 모임 이벤트 (PRD 8.2 events) */
export interface MockEvent {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  event_at: string;
  location: string;
  thumbnail_url: string | null;
  status: EventStatus;
  created_at: string;
}

/** 참여자별 RSVP (PRD 8.2 event_participants) */
export interface Participant {
  id: string;
  event_id: string;
  user_id: string;
  rsvp_status: RsvpStatus;
  joined_at: string;
}

/** 이벤트 내 공지 (PRD 8.2 announcements) */
export interface Announcement {
  id: string;
  event_id: string;
  author_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

/**
 * 공지 댓글 스레드 (PRD 8.2 comments).
 * DOM 전역 `Comment`(lib.dom.d.ts)와의 이름 충돌을 피하기 위해 Mock 접두사를 사용한다.
 */
export interface MockComment {
  id: string;
  announcement_id: string;
  author_id: string;
  content: string;
  created_at: string;
}
