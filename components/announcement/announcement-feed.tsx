"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react";

import type { Announcement } from "@/lib/mock/types";
import { getDisplayName } from "@/lib/mock/profiles";
import { formatEventDate } from "@/lib/event-display";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnnouncementForm } from "@/components/announcement/announcement-form";

// 공지 피드 — 핀 고정 우선 + 최신순. 주최자에게만 작성/수정/삭제/핀 UI를 노출한다.
// 로컬 상태로만 시뮬레이션(새로고침 시 초기화). 영속화는 Phase 3 wire-up에서 연결한다.
export function AnnouncementFeed({
  eventId,
  initialAnnouncements,
  isHost,
}: {
  eventId: string;
  initialAnnouncements: Announcement[];
  isHost: boolean;
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 핀 우선(true 먼저) → 최신순(created_at desc) 정렬. 헬퍼와 동일 규칙을 로컬에 적용.
  const sorted = [...announcements].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return b.created_at.localeCompare(a.created_at);
  });

  const handleCreate = (content: string) => {
    const now = new Date().toISOString();
    setAnnouncements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        event_id: eventId,
        author_id: "user-1", // mock 현재 사용자(주최자). Phase 3에서 getClaims().sub로 교체.
        content,
        is_pinned: false,
        created_at: now,
      },
    ]);
  };

  const handleEdit = (id: string, content: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, content } : a)),
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // 핀 단일 보장: 대상만 토글하고, 새로 핀하면 나머지는 모두 해제한다.
  const handleTogglePin = (id: string) => {
    setAnnouncements((prev) => {
      const target = prev.find((a) => a.id === id);
      const willPin = !target?.is_pinned;
      return prev.map((a) => {
        if (a.id === id) return { ...a, is_pinned: willPin };
        return willPin ? { ...a, is_pinned: false } : a;
      });
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 작성 폼 (주최자 전용) */}
      {isHost && (
        <div className="rounded-2xl border p-5">
          <h2 className="mb-3 text-base font-semibold">공지 작성</h2>
          <AnnouncementForm mode="create" onSubmit={handleCreate} />
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            아직 등록된 공지가 없습니다.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((announcement) => {
            const isEditing = editingId === announcement.id;
            return (
              <li
                key={announcement.id}
                className={cn(
                  "rounded-2xl border p-5",
                  announcement.is_pinned && "border-primary/40 bg-primary/5",
                )}
              >
                {isEditing ? (
                  <AnnouncementForm
                    mode="edit"
                    initialContent={announcement.content}
                    onSubmit={(content) => handleEdit(announcement.id, content)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/protected/events/${eventId}/announcements/${announcement.id}`}
                        className="flex items-start gap-1.5 text-base font-medium hover:underline"
                      >
                        {announcement.is_pinned && (
                          <Pin
                            className="mt-1 h-4 w-4 shrink-0 text-primary"
                            aria-label="고정됨"
                          />
                        )}
                        <span className="whitespace-pre-wrap">
                          {announcement.content}
                        </span>
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getDisplayName(announcement.author_id)} ·{" "}
                      {formatEventDate(announcement.created_at)}
                    </p>

                    {/* 주최자 전용 액션 */}
                    {isHost && (
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTogglePin(announcement.id)}
                        >
                          {announcement.is_pinned ? (
                            <>
                              <PinOff className="mr-1 h-3.5 w-3.5" />핀 해제
                            </>
                          ) : (
                            <>
                              <Pin className="mr-1 h-3.5 w-3.5" />
                              고정
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(announcement.id)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          수정
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          삭제
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
