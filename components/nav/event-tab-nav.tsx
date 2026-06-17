"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

// 이벤트 상세 내부 탭(공지/카풀/정산/수정) 내비게이션.
// usePathname으로 현재 탭을 활성 강조한다(Server Component인 상세 페이지에서 분리).
export function EventTabNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/events/${eventId}/announcements`, label: "공지" },
    { href: `/events/${eventId}/carpools`, label: "카풀" },
    { href: `/events/${eventId}/expenses`, label: "정산" },
    { href: `/events/${eventId}/edit`, label: "수정" },
  ];

  return (
    <nav className="flex gap-4 border-b text-sm">
      {tabs.map((tab) => {
        // 탭 하위 경로(예: 공지 상세)에서도 활성 유지되도록 prefix 매칭
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "pb-2",
              active
                ? "border-b-2 border-primary font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
