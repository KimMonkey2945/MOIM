import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import type { PublicProfile } from "@/lib/types";

// 동적 데이터(인증 claims + 프로필)는 별도 async 컴포넌트로 분리해 Suspense로 감싼다
// (cacheComponents 환경 필수 패턴).
async function ProfileDetails() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub as string;
  const email = (claimsData.claims.email as string) ?? "";

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .single();

  const profile: PublicProfile = profileRow ?? {
    id: userId,
    display_name: null,
    avatar_url: null,
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
