import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/event/event-form";

// 이벤트 생성 (PRD 6.2 /events/new).
// 커버 이미지 업로드를 위해 userId(claims.sub)가 필요하므로
// 동적 데이터(인증 claims)는 별도 async 컴포넌트로 분리해 Suspense로 감싼다
// (cacheComponents 환경 필수 패턴).
async function EventNew() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub as string;

  return <EventForm mode="create" userId={userId} />;
}

export default function EventNewPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <EventNew />
      </Suspense>
    </div>
  );
}
