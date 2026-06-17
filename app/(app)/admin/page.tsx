import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import type { UserWithSanction } from "@/lib/types";
import {
  AdminEventList,
  type AdminEventItem,
} from "@/components/admin/admin-event-list";
import { AdminUserList } from "@/components/admin/admin-user-list";

// 관리자 페이지 (이벤트 관리 + 사용자 관리).
// 동적 조회는 async 컴포넌트로 분리해 Suspense로 감싼다. 관리자가 아니면 홈으로 돌려보낸다.
async function AdminConsole() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const adminId = data.claims.sub as string;
  const isAdmin =
    (data.claims.app_metadata as { role?: string } | undefined)?.role ===
    "admin";
  if (!isAdmin) {
    redirect("/");
  }

  // 전체 이벤트 (관리자 RLS로 전체 조회) + 주최자 이름
  const { data: eventRows } = await supabase
    .from("events")
    .select(
      "id, title, event_at, status, host:profiles!events_host_id_fkey(display_name)",
    )
    .order("created_at", { ascending: false });

  const events: AdminEventItem[] = (eventRows ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    event_at: e.event_at,
    status: e.status,
    hostName: e.host?.display_name ?? "(이름 없음)",
  }));

  // 전체 사용자 + 활성 제재 매핑
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url");
  const { data: sanctionRows } = await supabase
    .from("user_sanctions")
    .select("id, user_id, reason, banned_until, created_at")
    .is("lifted_at", null);

  const now = new Date();
  const activeByUser = new Map<string, UserWithSanction["activeSanction"]>();
  for (const s of sanctionRows ?? []) {
    const isActive = s.banned_until === null || new Date(s.banned_until) > now;
    if (isActive && !activeByUser.has(s.user_id)) {
      activeByUser.set(s.user_id, {
        id: s.id,
        reason: s.reason,
        banned_until: s.banned_until,
        created_at: s.created_at,
      });
    }
  }

  const users: UserWithSanction[] = (profileRows ?? []).map((p) => ({
    ...p,
    activeSanction: activeByUser.get(p.id) ?? null,
  }));

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">관리자</h1>
        <p className="text-sm text-muted-foreground">
          전체 이벤트와 사용자를 관리합니다.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">이벤트 관리</h2>
        <AdminEventList events={events} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">사용자 관리</h2>
        <AdminUserList users={users} currentAdminId={adminId} />
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}
    >
      <AdminConsole />
    </Suspense>
  );
}
