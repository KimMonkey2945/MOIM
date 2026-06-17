import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import type { FeedEvent } from "@/lib/types";
import {
  categoryGradients,
  categoryStyles,
  formatEventDate,
} from "@/lib/event-display";
import { cn } from "@/lib/utils";
import { AvatarStack } from "@/components/event/avatar-stack";

// 홈 피드 이벤트 카드. 썸네일·카테고리 칩·제목·날짜·장소·참석자 아바타·취소 배지.
// 순수 표시용(훅 없음)이라 서버에서 렌더된다. 참석자 프로필은 서버 조인 결과를 prop으로 받는다.
export function EventCard({ event }: { event: FeedEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border transition-colors hover:border-primary/50 hover:bg-muted/30"
    >
      {/* 썸네일 / 카테고리 그라데이션 플레이스홀더 */}
      <div
        className={cn(
          "relative flex h-32 items-start justify-between bg-gradient-to-br p-3",
          categoryGradients[event.category],
        )}
      >
        {event.thumbnail_url && (
          // 외부 임의 URL이라 next/image 도메인 설정을 피해 img 사용
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.thumbnail_url}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span
          className={cn(
            "relative rounded-full px-2.5 py-0.5 text-xs font-semibold",
            categoryStyles[event.category],
          )}
        >
          {event.category}
        </span>
        {event.status === "cancelled" && (
          <span className="relative rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
            취소됨
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold tracking-tight group-hover:text-primary">
          {event.title}
        </h3>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatEventDate(event.event_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
        </div>
        <div className="mt-1">
          <AvatarStack profiles={event.goingProfiles} maxVisible={3} />
        </div>
      </div>
    </Link>
  );
}
