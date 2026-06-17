"use client";

import { useState, useTransition } from "react";
import { Check, HelpCircle, X } from "lucide-react";

import type { RsvpStatus } from "@/lib/types";
import { upsertRsvp } from "@/app/(app)/events/actions";
import { cn } from "@/lib/utils";

// 참석 ✓ / 미정 ? / 불참 ✗ 3-segment 컨트롤.
// 클릭 시 로컬 상태로 즉시 반영(낙관적 UI)하고 Server Action(upsertRsvp)으로 영속화한다.
// 실패하면 이전 상태로 롤백한다.
const SEGMENTS: {
  value: RsvpStatus;
  label: string;
  icon: typeof Check;
  activeClass: string;
}[] = [
  {
    value: "going",
    label: "참석",
    icon: Check,
    activeClass: "bg-primary text-primary-foreground",
  },
  {
    value: "maybe",
    label: "미정",
    icon: HelpCircle,
    activeClass: "bg-amber-500 text-white",
  },
  {
    value: "not_going",
    label: "불참",
    icon: X,
    activeClass: "bg-destructive text-destructive-foreground",
  },
];

export function RsvpControl({
  eventId,
  initialStatus,
  className,
}: {
  /** RSVP를 영속화할 대상 이벤트 */
  eventId: string;
  /** 현재 사용자의 기존 RSVP(없으면 미응답) */
  initialStatus?: RsvpStatus;
  className?: string;
}) {
  const [status, setStatus] = useState<RsvpStatus | undefined>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (next: RsvpStatus) => {
    // 동일 상태 재클릭은 멱등. 낙관적으로 먼저 반영하고 실패 시 롤백한다.
    const prev = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await upsertRsvp(eventId, next);
      if (result?.error) {
        setStatus(prev);
        setError(result.error);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium">내 참석 여부</span>
      <div
        role="group"
        aria-label="RSVP 선택"
        className="inline-flex w-full max-w-md overflow-hidden rounded-2xl border"
      >
        {SEGMENTS.map((segment) => {
          const active = status === segment.value;
          const Icon = segment.icon;
          return (
            <button
              key={segment.value}
              type="button"
              aria-pressed={active}
              disabled={isPending}
              onClick={() => handleSelect(segment.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60",
                active
                  ? segment.activeClass
                  : "bg-transparent text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {segment.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        !status && (
          <p className="text-xs text-muted-foreground">
            아직 응답하지 않았습니다. 참석 여부를 선택해 주세요.
          </p>
        )
      )}
    </div>
  );
}
