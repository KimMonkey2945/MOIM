import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";

// 동적 데이터(인증 claims + 프로필 조회)는 별도 async 컴포넌트로 분리해
// Suspense로 감싼다 (cacheComponents 환경에서 필수 패턴)
async function ProfileDetails() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub as string;
  const email = (claimsData.claims.email as string) ?? "";

  // 회원가입 트리거로 생성된 본인 프로필 행 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .single();

  if (!profile) {
    // 트리거 이전에 가입한 사용자 등 프로필이 없는 경우 안내
    return (
      <p className="text-sm text-muted-foreground">
        프로필 정보를 찾을 수 없습니다. 다시 로그인하거나 관리자에게 문의하세요.
      </p>
    );
  }

  return <ProfileForm profile={profile} email={email} />;
}

export default function ProfilePage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
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
