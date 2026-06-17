"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

// 관리자 전용 Server Action(이벤트 삭제 / 사용자 제재·해제).
// 권한은 DB RLS(private.is_admin())가 최종 강제하고, 여기서는 친절한 에러용으로 한 번 더 확인한다.

type ActionResult = { error: string | null };

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const adminId = claims?.sub as string | undefined;
  const isAdmin =
    (claims?.app_metadata as { role?: string } | undefined)?.role === "admin";
  if (!adminId || !isAdmin) {
    return { supabase, adminId: null as string | null };
  }
  return { supabase, adminId };
}

/** 이벤트 삭제(관리자). cascade로 참여자·공지·댓글 동반 삭제 */
export async function adminDeleteEvent(eventId: string): Promise<ActionResult> {
  const { supabase, adminId } = await requireAdmin();
  if (!adminId) return { error: "관리자 권한이 필요합니다." };

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

/**
 * 사용자 제재(관리자). bannedUntil이 null이면 영구 차단, 'YYYY-MM-DD'면 해당 날짜(KST) 말까지 정지.
 * 동일 사용자의 기존 활성 제재는 먼저 해제해 활성 제재를 1건으로 유지한다.
 */
export async function sanctionUser(
  userId: string,
  input: { bannedUntil: string | null; reason: string },
): Promise<ActionResult> {
  const reason = input.reason.trim();
  if (!reason) return { error: "제재 사유를 입력해 주세요." };

  const { supabase, adminId } = await requireAdmin();
  if (!adminId) return { error: "관리자 권한이 필요합니다." };
  if (userId === adminId) return { error: "본인은 제재할 수 없습니다." };

  // 'YYYY-MM-DD' → 해당 날짜 KST 23:59:59까지 정지. null이면 영구.
  const bannedUntil = input.bannedUntil
    ? new Date(`${input.bannedUntil}T23:59:59+09:00`).toISOString()
    : null;

  // 기존 활성 제재 해제(단일 활성 보장)
  const { error: liftError } = await supabase
    .from("user_sanctions")
    .update({ lifted_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("lifted_at", null);
  if (liftError) return { error: liftError.message };

  const { error } = await supabase.from("user_sanctions").insert({
    user_id: userId,
    reason,
    banned_until: bannedUntil,
    created_by: adminId,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

/** 제재 해제(관리자) */
export async function liftSanction(sanctionId: string): Promise<ActionResult> {
  const { supabase, adminId } = await requireAdmin();
  if (!adminId) return { error: "관리자 권한이 필요합니다." };

  const { error } = await supabase
    .from("user_sanctions")
    .update({ lifted_at: new Date().toISOString() })
    .eq("id", sanctionId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}
