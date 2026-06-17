"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

// 프로필 수정 Server Action. 본인 행만 수정(RLS가 강제). 빈 값은 호출 측에서 null로 정규화한다.
export async function updateProfile(input: {
  display_name: string | null;
  avatar_url: string | null;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (claimsError || !userId) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.display_name,
      avatar_url: input.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { error: null };
}
