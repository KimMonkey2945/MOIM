"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { Profile } from "@/lib/mock/types";

// 프로필 수정 폼 (Phase 0: display_name·avatar_url 중심으로 축소).
// 영속화 없이 로컬 상태/no-op으로 인터랙션만 시뮬레이션한다.
// 빈 문자열 → null 변환 등 입력 규칙은 UI 레벨에서 미리 반영(Phase 3 wire-up 대비).
export function ProfileForm({
  profile,
  email,
  className,
  ...props
}: {
  profile: Profile;
  email: string;
} & React.ComponentPropsWithoutRef<"div">) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // shrimp-rules 9절 폼 패턴(try/catch/finally, error 상태)을 미리 맞춰
  // Phase 3 async Supabase 호출 교체 비용을 줄인다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 빈 문자열은 null로 정규화한다(Phase 3에서 DB 저장 시 UNIQUE/NULL 규칙 대비).
      const normalizedDisplayName = displayName.trim() || null;
      const normalizedAvatarUrl = avatarUrl.trim() || null;

      // ── Phase 3 wire-up 지점 ─────────────────────────────────────────────
      // 아래 로컬 시뮬레이션을 실제 Supabase update로 교체한다:
      //   const supabase = createClient(); // @/lib/supabase/client
      //   const { error } = await supabase
      //     .from("profiles")
      //     .update({
      //       display_name: normalizedDisplayName,
      //       avatar_url: normalizedAvatarUrl,
      //       updated_at: new Date().toISOString(),
      //     })
      //     .eq("id", profile.id);
      //   if (error) throw error;
      // ────────────────────────────────────────────────────────────────────

      // 낙관적 UI: 정규화된 값을 로컬 상태에 반영하고 성공 표시
      setDisplayName(normalizedDisplayName ?? "");
      setAvatarUrl(normalizedAvatarUrl ?? "");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const previewInitial = (displayName.trim() || "?").charAt(0).toUpperCase();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">프로필</CardTitle>
          <CardDescription>닉네임과 아바타를 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* 아바타 미리보기 */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border bg-muted text-xl font-semibold text-muted-foreground">
                  {avatarUrl.trim() ? (
                    // 외부 임의 URL 미리보기라 next/image 도메인 설정을 피해 img 사용
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="아바타 미리보기"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    previewInitial
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  아바타 URL을 입력하면 미리보기가 갱신됩니다.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="display_name">닉네임 (display name)</Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="다른 참여자에게 표시될 이름"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                {!displayName.trim() && (
                  <p className="text-sm text-muted-foreground">
                    비워 두면 닉네임이 미설정(null)으로 저장됩니다.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="avatar_url">아바타 URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && (
                <p className="text-sm text-green-600">
                  미리보기에 반영되었습니다.
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
