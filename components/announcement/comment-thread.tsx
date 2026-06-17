"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import type { MockComment } from "@/lib/mock/types";
import { getDisplayName, MOCK_CURRENT_USER_ID } from "@/lib/mock/profiles";
import { formatEventDate } from "@/lib/event-display";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/announcement/comment-form";

// 댓글 스레드(작성 오래된 순) + 작성 폼. 삭제는 본인 댓글 또는 주최자만 가능.
// 로컬 상태로만 시뮬레이션(새로고침 시 초기화). 영속화는 Phase 3 wire-up에서 연결한다.
export function CommentThread({
  announcementId,
  initialComments,
  isHost,
}: {
  announcementId: string;
  initialComments: MockComment[];
  isHost: boolean;
}) {
  const [comments, setComments] = useState(initialComments);

  const handleCreate = (content: string) => {
    const now = new Date().toISOString();
    setComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        announcement_id: announcementId,
        author_id: MOCK_CURRENT_USER_ID, // Phase 3에서 getClaims().sub로 교체.
        content,
        created_at: now,
      },
    ]);
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">댓글 {comments.length}</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comments.map((comment) => {
            const name = getDisplayName(comment.author_id);
            // 삭제 권한: 본인 댓글 또는 주최자(타인 댓글 모더레이션).
            const canDelete =
              comment.author_id === MOCK_CURRENT_USER_ID || isHost;
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
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <CommentForm onSubmit={handleCreate} />
    </section>
  );
}
