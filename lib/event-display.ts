import type { EventCategory, RsvpStatus } from "@/lib/types";

// 이벤트/RSVP 화면 표시에 공통으로 쓰는 포맷·색상 매핑.
// Phase 3 wire-up 후에도 표시 규칙은 그대로 재사용한다(데이터 소스만 교체).

/** 요일 인덱스(0=일) → 한글 약칭. Intl 로케일 데이터에 의존하지 않기 위해 직접 매핑. */
const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

/**
 * event_at(UTC ISO) → 한국어 날짜·시간 문자열 (예: "6월 20일 (토) 오전 10:00")
 *
 * 오전/오후·요일 같은 로케일 텍스트는 서버(Node ICU)와 브라우저(V8 ICU)에서
 * "오전" vs "AM"으로 갈려 hydration mismatch를 일으킨다. 따라서 숫자 parts만
 * Intl(en-CA, h23)로 KST 변환해 뽑고, 한글 라벨은 코드에서 결정적으로 조립한다.
 */
export function formatEventDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  // en-CA weekday("Sat") → 인덱스 → 한글. 환경 무관하게 영어 약칭은 동일하다.
  const EN_WEEKDAY: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = WEEKDAY_KO[EN_WEEKDAY[get("weekday")] ?? 0];

  const hour24 = Number(get("hour"));
  const period = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${Number(get("month"))}월 ${Number(get("day"))}일 (${weekday}) ${period} ${hour12}:${get("minute")}`;
}

/** event_at(UTC ISO) → `<input type="date">` 값(YYYY-MM-DD, KST 기준) */
export function toDateInputValue(iso: string): string {
  return formatKstParts(iso).date;
}

/** event_at(UTC ISO) → `<input type="time">` 값(HH:mm, KST 기준) */
export function toTimeInputValue(iso: string): string {
  return formatKstParts(iso).time;
}

/** date(YYYY-MM-DD) + time(HH:mm) KST 입력값 → UTC ISO 문자열 */
export function fromDateTimeInputs(date: string, time: string): string {
  // KST(+09:00) 기준 입력을 명시해 UTC로 정규화한다.
  return new Date(`${date}T${time}:00+09:00`).toISOString();
}

function formatKstParts(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/** 카테고리별 칩/배지 색상 클래스 (라이트·다크 토큰 대응) */
export const categoryStyles: Record<EventCategory, string> = {
  운동: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  친목: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  스터디: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  기타: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

/** 썸네일이 없을 때 히어로/카드 플레이스홀더에 쓰는 카테고리별 그라데이션 */
export const categoryGradients: Record<EventCategory, string> = {
  운동: "from-emerald-400 to-teal-500",
  친목: "from-amber-400 to-orange-500",
  스터디: "from-sky-400 to-indigo-500",
  기타: "from-zinc-400 to-slate-500",
};

/** 모든 카테고리(칩 필터 순회용) */
export const ALL_CATEGORIES: EventCategory[] = [
  "운동",
  "친목",
  "스터디",
  "기타",
];

/** RSVP 상태별 한국어 라벨 */
export const rsvpLabels: Record<RsvpStatus, string> = {
  going: "참석",
  maybe: "미정",
  not_going: "불참",
};
