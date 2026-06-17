import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { HeaderNav } from "@/components/nav/header-nav";
import { BottomTabNav } from "@/components/nav/bottom-tab-nav";

// 인증 확인 + 헤더 렌더. 동적 데이터(claims)는 별도 async 컴포넌트로 분리해
// Suspense로 감싼다(cacheComponents 환경 필수 패턴). 미인증 시 redirect로 차단한다.
// 추가로 활성 제재가 있으면 /banned로, app_metadata.role로 관리자 여부를 판별한다.
async function AuthenticatedHeader() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub as string;
  const email = (data.claims.email as string) ?? undefined;
  const isAdmin =
    (data.claims.app_metadata as { role?: string } | undefined)?.role ===
    "admin";

  // 활성 제재(차단/정지) 사용자는 앱 접근 차단 → 안내 페이지로 보낸다.
  const { data: sanctions } = await supabase
    .from("user_sanctions")
    .select("banned_until")
    .eq("user_id", userId)
    .is("lifted_at", null);
  const isBanned = (sanctions ?? []).some(
    (s) => s.banned_until === null || new Date(s.banned_until) > new Date(),
  );
  if (isBanned) {
    redirect("/banned");
  }

  return <HeaderNav userLabel={email} isAdmin={isAdmin} />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // 모바일 폭 고정 프레임 — 데스크톱에서도 가운데 좁은 폭(max-w-md)으로 모바일 앱처럼 보인다.
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col border-x border-border">
      {/* 상단 헤더(항상 노출). 인증 검증 주체이기도 하다. */}
      <Suspense fallback={<div className="h-16 border-b border-border" />}>
        <AuthenticatedHeader />
      </Suspense>

      {/* 본문 — 하단 탭(h-16) 높이만큼 항상 pb 확보 */}
      <main className="flex-1 p-5 pb-20">{children}</main>

      {/* 하단 탭(항상 노출, 프레임 폭 고정). usePathname은 동적이므로 Suspense로 감싼다. */}
      <Suspense
        fallback={
          <div className="fixed bottom-0 left-1/2 z-40 h-16 w-full max-w-md -translate-x-1/2 border-t border-border bg-background" />
        }
      >
        <BottomTabNav />
      </Suspense>
    </div>
  );
}
