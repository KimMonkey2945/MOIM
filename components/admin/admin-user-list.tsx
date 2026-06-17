"use client";

import { useState, useTransition } from "react";

import type { UserWithSanction } from "@/lib/types";
import { sanctionUser, liftSanction } from "@/app/(app)/admin/actions";
import { formatEventDate } from "@/lib/event-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 관리자 사용자 관리 — 전체 사용자 + 활성 제재 표시 + 제재 부여/해제.
// 본인(currentAdminId)은 제재 폼을 숨긴다.
export function AdminUserList({
  users,
  currentAdminId,
}: {
  users: UserWithSanction[];
  currentAdminId: string;
}) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">사용자가 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {users.map((user) => (
        <UserRow
          key={user.id}
          user={user}
          isSelf={user.id === currentAdminId}
        />
      ))}
    </ul>
  );
}

function UserRow({
  user,
  isSelf,
}: {
  user: UserWithSanction;
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [permanent, setPermanent] = useState(true);
  const [until, setUntil] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const name = user.display_name ?? "(이름 없음)";
  const initial = name.charAt(0).toUpperCase();
  const sanction = user.activeSanction;

  const handleSanction = () => {
    if (!reason.trim()) {
      setError("제재 사유를 입력해 주세요.");
      return;
    }
    if (!permanent && !until) {
      setError("정지 종료 날짜를 선택해 주세요.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await sanctionUser(user.id, {
        bannedUntil: permanent ? null : until,
        reason: reason.trim(),
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setReason("");
      setUntil("");
      setPermanent(true);
    });
  };

  const handleLift = () => {
    if (!sanction) return;
    setError(null);
    startTransition(async () => {
      const result = await liftSanction(sanction.id);
      if (result.error) setError(result.error);
    });
  };

  return (
    <li className="flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            {initial}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{name}</span>
            {sanction && (
              <span className="text-xs text-destructive">
                {sanction.banned_until
                  ? `정지 중 · ${formatEventDate(sanction.banned_until)}까지`
                  : "영구 차단 중"}
              </span>
            )}
          </div>
        </div>

        {!isSelf &&
          (sanction ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={handleLift}
            >
              제재 해제
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setOpen((v) => !v)}
            >
              제재
            </Button>
          ))}
        {isSelf && (
          <span className="shrink-0 text-xs text-muted-foreground">나</span>
        )}
      </div>

      {/* 제재 부여 폼 */}
      {open && !sanction && !isSelf && (
        <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name={`ban-type-${user.id}`}
                checked={permanent}
                onChange={() => setPermanent(true)}
              />
              영구 차단
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name={`ban-type-${user.id}`}
                checked={!permanent}
                onChange={() => setPermanent(false)}
              />
              기간제 정지
            </label>
          </div>
          {!permanent && (
            <Input
              type="date"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              aria-label="정지 종료 날짜"
            />
          )}
          <Input
            value={reason}
            placeholder="제재 사유"
            onChange={(e) => setReason(e.target.value)}
            aria-label="제재 사유"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={handleSanction}
            >
              제재 적용
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </li>
  );
}
