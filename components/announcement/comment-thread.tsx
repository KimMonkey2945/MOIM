"use client";

import { Trash2 } from "lucide-react";

import type { CommentWithAuthor } from "@/lib/types";
import {
  createComment,
  deleteComment,
} from "@/app/(app)/events/[eventId]/announcements/actions";
import { formatEventDate } from "@/lib/event-display";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/announcement/comment-form";

// 댓글 스레드(작성 오래된 순) + 작성 폼. 삭제는 본인 댓글 또는 주최자만 가능.
// 쓰기는 Server Action으로 영속화하고 revalidatePath로 서버가 목록을 다시 내려준다.
export function CommentThread({
  eventId,
  announcementId,
  comments,
  isHost,
  currentUserId,
}: {
  eventId: string;
  announcementId: string;
  comments: CommentWithAuthor[];
  isHost: boolean;
  currentUserId: string | null;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">댓글 {comments.length}</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comments.map((comment) => {
            const name = comment.author?.display_name ?? "알 수 없음";
            // 삭제 권한: 본인 댓글 또는 주최자(타인 댓글 모더레이션).
            const canDelete = comment.author_id === currentUserId || isHost;
            return (
              <li
                key={comment.id}
                className="flex items-start justify-between gap-3 rounded-2xl border p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-muted-foreground">
                      {name} · {formatEventDate(comment.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">
                      {comment.content}
                    </p>
                  </div>
                </div>
                {canDelete && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:text-destructive"
                    aria-label="댓글 삭제"
                    onClick={() =>
                      deleteComment(eventId, announcementId, comment.id)
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <CommentForm
        onSubmit={(content) => createComment(eventId, announcementId, content)}
      />
    </section>
  );
}
