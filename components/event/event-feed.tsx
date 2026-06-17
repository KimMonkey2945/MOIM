"use client";

import { useMemo, useState } from "react";

import type { EventCategory, FeedEvent } from "@/lib/types";
import { CategoryChips } from "@/components/event/category-chips";
import { EventCard } from "@/components/event/event-card";
import { SearchBar } from "@/components/event/search-bar";

// 홈 피드 클라이언트 컨테이너 — 카테고리 칩 + 제목 검색 상태를 보유하고
// 서버에서 받은 events 배열을 클라이언트 필터링한다(표시 로직은 mock 시절과 동일).
export function EventFeed({ events }: { events: FeedEvent[] }) {
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory = !category || event.category === category;
      const matchesQuery =
        !keyword || event.title.toLowerCase().includes(keyword);
      return matchesCategory && matchesQuery;
    });
  }, [events, category, query]);

  return (
    <div className="flex flex-col gap-5">
      <SearchBar value={query} onChange={setQuery} />
      <CategoryChips value={category} onChange={setCategory} />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {events.length === 0
              ? "아직 참여 중인 이벤트가 없습니다."
              : "조건에 맞는 이벤트가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
