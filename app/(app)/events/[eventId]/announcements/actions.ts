"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

// 공지·댓글 쓰기 작업(Server Action). 권한은 DB RLS(PRD 9장)가 강제하고,
// 페이지 단 isHost 분기와 이중화한다. eventId는 revalidatePath용으로 함께 받는다.

type ActionResult = { error: string } | { error: null };

async function getCurrentUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (error || !userId) return { supabase, userId: null as string | null };
  return { supabase, userId };
}

/** 공지 작성 (주최자만 — RLS 강제) */
export async function createAnnouncement(
  eventId: string,
  content: string,
): Promise<ActionResult> {
  const trimmed = content.trim();
  if (!trimmed) return { error: "공지 내용을 입력해 주세요." };

  const { supabase, userId } = await getCurrentUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("announcements")
    .insert({ event_id: eventId, author_id: userId, content: trimmed });

  if (error) return { error: error.message };
  revalidatePath(`/events/${eventId}/announcements`);
  return { error: null };
}

/** 공지 수정 (주최자만) */
export async function updateAnnouncement(
  eventId: string,
  announcementId: string,
  content: string,
): Promise<ActionResult> {
  const trimmed = content.trim();
  if (!trimmed) return { error: "공지 내용을 입력해 주세요." };

  const { supabase } = await getCurrentUserId();

  const { error } = await supabase
    .from("announcements")
    .update({ content: trimmed })
    .eq("id", announcementId);

  if (error) return { error: error.message };
  revalidatePath(`/events/${eventId}/announcements`);
  revalidatePath(`/events/${eventId}/announcements/${announcementId}`);
  return { error: null };
}

/** 공지 삭제 (주최자만) */
export async function deleteAnnouncement(
  eventId: string,
  announcementId: string,
): Promise<ActionResult> {
  const { supabase } = await getCurrentUserId();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) return { error: error.message };
  revalidatePath(`/events/${eventId}/announcements`);
  return { error: null };
}

/** 핀 토글. pinned=true면 RPC로 기존 핀 해제+신규 핀(원자), false면 해당 공지만 해제 */
export async function togglePin(
  eventId: string,
  announcementId: string,
  pinned: boolean,
): Promise<ActionResult> {
  const { supabase } = await getCurrentUserId();

  if (pinned) {
    const { error } = await supabase.rpc("set_pinned_announcement", {
      p_event_id: eventId,
      p_announcement_id: announcementId,
    });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("announcements")
      .update({ is_pinned: false })
      .eq("id", announcementId);
    if (error) return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/announcements`);
  return { error: null };
}

/** 댓글 작성 (이벤트 참여자만 — RLS 강제) */
export async function createComment(
  eventId: string,
  announcementId: string,
  content: string,
): Promise<ActionResult> {
  const trimmed = content.trim();
  if (!trimmed) return { error: "댓글 내용을 입력해 주세요." };

  const { supabase, userId } = await getCurrentUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("comments").insert({
    announcement_id: announcementId,
    author_id: userId,
    content: trimmed,
  });

  if (error) return { error: error.message };
  revalidatePath(`/events/${eventId}/announcements/${announcementId}`);
  return { error: null };
}

/** 댓글 삭제 (본인 또는 주최자 — RLS 강제) */
export async function deleteComment(
  eventId: string,
  announcementId: string,
  commentId: string,
): Promise<ActionResult> {
  const { supabase } = await getCurrentUserId();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) return { error: error.message };
  revalidatePath(`/events/${eventId}/announcements/${announcementId}`);
  return { error: null };
}
