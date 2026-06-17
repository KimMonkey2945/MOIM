"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { EventCategory, RsvpStatus } from "@/lib/types";

// 이벤트·RSVP 쓰기 작업(Server Action). 인증은 getClaims().sub로 확인하고,
// 실제 권한 강제는 DB RLS(PRD 9장)가 담당한다. 클라이언트는 조회만 한다.

/** 이벤트 생성/수정 입력 (events 컬럼 형태로 정규화된 값) */
export type EventInput = {
  title: string;
  description: string | null;
  category: EventCategory;
  event_at: string;
  location: string;
  thumbnail_url: string | null;
};

type ActionError = { error: string };

async function getCurrentUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (error || !userId) return { supabase, userId: null as string | null };
  return { supabase, userId };
}

/** 이벤트 생성 → 성공 시 상세로 리다이렉트. 주최자는 트리거가 참여자로 자동 등록 */
export async function createEvent(input: EventInput): Promise<ActionError> {
  const { supabase, userId } = await getCurrentUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const { data, error } = await supabase
    .from("events")
    .insert({ ...input, host_id: userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  redirect(`/events/${data.id}`);
}

/** 이벤트 수정 (주최자만 — RLS가 강제) → 성공 시 상세로 리다이렉트 */
export async function updateEvent(
  eventId: string,
  input: EventInput,
): Promise<ActionError> {
  const { supabase, userId } = await getCurrentUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("events")
    .update(input)
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

/** 이벤트 취소 (status=cancelled, 주최자만) */
export async function cancelEvent(eventId: string): Promise<ActionError> {
  const { supabase, userId } = await getCurrentUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("events")
    .update({ status: "cancelled" })
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

/** RSVP 생성/변경 (본인만 — RLS가 강제). (event_id,user_id) upsert */
export async function upsertRsvp(
  eventId: string,
  status: RsvpStatus,
): Promise<ActionError | { error: null }> {
  const { supabase, userId } = await getCurrentUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("event_participants")
    .upsert(
      { event_id: eventId, user_id: userId, rsvp_status: status },
      { onConflict: "event_id,user_id" },
    );

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  return { error: null };
}
