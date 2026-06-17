"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems, isNavItemActive } from "@/lib/nav-items";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 데스크톱(md+) 상단 고정 헤더 내비게이션. 모바일에서는 hidden md:flex로 숨긴다.
// 항목 정의·활성 판정은 lib/nav-items.ts에서 하단 탭과 공유한다.
// 헤더 본문 링크 노출 여부는 NavItem.showInHeader로 제어한다(프로필은 우측 드롭다운에 위치).
const headerLinks = navItems.filter((item) => item.showInHeader !== false);

export function HeaderNav({ userLabel }: { userLabel?: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden h-16 border-b border-border bg-background md:flex">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5">
        {/* 좌측: 로고 + 주요 링크 */}
        <div className="flex items-center gap-6">
          <Link
            href="/protected"
            className="flex items-center gap-2 text-base font-bold tracking-tight"
          >
            <CalendarHeart className="h-5 w-5 text-primary" />
            Moim
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {headerLinks.map((item) => {
              const active = isNavItemActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    active
                      ? "font-semibold text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 우측: 테마 전환 + 프로필 드롭다운 */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="max-w-[12rem] truncate">
                  {userLabel ?? "프로필"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="truncate">
                {userLabel ?? "내 계정"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/protected/profile">프로필 관리</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-1">
                <LogoutButton />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
