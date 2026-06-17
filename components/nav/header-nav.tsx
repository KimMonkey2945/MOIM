"use client";

import Link from "next/link";
import { CalendarHeart, Shield, User } from "lucide-react";

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

// 상단 고정 헤더. 모바일 폭 프레임 안에서 항상 노출된다(좌측 로고 + 우측 테마·프로필).
// 주요 화면 이동은 하단 탭(bottom-tab-nav)이 담당하므로 헤더 본문 링크는 두지 않는다.
export function HeaderNav({
  userLabel,
  isAdmin = false,
}: {
  userLabel?: string;
  /** 관리자(app_metadata.role==='admin')에게만 관리자 메뉴를 노출한다 */
  isAdmin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-16 border-b border-border bg-background">
      <div className="flex w-full items-center justify-between px-5">
        {/* 좌측: 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold tracking-tight"
        >
          <CalendarHeart className="h-5 w-5 text-primary" />
          Moim
        </Link>

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
                <Link href="/profile">프로필 관리</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    관리자
                  </Link>
                </DropdownMenuItem>
              )}
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
