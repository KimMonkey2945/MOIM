"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems, isNavItemActive } from "@/lib/nav-items";

// 하단 고정 탭 내비게이션. 모바일 폭 프레임(max-w-md) 안에 항상 노출되며,
// 데스크톱에서도 프레임 폭에 맞춰 화면 중앙에 고정한다(left-1/2 + -translate-x-1/2).
// 항목 정의·활성 판정 규칙은 lib/nav-items.ts에서 헤더와 공유한다.
export function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 flex h-16 w-full max-w-md -translate-x-1/2 border-t border-border bg-background">
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
