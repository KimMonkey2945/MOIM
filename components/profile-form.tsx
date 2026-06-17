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
import { useState, useTransition } from "react";
import type { PublicProfile } from "@/lib/types";
import { updateProfile } from "@/app/(app)/profile/actions";

// 프로필 수정 폼 (display_name·avatar_url 중심).
// 제출은 Server Action(updateProfile)으로 영속화한다. 빈 문자열 → null로 정규화한다.
export function ProfileForm({
  profile,
  email,
  className,
  ...props
}: {
  profile: PublicProfile;
  email: string;
} & React.ComponentPropsWithoutRef<"div">) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // 빈 문자열은 null로 정규화한다(미설정 의미).
    const normalizedDisplayName = displayName.trim() || null;
    const normalizedAvatarUrl = avatarUrl.trim() || null;

    startTransition(async () => {
      const result = await updateProfile({
        display_name: normalizedDisplayName,
        avatar_url: normalizedAvatarUrl,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      // 저장 성공: 정규화된 값을 입력에 반영하고 성공 표시
      setDisplayName(normalizedDisplayName ?? "");
      setAvatarUrl(normalizedAvatarUrl ?? "");
      setSuccess(true);
    });
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
                <p className="text-sm text-green-600">저장되었습니다.</p>
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
