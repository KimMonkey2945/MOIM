"use client";

import type { EventCategory } from "@/lib/mock/types";
import { ALL_CATEGORIES } from "@/lib/event-display";
import { cn } from "@/lib/utils";

// 카테고리 칩 필터(전체 + 4개 카테고리). 제어 컴포넌트 — 상태는 상위(EventFeed)가 보유.
export function CategoryChips({
  value,
  onChange,
}: {
  /** null이면 전체 */
  value: EventCategory | null;
  onChange: (next: EventCategory | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={value === null} onClick={() => onChange(null)}>
        전체
      </Chip>
      {ALL_CATEGORIES.map((category) => (
        <Chip
          key={category}
          active={value === category}
          onClick={() => onChange(category)}
        >
          {category}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/70",
      )}
    >
      {children}
    </button>
  );
}
