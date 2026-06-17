import type { PublicProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

// 참석자 아바타 겹침 표시(+N명). 카드(소)·상세(대) 공용 프레젠테이션 컴포넌트.
// avatar_url이 null이면 display_name 첫 글자 이니셜로 폴백한다.
// 순수 표시용이라 서버/클라이언트 어디서든 렌더 가능(훅 없음).
// 데이터 소스 주입: 서버에서 조인한 프로필 배열을 prop으로 받는다(N+1 방지).
export function AvatarStack({
  profiles,
  maxVisible = 4,
  size = "sm",
  className,
}: {
  /** 표시할 프로필 목록(보통 참석자) */
  profiles: PublicProfile[];
  /** 아바타로 노출할 최대 인원, 초과분은 +N으로 합산 */
  maxVisible?: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const total = profiles.length;
  const visible = profiles.slice(0, maxVisible);
  const overflow = total - visible.length;

  const sizeClass = size === "lg" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";

  if (total === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        아직 참석자가 없습니다
      </p>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-2">
        {visible.map((profile) => {
          const name = profile.display_name ?? "?";
          const initial = name.charAt(0).toUpperCase();
          return (
            <div
              key={profile.id}
              title={name}
              className={cn(
                "flex items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted font-semibold text-muted-foreground",
                sizeClass,
              )}
            >
              {profile.avatar_url ? (
                // 외부 임의 URL 미리보기라 next/image 도메인 설정을 피해 img 사용
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
          );
        })}
        {overflow > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full border-2 border-background bg-secondary font-semibold text-secondary-foreground",
              sizeClass,
            )}
          >
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-sm text-muted-foreground">{total}명 참석</span>
    </div>
  );
}
