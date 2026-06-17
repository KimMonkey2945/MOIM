"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const COMMENT_MAX = 500;

// 댓글 작성 폼. 빈 댓글은 차단하고, 제출은 상위(CommentThread)가 로컬 상태로 처리한다.
export function CommentForm({
  onSubmit,
}: {
  onSubmit: (content: string) => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("댓글 내용을 입력해 주세요.");
      return;
    }
    onSubmit(trimmed);
    setContent("");
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={content}
        maxLength={COMMENT_MAX}
        placeholder="댓글을 입력하세요"
        aria-label="댓글 작성"
        className="min-h-[60px]"
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          댓글 등록
        </Button>
      </div>
    </form>
  );
}
