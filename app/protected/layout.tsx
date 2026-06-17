import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { HeaderNav } from "@/components/nav/header-nav";
import { BottomTabNav } from "@/components/nav/bottom-tab-nav";

// 인증 확인 + 데스크톱 헤더 렌더. 동적 데이터(claims)는 별도 async 컴포넌트로 분리해
// Suspense로 감싼다(cacheComponents 환경 필수 패턴). 미인증 시 redirect로 차단한다.
async function AuthenticatedHeader() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = (data.claims.email as string) ?? undefined;
  return <HeaderNav userLabel={email} />;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 데스크톱 헤더(hidden md:flex). 인증 검증 주체이기도 하다. */}
      <Suspense
        fallback={
          <div className="hidden h-16 border-b border-border md:block" />
        }
      >
        <AuthenticatedHeader />
      </Suspense>

      {/* 본문 — 하단 탭(h-16) 높이만큼 pb-16, 데스크톱은 헤더만 있으므로 md:pb-0 */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-5 pb-16 md:pb-0">
        {children}
      </main>

      {/* 모바일 하단 탭(md:hidden). usePathname은 동적이므로 Suspense로 감싼다. */}
      <Suspense
        fallback={
          <div className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-border bg-background md:hidden" />
        }
      >
        <BottomTabNav />
      </Suspense>
    </div>
  );
}
