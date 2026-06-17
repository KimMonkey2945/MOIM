"use client";

import { useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";

import type { RsvpStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

// 참석 ✓ / 미정 ? / 불참 ✗ 3-segment 컨트롤.
// 클릭 시 로컬 상태로 즉시 반영(낙관적 UI). 영속화는 Phase 3에서 Server Action으로 연결한다.
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
  initialStatus,
  className,
}: {
  /** 현재 사용자의 기존 RSVP(없으면 미응답) */
  initialStatus?: RsvpStatus;
  className?: string;
}) {
  const [status, setStatus] = useState<RsvpStatus | undefined>(initialStatus);

  const handleSelect = (next: RsvpStatus) => {
    // 동일 상태 재클릭은 멱등(같은 값 유지). Phase 3에서는 여기서 upsert를 호출한다.
    setStatus(next);
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
              onClick={() => handleSelect(segment.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
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
      {!status && (
        <p className="text-xs text-muted-foreground">
          아직 응답하지 않았습니다. 참석 여부를 선택해 주세요.
        </p>
      )}
    </div>
  );
}
