"use client";

import { useMemo, useState } from "react";

import type { Participant, RsvpStatus } from "@/lib/mock/types";
import { getProfileById } from "@/lib/mock/profiles";
import { rsvpLabels } from "@/lib/event-display";
import { cn } from "@/lib/utils";

// 참여자 목록 + RSVP 상태별 필터(전체/참석/미정/불참). 로컬 상태로 필터만 전환한다.
type FilterKey = "all" | RsvpStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "going", label: "참석" },
  { key: "maybe", label: "미정" },
  { key: "not_going", label: "불참" },
];

const statusBadgeClass: Record<RsvpStatus, string> = {
  going: "bg-primary/10 text-primary",
  maybe: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  not_going: "bg-destructive/10 text-destructive",
};

export function ParticipantList({
  participants,
}: {
  participants: Participant[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  // 필터별 카운트(탭 라벨에 노출). 전체 목록을 한 번만 순회한다.
  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = {
      all: participants.length,
      going: 0,
      maybe: 0,
      not_going: 0,
    };
    for (const p of participants) base[p.rsvp_status] += 1;
    return base;
  }, [participants]);

  const filtered =
    filter === "all"
      ? participants
      : participants.filter((p) => p.rsvp_status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {f.label} {counts[f.key]}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          해당 상태의 참여자가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((p) => {
            const profile = getProfileById(p.user_id);
            const name = profile?.display_name ?? "알 수 없음";
            return (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-2xl border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    statusBadgeClass[p.rsvp_status],
                  )}
                >
                  {rsvpLabels[p.rsvp_status]}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
