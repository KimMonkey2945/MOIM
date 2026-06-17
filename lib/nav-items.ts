import { Home, PlusCircle, LayoutDashboard, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 내비게이션 항목 단일 출처(Single Source of Truth).
// 모바일 하단 탭(bottom-tab-nav)과 데스크톱 헤더(header-nav)가 함께 소비한다.
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** 데스크톱 헤더 본문 링크 노출 여부(생략 시 true). 프로필은 헤더 드롭다운에 두므로 false. */
  showInHeader?: boolean;
}

export const navItems: NavItem[] = [
  { href: "/protected", label: "홈", icon: Home },
  { href: "/protected/events/new", label: "이벤트+", icon: PlusCircle },
  { href: "/protected/dashboard", label: "대시보드", icon: LayoutDashboard },
  {
    href: "/protected/profile",
    label: "프로필",
    icon: User,
    showInHeader: false,
  },
];

/**
 * 현재 경로 기준 내비 항목 활성 판정.
 * - 홈("/protected")은 하위 경로(/protected/events 등)와 겹치므로 정확 매칭만 활성.
 * - 그 외 항목은 prefix 매칭(해당 섹션 하위 경로 진입 시에도 활성 유지).
 */
export function isNavItemActive(itemHref: string, pathname: string): boolean {
  if (itemHref === "/protected") {
    return pathname === "/protected";
  }
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}
