import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { getProfileById, MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";
import type { Profile } from "@/lib/mock/types";

// 동적 데이터(인증 claims)는 별도 async 컴포넌트로 분리해 Suspense로 감싼다
// (cacheComponents 환경 필수 패턴).
async function ProfileDetails() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    redirect("/auth/login");
  }

  const email = (claimsData.claims.email as string) ?? "";

  // ── Phase 3 wire-up 지점 ───────────────────────────────────────────────
  // 아래 mock 조회를 실제 profiles 테이블 조회로 교체한다:
  //   const userId = claimsData.claims.sub as string;
  //   const { data: profile } = await supabase
  //     .from("profiles").select().eq("id", userId).single();
  // ──────────────────────────────────────────────────────────────────────
  const profile: Profile = getProfileById(MOCK_CURRENT_USER_ID) ?? {
    id: MOCK_CURRENT_USER_ID,
    display_name: "",
    avatar_url: null,
    updated_at: "",
  };

  return <ProfileForm profile={profile} email={email} />;
}

export default function ProfilePage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">내 프로필</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <ProfileDetails />
      </Suspense>
    </div>
  );
}
