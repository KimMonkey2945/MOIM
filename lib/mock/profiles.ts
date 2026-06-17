import type { Profile } from "@/lib/mock/types";

// 정적 프로필 mock. id는 events.host_id / participants.user_id 등에서 참조된다.
export const mockProfiles: Profile[] = [
  {
    id: "user-1",
    display_name: "김도현",
    avatar_url: null,
    updated_at: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "user-2",
    display_name: "이수진",
    avatar_url: null,
    updated_at: "2026-06-02T09:00:00.000Z",
  },
  {
    id: "user-3",
    display_name: "박민수",
    avatar_url: null,
    updated_at: "2026-06-03T09:00:00.000Z",
  },
  {
    id: "user-4",
    display_name: "정하나",
    avatar_url: null,
    updated_at: "2026-06-04T09:00:00.000Z",
  },
];

/** 현재 로그인 사용자로 간주할 mock id (Phase 3에서 getClaims().sub로 교체) */
export const MOCK_CURRENT_USER_ID = "user-1";

/** id로 프로필 단건 조회 (순수 함수) */
export function getProfileById(id: string): Profile | undefined {
  return mockProfiles.find((profile) => profile.id === id);
}

/** 표시 이름 조회 헬퍼. 없으면 fallback 문자열 반환 */
export function getDisplayName(id: string): string {
  return getProfileById(id)?.display_name ?? "알 수 없음";
}
