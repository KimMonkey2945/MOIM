"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Trash2, User } from "lucide-react";

import { adminDeleteEvent } from "@/app/(app)/admin/actions";
import { formatEventDate } from "@/lib/event-display";
import { Button } from "@/components/ui/button";

// 관리자 이벤트 관리 — 전체 이벤트 목록 + 삭제(확인 후). 서버 조회 결과를 prop으로 받는다.
export type AdminEventItem = {
  id: string;
  title: string;
  event_at: string;
  status: "active" | "cancelled";
  hostName: string;
};

export function AdminEventList({ events }: { events: AdminEventItem[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, title: string) => {
    if (
      !window.confirm(`"${title}" 이벤트를 삭제할까요? 되돌릴 수 없습니다.`)
    ) {
      return;
    }
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await adminDeleteEvent(id);
      if (result.error) setError(result.error);
      setPendingId(null);
    });
  };

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">등록된 이벤트가 없습니다.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ul className="flex flex-col gap-2">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between gap-3 rounded-2xl border p-4"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">
                  {event.title}
                </span>
                {event.status === "cancelled" && (
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                    취소됨
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {event.hostName}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatEventDate(event.event_at)}
                </span>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0 text-destructive hover:text-destructive"
              disabled={isPending && pendingId === event.id}
              onClick={() => handleDelete(event.id, event.title)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              삭제
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
