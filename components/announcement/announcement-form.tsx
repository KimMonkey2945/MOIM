"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const CONTENT_MAX = 1000;

// 공지 작성/수정 공용 폼(주최자 전용). 제출/취소는 상위(AnnouncementFeed)가 처리한다.
// onSubmit은 Server Action을 호출하며 실패 시 에러 메시지를 반환한다.
export function AnnouncementForm({
  mode,
  initialContent = "",
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initialContent?: string;
  onSubmit: (content: string) => Promise<{ error: string | null }>;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("공지 내용을 입력해 주세요.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(trimmed);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (mode === "create") setContent("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={content}
        maxLength={CONTENT_MAX}
        placeholder={
          mode === "create" ? "새 공지를 작성하세요" : "공지 내용을 수정하세요"
        }
        aria-label={mode === "create" ? "공지 작성" : "공지 수정"}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {mode === "create" ? "공지 등록" : "수정 저장"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
