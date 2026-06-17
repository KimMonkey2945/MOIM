"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

// 제목 키워드 검색 입력. 제어 컴포넌트 — 상태는 상위(EventFeed)가 보유.
export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        placeholder="이벤트 제목 검색"
        aria-label="이벤트 제목 검색"
        className="pl-9"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
