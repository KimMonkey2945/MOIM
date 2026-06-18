"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Tables } from "@/lib/database.types";
import type { EventCategory } from "@/lib/types";
import {
  createEvent,
  updateEvent,
  cancelEvent,
} from "@/app/(app)/events/actions";
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
import { ImageUpload } from "@/components/image-upload";
import { cn } from "@/lib/utils";

const TITLE_MAX = 80;
const COVER_MAX_BYTES = 5 * 1024 * 1024; // 5MB (event-covers 버킷 정책과 일치)

// 이벤트 생성/수정 공용 폼. mode로 분기하고 initialEvent로 수정 프리필한다.
// 제출은 Server Action(createEvent/updateEvent)으로 영속화하고 상세로 이동한다.
export function EventForm({
  mode,
  initialEvent,
  userId,
  className,
}: {
  mode: "create" | "edit";
  initialEvent?: Tables<"events">;
  userId: string;
  className?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

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

    // 입력값을 PRD 8.2 events 컬럼 형태로 정규화(빈 문자열 → null).
    const normalized = {
      title: title.trim(),
      description: description.trim() || null,
      category,
      event_at: fromDateTimeInputs(date, time),
      location: location.trim(),
      thumbnail_url: thumbnailUrl.trim() || null,
    };

    setIsLoading(true);
    // 성공 시 Server Action이 상세로 redirect한다. 실패 시 error만 반환된다.
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEvent(normalized)
          : await updateEvent(initialEvent!.id, normalized);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    });
  };

  // 이벤트 취소(주최자 전용). 취소 후 상세로 이동하며 상태 배지가 표기된다.
  const handleCancelEvent = () => {
    if (!initialEvent) return;
    setError(null);
    setIsLoading(true);
    startTransition(async () => {
      const result = await cancelEvent(initialEvent.id);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    });
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
                <Label>커버 이미지</Label>
                <ImageUpload
                  shape="rect"
                  bucket="event-covers"
                  userId={userId}
                  maxBytes={COVER_MAX_BYTES}
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                />
                <Label htmlFor="thumbnail" className="mt-2">
                  커버 URL (직접 입력)
                </Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={thumbnailUrl}
                  placeholder="https://example.com/cover.png (선택)"
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  이미지를 업로드하거나 외부 이미지 URL을 직접 입력할 수
                  있습니다 (선택).
                </p>
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

              {mode === "edit" && initialEvent?.status === "active" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCancelEvent}
                  disabled={isLoading}
                >
                  이벤트 취소
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
