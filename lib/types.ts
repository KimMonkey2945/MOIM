import type { Tables, Enums } from "@/lib/database.types";

// 앱 전역에서 쓰는 도메인 타입. Supabase 생성 타입(database.types.ts)에서 파생해
// 스키마와 항상 일치하도록 한다. (mock/types.ts를 대체)

/** 이벤트 카테고리 (PRD 5.2 / 7.4 칩 필터) */
export type EventCategory = Enums<"event_category">;
/** 이벤트 상태 (PRD 8.2 events.status) */
export type EventStatus = Enums<"event_status">;
/** RSVP 상태 (PRD 8.2 event_participants.rsvp_status) */
export type RsvpStatus = Enums<"rsvp_status">;

/** 아바타·이름 표시에 필요한 최소 공개 프로필 */
export type PublicProfile = Pick<
  Tables<"profiles">,
  "id" | "display_name" | "avatar_url"
>;

/** 홈 피드 카드용 이벤트 — 참석자 프로필을 함께 싣는다 */
export type FeedEvent = Tables<"events"> & {
  goingProfiles: PublicProfile[];
};

/** 참여자 목록 항목 — 프로필을 조인해 이름·아바타를 함께 싣는다 */
export type ParticipantWithProfile = Pick<
  Tables<"event_participants">,
  "id" | "user_id" | "rsvp_status"
> & {
  profile: PublicProfile | null;
};

/** 사용자 제재 행 */
export type SanctionRow = Tables<"user_sanctions">;

/** 관리자 사용자 관리 항목 — 프로필 + 활성 제재(있으면) */
export type UserWithSanction = PublicProfile & {
  activeSanction: Pick<
    SanctionRow,
    "id" | "reason" | "banned_until" | "created_at"
  > | null;
};

/** 공지 + 작성자 프로필 (피드·상세 표시용) */
export type AnnouncementWithAuthor = Tables<"announcements"> & {
  author: PublicProfile | null;
};

/** 댓글 + 작성자 프로필 (스레드 표시용) */
export type CommentWithAuthor = Pick<
  Tables<"comments">,
  "id" | "author_id" | "content" | "created_at"
> & {
  author: PublicProfile | null;
};
