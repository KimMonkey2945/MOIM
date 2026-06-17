import type { MockComment } from "@/lib/mock/types";

// 정적 댓글 mock. announcement_id/author_id는 announcements/profiles의 id를 참조한다.
export const mockComments: MockComment[] = [
  {
    id: "comment-1",
    announcement_id: "anno-1",
    author_id: "user-2",
    content: "넵! 수경 챙겨갈게요 👍",
    created_at: "2026-06-12T09:00:00.000Z",
  },
  {
    id: "comment-2",
    announcement_id: "anno-1",
    author_id: "user-3",
    content: "혹시 주차 가능한가요?",
    created_at: "2026-06-12T10:30:00.000Z",
  },
  {
    id: "comment-3",
    announcement_id: "anno-2",
    author_id: "user-2",
    content: "점심 참석합니다!",
    created_at: "2026-06-13T09:15:00.000Z",
  },
];

/** 공지별 댓글 목록 — 작성 오래된 순(스레드) (순수 함수) */
export function listCommentsByAnnouncement(
  announcementId: string,
): MockComment[] {
  return mockComments
    .filter((comment) => comment.announcement_id === announcementId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}
