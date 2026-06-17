"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { EventCategory, MockEvent } from "@/lib/mock/types";
import {
  ALL_CATEGORIES,
  fromDateTimeInputs,
  toDateInputValue,
  toTimeInputValue,
} from "@/lib/event-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TITLE_MAX = 80;

// 이벤트 생성/수정 공용 폼. mode로 분기하고 initialEvent로 수정 프리필한다.
// 제출은 no-op(로컬 검증 후 상세로 이동) — 영속화는 Phase 3 Server Action으로 교체한다.
export function EventForm({
  mode,
  initialEvent,
  className,
}: {
  mode: "create" | "edit";
  initialEvent?: MockEvent;
  className?: string;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [description, setDescription] = useState(
    initialEvent?.description ?? "",
  );
  const [date, setDate] = useState(
    initialEvent ? toDateInputValue(initialEvent.event_at) : "",
  );
  const [time, setTime] = useState(
    initialEvent ? toTimeInputValue(initialEvent.event_at) : "",
  );
  const [location, setLocation] = useState(initialEvent?.location ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialEvent?.thumbnail_url ?? "",
  );
  const [category, setCategory] = useState<EventCategory>(
    initialEvent?.category ?? "운동",
  );

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── 클라이언트 유효성 (Phase 3에서 Server Action 검증과 이중화) ──────────
    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (title.trim().length > TITLE_MAX) {
      setError(`제목은 ${TITLE_MAX}자 이하로 입력해 주세요.`);
      return;
    }
    if (!date || !time) {
      setError("날짜와 시간을 입력해 주세요.");
      return;
    }
    if (!location.trim()) {
      setError("장소를 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 입력값을 PRD 8.2 events 컬럼 형태로 정규화(빈 문자열 → null).
      const normalized = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        event_at: fromDateTimeInputs(date, time),
        location: location.trim(),
        thumbnail_url: thumbnailUrl.trim() || null,
      };

      // ── Phase 3 wire-up 지점 ───────────────────────────────────────────
      // mode === "create": createEvent(normalized) → 반환 id로 이동
      // mode === "edit":   updateEvent(initialEvent.id, normalized)
      // 현재는 mock 흐름: 수정은 해당 상세로, 생성은 대표 mock 이벤트로 이동.
      // ──────────────────────────────────────────────────────────────────
      void normalized;
      const targetId = initialEvent?.id ?? "event-1";
      router.push(`/protected/events/${targetId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === "create" ? "이벤트 생성" : "이벤트 수정"}
          </CardTitle>
          <CardDescription>
            모임 정보를 입력합니다. 제목·날짜·장소는 필수입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={title}
                  maxLength={TITLE_MAX}
                  placeholder="예: 주말 한강 수영 모임"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/{TITLE_MAX}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={description}
                  placeholder="모임을 소개해 주세요 (선택)"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date">날짜</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">시간</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  value={location}
                  placeholder="예: 잠실 한강수영장"
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">카테고리</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="thumbnail">썸네일 URL</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={thumbnailUrl}
                  placeholder="https://example.com/cover.png (선택)"
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading
                    ? "처리 중..."
                    : mode === "create"
                      ? "생성"
                      : "수정 저장"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  취소
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
