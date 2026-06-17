import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ShieldAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatEventDate } from "@/lib/event-display";
import { LogoutButton } from "@/components/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 제재(차단/정지) 사용자 안내 페이지. (app) 그룹 밖이라 layout 차단 리다이렉트 루프가 없다.
// 인증된 사용자만 도달한다(proxy가 미인증은 로그인으로). 활성 제재가 없으면 홈으로 되돌린다.
async function BannedDetail() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub as string;
  const { data: sanctions } = await supabase
    .from("user_sanctions")
    .select("reason, banned_until, created_at")
    .eq("user_id", userId)
    .is("lifted_at", null)
    .order("created_at", { ascending: false });

  const active = (sanctions ?? []).find(
    (s) => s.banned_until === null || new Date(s.banned_until) > new Date(),
  );

  // 활성 제재가 없으면 정상 사용자 → 홈으로.
  if (!active) {
    redirect("/");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-2xl">계정이 제재되었습니다</CardTitle>
        <CardDescription>
          {active.banned_until
            ? `${formatEventDate(active.banned_until)}까지 이용이 제한됩니다.`
            : "영구적으로 이용이 제한되었습니다."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-2xl border p-4">
          <p className="text-sm font-medium">사유</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
            {active.reason}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          문의 사항이 있으면 운영자에게 연락해 주세요.
        </p>
        <LogoutButton />
      </CardContent>
    </Card>
  );
}

export default function BannedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <BannedDetail />
      </Suspense>
    </div>
  );
}
