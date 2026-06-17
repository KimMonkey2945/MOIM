"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react";

import type { AnnouncementWithAuthor } from "@/lib/types";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
} from "@/app/(app)/events/[eventId]/announcements/actions";
import { formatEventDate } from "@/lib/event-display";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnnouncementForm } from "@/components/announcement/announcement-form";

// 공지 피드 — 핀 고정 우선 + 최신순. 주최자에게만 작성/수정/삭제/핀 UI를 노출한다.
// 쓰기는 Server Action으로 영속화하고 revalidatePath로 서버가 목록을 다시 내려준다.
export function AnnouncementFeed({
  eventId,
  announcements,
  isHost,
}: {
  eventId: string;
  announcements: AnnouncementWithAuthor[];
  isHost: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // 서버가 핀 우선·최신순으로 정렬해 내려주지만, 방어적으로 한 번 더 정렬한다.
  const sorted = [...announcements].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return b.created_at.localeCompare(a.created_at);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* 작성 폼 (주최자 전용) */}
      {isHost && (
        <div className="rounded-2xl border p-5">
          <h2 className="mb-3 text-base font-semibold">공지 작성</h2>
          <AnnouncementForm
            mode="create"
            onSubmit={(content) => createAnnouncement(eventId, content)}
          />
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
            const authorName =
              announcement.author?.display_name ?? "알 수 없음";
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
                    onSubmit={async (content) => {
                      const result = await updateAnnouncement(
                        eventId,
                        announcement.id,
                        content,
                      );
                      if (!result.error) setEditingId(null);
                      return result;
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/events/${eventId}/announcements/${announcement.id}`}
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
                      {authorName} · {formatEventDate(announcement.created_at)}
                    </p>

                    {/* 주최자 전용 액션 */}
                    {isHost && (
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            togglePin(
                              eventId,
                              announcement.id,
                              !announcement.is_pinned,
                            )
                          }
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
                          onClick={() =>
                            deleteAnnouncement(eventId, announcement.id)
                          }
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
