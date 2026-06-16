import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
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
      <div className="flex-1 w-full flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          프로필 정보를 찾을 수 없습니다. 다시 로그인하거나 관리자에게
          문의하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <ProfileForm profile={profile} email={email} />
    </div>
  );
}
