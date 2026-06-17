"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems, isNavItemActive } from "@/lib/nav-items";

// 모바일 하단 고정 탭 내비게이션 (375px 기준). 데스크톱(md+)에서는 md:hidden으로 숨긴다.
// 항목 정의·활성 판정 규칙은 lib/nav-items.ts에서 헤더와 공유한다.
export function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-border bg-background md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
