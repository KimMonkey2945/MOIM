# Moim (모임) 개발 로드맵

> 소모임 주최자가 공지·참여·카풀·정산을 한 화면에서 처리하는 원스톱 이벤트 관리 웹의 MVP 개발 계획서

- **제품명:** Moim (모임)
- **PRD:** [`./PRD.md`](./PRD.md)
- **작성일:** 2026-06-16
- **최종 업데이트:** 2026-06-17
- **개발 형태:** 솔로 개발자, 각 Phase는 독립 배포 가능 상태를 목표
- **기술 스택:** Next.js(App Router) + Supabase(Auth/DB/RLS) + TypeScript + shadcn/ui(new-york) + Tailwind v3

> **🔄 이번 개정 사유 (UI 우선 재구성):** "UI/UX를 빠르게 먼저 만들어 보완할 부분을 찾아 개선"하려는 목표에 따라, **데이터베이스 스키마·Supabase 설정 작업을 Phase 2 직후의 통합 단계로 일괄 이동**했다. Phase 0~2는 실제 DB 없이 **mock 데이터(`lib/mock/*.ts`)** 로 화면부터 구축하고, **Phase 3(데이터베이스 & Supabase 통합)** 에서 모든 스키마·RLS를 한 번에 만들고 mock UI를 실데이터로 연결(wire-up)한다. 이후 카풀·정산·대시보드는 DB 토대 위에서 "화면 먼저 → 데이터 연결" 흐름의 풀스택으로 진행한다.

---

## 개요

Moim은 소모임 주최자(페르소나 A)와 참여자(페르소나 B)를 위한 원스톱 이벤트 관리 도구로 다음 기능을 제공합니다:

- **모임 + RSVP**: 이벤트 생성·수정과 참석/불참/미정 원클릭 응답 (E-01~E-08)
- **공지 + 댓글**: 단일 피드 공지와 댓글 스레드, 핀 고정 (N-01~N-05)
- **카풀 매칭**: 운전자 등록 → 탑승 신청 → 승인/거절 플로우 (C-01~C-06)
- **정산**: 비용 입력과 균등/차등 분배 자동 계산, 송금 완료 체크 (X-01~X-06)
- **주최자 대시보드**: RSVP·미승인 카풀·미정산을 한 화면에서 파악 (D-01~D-05)

기존 자산: 이메일/비밀번호 · Google OAuth · 이메일 OTP 인증 완성, `profiles` 테이블, `/protected` 보호 라우트, Server Actions, Suspense 패턴.

**개발 전략(UI 우선):** 화면을 먼저 만들어 사용자 플로우와 정보 구조를 빠르게 검증한 뒤, 검증이 끝난 UI 가정을 토대로 스키마를 한 번에 설계·연결한다. 이렇게 하면 잦은 스키마 변경을 줄이고, mock 단계에서 드러난 필드 누락·과잉을 실 스키마에 정확히 반영할 수 있다.

---

## 전체 진행 현황

| Phase   | 제목                                      | 데이터        | 핵심 기능 ID  | 진행   | 상태                  |
| ------- | ----------------------------------------- | ------------- | ------------- | ------ | --------------------- |
| Phase 0 | UI 토대 (내비 · 레이아웃 · 디자인 시스템) | mock          | A-04          | ✅ 6/6 | **완료**              |
| Phase 1 | 모임 + RSVP **UI**                        | mock          | E-01~E-08     | ✅ 5/5 | **완료** (E2E 보류)   |
| Phase 2 | 공지 + 댓글 **UI**                        | mock          | N-01~N-05     | ✅ 3/3 | **완료** (E2E 보류)   |
| Phase 3 | **데이터베이스 & Supabase 통합**          | 실데이터 전환 | A-04·E·N 전체 | ✅ 5/5 | **완료** (E2E 보류)   |
| Phase 4 | 카풀 매칭 (풀스택)                        | 실데이터      | C-01~C-06     | — 0/4  | **보류** (구현 안 함) |
| Phase 5 | 정산 (풀스택)                             | 실데이터      | X-01~X-06     | — 0/4  | **보류** (구현 안 함) |
| Phase 6 | 주최자 대시보드 (풀스택)                  | 실데이터      | D-01~D-05     | — 0/5  | **보류** (구현 안 함) |
| Phase 7 | **관리자 & 사용자 제재**                  | 실데이터      | 운영 기능     | ✅ 4/4 | **완료** (E2E 보류)   |

**📊 진행 상황:** Phase 0~3 + Phase 7 완료 (23/23, Phase 4~6 보류). 카풀·정산·대시보드 제외 전 기능 동작

### Phase 의존성 그래프

```
Phase 0 (UI 토대 · mock)
   │
   ▼
Phase 1 (모임 + RSVP UI · mock)
   │
   ▼
Phase 2 (공지 + 댓글 UI · mock)
   │
   ▼
Phase 3 (데이터베이스 & Supabase 통합)  ← 미뤄둔 모든 스키마·RLS 일괄 생성 + mock→실데이터 wire-up
   │
   ├──────────┬──────────┐
   ▼          ▼          ▼
Phase 4     Phase 5    (상호 독립, 순서 자유)
(카풀)      (정산)        각 단계도 "화면 먼저 → 데이터 연결"
   │          │
   └──────────┘
        ▼
   Phase 6 (대시보드)  ← RSVP·카풀·정산 집계에 의존 (마지막)
```

- **Phase 0 → 1 → 2**: mock 데이터로 화면을 쌓아 올린다. DB 없이 클릭 가능한 프로토타입을 완성 (M1).
- **Phase 2 → 3**: UI가 충분히 검증되어 필드가 안정화된 시점에 스키마를 일괄 생성하고 mock UI를 실데이터/Server Action으로 교체 (M2).
- **Phase 3 → 4·5**: DB 토대가 마련되면 카풀·정산은 풀스택으로 진행. 서로 독립.
- **4·5 → 6**: 대시보드 위젯이 RSVP·카풀·정산 집계를 읽으므로 마지막에 배치.

---

## 마일스톤 / 릴리스 기준

| 마일스톤                                  | 완료 Phase      | 릴리스 기준 (Definition of Release)                                                                           |
| ----------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| **M1 — 클릭 가능한 UI 프로토타입 (mock)** | Phase 0 + 1 + 2 | 로그인 후 내비로 전 화면 순회, 이벤트/공지/댓글 화면이 mock 데이터로 렌더·인터랙션(로컬 상태) 동작. 실DB 없음 |
| **M2 — DB 연동된 첫 동작 버전**           | Phase 3         | 전체 스키마·RLS 생성, mock UI가 실제 Supabase 데이터/Server Action으로 동작. 이벤트·RSVP·공지·댓글 영속화     |
| **M3 — 카풀 + 정산 풀스택**               | Phase 4 + 5     | 카풀 신청·승인, 비용 분배·송금 체크까지 실데이터로 완결                                                       |
| **M4 — MVP 출시**                         | Phase 6         | 주최자 대시보드 포함 전체 기능 통합, KPI 측정 가능                                                            |

---

## 개발 워크플로우

각 Task는 아래 루프를 따른다. **테스트 통과가 완료(✅)의 전제 조건이다.**

1. **작업 계획** — 기존 코드베이스 파악, 이 ROADMAP의 다음 우선순위 Task 선택
2. **작업 생성** — `/tasks/XXX-description.md` 생성 (고수준 명세, 관련 파일, 수락 기준, 구현 단계, **테스트 체크리스트**)
3. **작업 구현** — 명세 구현
   - **Phase 0~2(UI):** 실제 DB 없이 `lib/mock/*.ts`의 정적 데이터로 렌더. 인터랙션은 임시 no-op 또는 로컬 상태(`useState`)로 시뮬레이션. mock 타입은 PRD 8장 스키마에 맞춰 미리 정의해 둔다.
   - **Phase 3+:** 스키마 변경 시 `generate_typescript_types`로 `lib/database.types.ts` 재생성, 쓰기 작업은 Server Action으로 처리
4. **검증 (필수)**
   - `npm run lint` + `npm run build`(타입 체크 포함) 통과
   - (Phase 3+) Supabase MCP `list_tables` / `get_advisors`로 스키마·RLS 점검
   - **Playwright MCP로 E2E 테스트 수행** — UI는 화면 렌더·플로우·반응형, API 연동·비즈니스 로직은 정상 경로 + 에러/예외 + 엣지 케이스까지 검증
   - 테스트 실패 시 수정 후 재테스트, **통과 전에는 ✅ 금지**
5. **로드맵 업데이트** — 완료 Task와 하위 체크리스트에 ✅, 진행률 갱신

> **테스트 원칙 (강제 규칙)**
>
> - 모든 기능 테스트(E2E·통합·UI 플로우)는 **Playwright MCP**로 수행한다.
> - UI(mock) Task도 화면 렌더·네비게이션·반응형·로컬 상태 인터랙션을 Playwright로 검증한다.
> - API 연동·비즈니스 로직(RSVP 토글, 카풀 좌석, 정산 분배 등)은 정상/에러/엣지 케이스를 모두 검증한다.
> - 각 구현 Task 파일에 **"## 테스트 체크리스트"** 섹션과 구체적 Playwright 시나리오를 작성한다.
> - 테스트를 수행하지 않았거나 실패한 Task는 완료로 표시하지 않는다.

---

## 개발 단계

### Phase 0 — UI 토대 (내비 · 레이아웃 · 디자인 시스템) ✅ — **완료**

> **목표:** 로그인 후 전체 앱을 돌아다닐 수 있는 내비게이션 셸, 공통 레이아웃, 디자인 시스템, PRD 라우트 트리(6.1) 전체의 빈 껍데기를 **실제 DB 없이** 완성한다. 구조 우선 + UI 우선 접근.
> **데이터:** mock (`lib/mock/*.ts`) / 로컬 상태 · **선행:** 없음(기존 인증 자산 활용) · **후행:** Phase 1
> **참고:** display_name 마이그레이션·RLS 설정은 **Phase 3로 이동**. 여기서는 프로필 화면을 mock/로컬 상태로만 구현한다.

- [x] **Task 000: 라우트 트리 전체 스캐폴딩 + mock 데이터 토대** ✅ `A-04` `P1`
  - 산출물: PRD 6.1 라우트 트리의 모든 페이지 빈 껍데기 — `app/protected/page.tsx`, `app/protected/dashboard/page.tsx`, `app/protected/events/new/page.tsx`, `app/protected/events/[eventId]/page.tsx`, `.../edit/page.tsx`, `.../announcements/page.tsx`, `.../announcements/[annoId]/page.tsx`, `.../carpools/page.tsx`, `.../expenses/page.tsx`, `app/protected/profile/page.tsx`
  - 산출물: `lib/mock/types.ts`(PRD 8.2 핵심 필드에 맞춘 mock 타입 정의), `lib/mock/events.ts`, `lib/mock/participants.ts`, `lib/mock/announcements.ts`, `lib/mock/comments.ts`, `lib/mock/profiles.ts`
  - mock 타입은 향후 생성될 `Tables<"...">`와 정렬되도록 PRD 8장 컬럼명을 그대로 사용 (스키마 드리프트 방지)
  - **DoD:** 모든 라우트가 404 없이 빈 화면이라도 렌더, mock 데이터 import 가능
  - **## 테스트 체크리스트 (Playwright):** 각 라우트 직접 진입 시 200·렌더 / 존재하지 않는 하위 경로 404 / mock 데이터가 화면에 노출되는 임시 더미 표시 확인

- [x] **Task 001: 디자인 시스템 & 공통 스타일 (PRD 7장)** ✅
  - 산출물: `app/globals.css`(컬러 토큰·`--primary` 커스터마이징), `components/ui/`(필요 프리미티브 추가), `docs/guides/styling-guide.md` 반영
  - 타이포 스케일(페이지/섹션/카드 제목·보조 텍스트), `rounded-2xl` 카드 스타일, `gap-6`/`p-5` 여백 원칙, Skeleton 로딩, 다크모드 토큰
  - 카드·칩·KPI 등 반복 시각 요소의 기준 클래스 확립
  - **DoD:** 디자인 토큰·타이포·카드 스타일이 전역 적용, 라이트/다크 전환 정상
  - **## 테스트 체크리스트 (Playwright):** 샘플 카드 렌더·타이포 클래스 적용 / 다크모드 토글 시 색상 토큰 전환 / 375·768·1280px 반응형 여백 확인

- [x] **Task 002: 모바일 하단 탭 내비게이션** ✅
  - 산출물: `components/nav/bottom-tab-nav.tsx`
  - `[홈] [이벤트+] [대시보드] [프로필]` 4개 탭, 고정 `h-16`, 활성 탭 강조색
  - `usePathname`으로 활성 상태 표시, lucide-react 아이콘, `md:hidden`
  - **DoD:** 375px 뷰포트에서 하단 고정, 탭 클릭 시 해당 라우트 이동
  - **## 테스트 체크리스트 (Playwright):** 375px에서 하단 고정 노출 / 4개 탭 각각 라우트 이동 / 활성 탭 강조 / 1280px에서 미노출(md:hidden)

- [x] **Task 003: 데스크톱 상단 헤더 내비게이션** ✅
  - 산출물: `components/nav/header-nav.tsx`
  - `[로고] [홈] [대시보드] … [프로필 드롭다운▾]` 구조, `hidden md:flex`
  - 기존 `ThemeSwitcher`, 프로필 드롭다운(로그아웃 포함) 통합
  - **DoD:** 1280px 뷰포트에서 상단 헤더 노출, 내비 링크·로그아웃 동작
  - **## 테스트 체크리스트 (Playwright):** 1280px 헤더 노출 / 내비 링크 이동 / 드롭다운 열림·로그아웃 동작 / 375px 미노출

- [x] **Task 004: 공통 레이아웃 통합 (`/protected/layout.tsx`)** ✅
  - 산출물: `app/protected/layout.tsx`
  - 데스크톱 헤더 + 모바일 하단 탭 배치, 본문 `pb-16 md:pb-0`
  - claims 검증 후 미인증 시 `redirect("/auth/login")` 유지 (기존 인증 자산)
  - **DoD:** 모든 `/protected/*` 페이지에 내비 일관 적용, 반응형 전환 정상
  - **## 테스트 체크리스트 (Playwright):** 로그인 후 전 페이지 내비 일관 노출 / 비로그인 `/protected` 직접 접근 시 `/auth/login` 리다이렉트 / 375↔1280 내비 전환

- [x] **Task 005: 프로필 화면 UI (display_name · mock/로컬 상태)** ✅ `A-04` `P1`
  - 산출물: `app/protected/profile/page.tsx`, `components/profile-form.tsx`
  - 닉네임(`display_name`)·아바타 수정 폼 UI. **실 저장 없이** 로컬 상태/no-op Server Action으로 인터랙션 시뮬레이션
  - 빈 문자열 `null` 변환 등 입력 규칙은 UI 레벨에서 미리 반영 (Phase 3 wire-up 대비)
  - **DoD:** 프로필 폼 렌더·입력·검증 UI 동작 (영속화는 Phase 3)
  - **## 테스트 체크리스트 (Playwright):** 폼 필드 렌더·입력 / 저장 클릭 시 로컬 상태 반영(낙관적 UI) / 빈 닉네임 처리 / 아바타 미리보기

**Phase 0 검증**

- `npm run lint` + `npm run build` 통과
- **Playwright E2E:** 로그인 → 하단 탭/헤더로 전 페이지 순회 / 비로그인 `/protected` 차단 / 프로필 폼 로컬 동작 / 모바일(375px)·데스크톱(1280px) 내비 전환 → **M1 진행 시작점**

---

### Phase 1 — 모임 + RSVP **UI** (mock) ✅ — **완료** (Playwright E2E 보류)

> **목표:** 이벤트 생성·피드·상세·RSVP의 핵심 화면을 **mock 데이터**로 완성한다. 클릭 가능한 프로토타입으로 정보 구조와 플로우를 검증한다.
> **데이터:** mock (`lib/mock/events.ts`, `participants.ts`) / 로컬 상태 · **선행:** Phase 0 · **후행:** Phase 2

- [x] **Task 006: 이벤트 생성/수정 폼 UI** ✅ `E-01` `E-02` `P0`
  - 산출물: `app/protected/events/new/page.tsx`, `app/protected/events/[eventId]/edit/page.tsx`, `components/event/event-form.tsx`
  - 제목·설명·날짜·시간·장소·썸네일·카테고리(운동/친목/스터디/기타) 입력 폼
  - 제출은 **no-op 또는 로컬 상태 추가** 후 상세로 이동(mock). 수정/취소 폼 재사용 구조
  - **DoD:** 폼 렌더·유효성 UI 동작, 제출 시 mock 흐름으로 상세 이동
  - **## 테스트 체크리스트 (Playwright):** 정상 입력→상세 이동(mock) / 필수값 누락 유효성 에러 / 과거 날짜·초장문 제목 경계값 UI / 수정 폼 기존값 프리필 / 취소 상태 배지 표기

- [x] **Task 007: 홈 피드 — 이벤트 카드 목록 UI** ✅ `E-03` `E-07` `E-08` `P0/P1`
  - 산출물: `app/protected/page.tsx`, `components/event/event-card.tsx`, `components/event/category-chips.tsx`, `components/event/search-bar.tsx`
  - mock 이벤트 카드 그리드(썸네일·카테고리 칩·제목·날짜·장소·아바타 스택·RSVP 배지)
  - 카테고리 칩 필터(P1)·제목 키워드 검색(P1)은 mock 배열 필터링, Suspense + Skeleton
  - **DoD:** mock 카드 렌더, 클라이언트 필터·검색 동작
  - **## 테스트 체크리스트 (Playwright):** 카드 렌더·정보 표시 / 빈 상태(mock 0건) UI / 카테고리 필터 결과 일치 / 검색 키워드 매칭·미매칭(빈 결과)

- [x] **Task 008: 이벤트 상세 + 탭 골격 UI** ✅ `E-04` `E-06` `P0`
  - ⚠️ 산출물 변경: `event-tabs.tsx` 신규 생성 대신 기존 route 기반 `components/nav/event-tab-nav.tsx` 재사용
  - 산출물: `app/protected/events/[eventId]/page.tsx`, `components/event/event-tabs.tsx`, `components/event/participant-list.tsx`
  - 히어로 배너 + 이벤트 정보 + 탭 내비(공지/카풀/정산 — 빈 탭 골격), 참여자 목록 RSVP 상태별 필터(mock)
  - **DoD:** mock 상세·참여자 목록 표시, 탭 전환 동작(내용은 후속)
  - **## 테스트 체크리스트 (Playwright):** 상세 렌더 / 존재하지 않는 mock eventId 빈/404 처리 / 탭 전환 / 참여자 RSVP 상태별 필터 카운트 일치

- [x] **Task 009: RSVP 3-segment 컨트롤 UI (로컬 상태)** ✅ `E-05` `P0`
  - 산출물: `components/event/rsvp-control.tsx`
  - 참석 ✓ / 미정 ? / 불참 ✗ 세그먼트, 클릭 시 **로컬 상태 즉시 반영**(낙관적 UI). 영속화는 Phase 3
  - **DoD:** RSVP 변경이 UI에 즉시 반영(로컬)
  - **## 테스트 체크리스트 (Playwright):** 미응답→참석→불참→미정 순차 토글 UI 반영 / 동일 상태 재클릭 멱등 / 선택 강조 스타일

- [x] **Task 010: 참여자 아바타 스택 + 참여자 목록** ✅ `E-06` `P0`
  - 산출물: `components/event/avatar-stack.tsx`
  - 참석자 아바타 겹침 표시 + `+N명 참석`, 카드/상세 공용(mock)
  - **DoD:** mock 참석 인원 수·아바타 정확 표시
  - **## 테스트 체크리스트 (Playwright):** 0명/1명/다수(초과 시 +N) 표시 / 아바타 없는 사용자 폴백 이니셜

**Phase 1 검증**

- ✅ `npm run lint` + `npm run build`(타입 체크 포함) 통과
- ⏸️ **Playwright E2E (보류):** 보호 라우트(`/protected/*`) 인증 가드로 로그인 세션 필요 → 테스트 계정 확보 후 진행 예정. 시나리오: 이벤트 생성 폼 → 홈 피드 카드 → 상세 진입 → RSVP 로컬 토글 → 아바타 스택 → 필터/검색. 엣지: 유효성 실패, 빈 피드, 잘못된 eventId

---

### Phase 2 — 공지 + 댓글 **UI** (mock) ✅ — **완료** (Playwright E2E 보류)

> **목표:** 이벤트 안 공지 피드·핀 고정·댓글 스레드 화면을 **mock 데이터**로 완성한다.
> **데이터:** mock (`lib/mock/announcements.ts`, `comments.ts`) / 로컬 상태 · **선행:** Phase 1 · **후행:** Phase 3

- [x] **Task 011: 공지 피드 + 공지 폼 UI** ✅ `N-01` `N-02` `N-03` `P0`
  - 산출물: `app/protected/events/[eventId]/announcements/page.tsx`, `components/announcement/announcement-feed.tsx`, `components/announcement/announcement-form.tsx`
  - 최신순 mock 피드, 공지 작성/수정/삭제 폼 UI(주최자 전용 노출 분기). 제출은 로컬 상태 추가
  - **DoD:** mock 공지 피드·폼 렌더, 주최자/참여자 UI 분기
  - **## 테스트 체크리스트 (Playwright):** 작성→로컬 피드 노출 / 수정·삭제 UI 반영 / 참여자 시 작성 UI 미노출 / 빈 내용 유효성

- [x] **Task 012: 핀 고정 공지 UI (로컬 상태)** ✅ `N-03` `P0`
  - 산출물: `announcement-feed.tsx`(핀 영역), 로컬 핀 토글
  - `is_pinned` 1개 상단 고정, 새 핀 지정 시 기존 핀 해제(로컬 단일 보장)
  - **DoD:** 핀 공지 최상단 고정 표시(로컬)
  - **## 테스트 체크리스트 (Playwright):** 핀 지정→상단 이동 / 다른 공지 핀 시 기존 핀 자동 해제 / 핀 해제

- [x] **Task 013: 댓글 스레드 + 댓글 폼 UI** ✅ `N-04` `N-05` `P0`
  - 산출물: `components/announcement/comment-thread.tsx`, `components/announcement/comment-form.tsx`
  - 공지별 mock 댓글 스레드, 작성 폼. 본인/타인 댓글 삭제 버튼 노출 분기(로컬)
  - **DoD:** mock 댓글 스레드·작성 UI, 권한별 삭제 버튼 분기
  - **## 테스트 체크리스트 (Playwright):** 작성→스레드 노출 / 본인 댓글 삭제 버튼 노출, 타인 미노출 / 빈 댓글 차단 / 긴 텍스트 경계값

**Phase 2 검증**

- ✅ `npm run lint` + `npm run build`(타입 체크 포함) 통과
- ⏸️ **Playwright E2E (보류):** 보호 라우트 인증 가드로 로그인 세션 필요 → 테스트 계정 확보 후 진행 예정. 시나리오: 공지 작성→핀 고정→댓글 작성→본인 댓글 삭제. 엣지: 권한별 노출 차이, 빈 입력, 핀 단일 보장
- **🎯 M1 게이트:** Phase 0~2 구현 완료 = 클릭 가능한 UI 프로토타입(mock) 완성(E2E 검증만 보류). UI 보완점·필드 누락을 점검해 Phase 3 스키마에 반영

---

### Phase 3 — 데이터베이스 & Supabase 통합

> **목표:** Phase 0~2에서 미뤄둔 **모든 스키마·RLS를 한 번에** 만들고, mock으로 구축한 UI를 **실제 Supabase 데이터/Server Action으로 연결(wire-up)** 한다. **M2 — DB 연동된 첫 동작 버전.**
> **데이터:** mock → 실데이터 전환 · **선행:** Phase 2 (검증된 UI 가정) · **후행:** Phase 4·5
> **전제:** UI가 충분히 검증되어 스키마가 안정적. UI 보완으로 드러난 필드 변경을 스키마에 반영한다.

- [x] **Task 014: 전체 스키마 마이그레이션 (profiles·events·participants·announcements·comments)** ✅ `A-04` `E-01` `N-01` `P0`
  - 산출물: 마이그레이션 SQL (`apply_migration`)
  - `profiles.display_name` 컬럼 추가
  - `events`(host_id, title, description, category, event_at, location, thumbnail_url, status), `event_participants`(event_id, user_id, rsvp_status, joined_at)
  - `announcements`(event_id, author_id, content, is_pinned), `comments`(announcement_id, author_id, content)
  - mock 타입(`lib/mock/types.ts`)과 컬럼 정렬 확인 — 드리프트 항목은 이 단계에서 일괄 정렬
  - **DoD:** `list_tables`로 5개 테이블/컬럼 확인
  - **## 테스트 체크리스트:** SQL 직접 INSERT/SELECT로 테이블·제약·FK 검증 / mock 필드와 실 컬럼 1:1 대응 점검

- [x] **Task 015: 전체 RLS 정책 + 헬퍼 함수 + 타입 재생성** ✅ `P0`
  - 산출물: RLS 마이그레이션, 헬퍼 함수(이벤트 참여자 확인 등, PRD 9장), `lib/database.types.ts`(재생성)
  - PRD 9장 권한 매트릭스 전체 적용: profiles / events / event_participants / announcements / comments
  - 이벤트 생성 시 주최자를 `event_participants`에 자동 INSERT (DB 트리거 또는 Server Action 규약)
  - `generate_typescript_types`로 타입 재생성 → `npm run build` 게이트
  - **DoD:** `get_advisors(security)` 경고 0건, 타입 재생성 반영
  - **## 테스트 체크리스트:** SQL로 권한 매트릭스 직접 검증 — 비참여자 SELECT 차단, 주최자만 events UPDATE, 비주최자 공지 작성 차단, 타인 댓글 삭제 차단·주최자 삭제 허용 / 트리거로 주최자 자동 참여 레코드 생성

- [x] **Task 016: 모임 + RSVP wire-up (mock → 실데이터)** ✅ `E-03` `E-04` `E-05` `P0`
  - 산출물: `app/protected/events/actions.ts`, 홈 피드·상세·RSVP 컴포넌트의 데이터 소스 교체, Suspense + 실데이터 로딩
  - 이벤트 생성/수정/취소 Server Action, 홈 피드·상세 조회 쿼리(참여 이벤트 한정), RSVP upsert + `revalidatePath`
  - mock import 제거 → Supabase 쿼리/Server Action으로 대체
  - **DoD:** 이벤트 생성·피드·상세·RSVP가 실데이터로 영속·동작
  - **## 테스트 체크리스트 (Playwright):** 정상 생성→DB 반영→피드/상세 노출 / 필수값 누락 유효성 / 비참여자 상세 접근 차단(RLS) / 존재하지 않는 eventId 404 / RSVP 토글 영속·새로고침 유지 / 동일 상태 재클릭 멱등 / 연속 빠른 클릭 마지막 상태 정확(동시성) / 네트워크 오류 시 폼 에러 처리

- [x] **Task 017: 공지 + 댓글 wire-up (mock → 실데이터)** ✅ `N-01` `N-04` `P0`
  - 산출물: `app/protected/events/[eventId]/announcements/actions.ts`, 공지/핀/댓글 컴포넌트 데이터 소스 교체
  - 공지 CRUD·핀 토글·댓글 작성/삭제 Server Action, 권한은 RLS + 페이지 가드 이중화
  - **DoD:** 공지·댓글·핀이 실데이터로 권한대로 동작
  - **## 테스트 체크리스트 (Playwright):** 주최자 공지 CRUD 영속 / 참여자 읽기 전용 / 핀 단일 보장(DB) / 댓글 작성·본인 삭제·주최자 삭제 / 비주최자/비참여자 직접 액션 차단(RLS) / 빈 입력 차단

- [x] **Task 018: 프로필 display_name wire-up + Phase 3 통합 테스트** ✅ `A-04` `P0`
  - 산출물: `components/profile-form.tsx` Server Action 연결, 통합 E2E 시나리오
  - 프로필 `display_name` 실 저장(빈 문자열 `null` 변환), 아바타 처리
  - mock 잔재(`lib/mock/*`) 정리 — UI 컴포넌트에서 실데이터 경로만 남기기
  - **DoD:** 프로필 저장 영속, mock 의존성 제거 확인, Phase 0~2 UI가 전부 실데이터로 동작
  - **## 테스트 체크리스트 (Playwright):** display_name 저장→재조회 반영 / 빈 값 null 처리 / **통합 플로우:** 로그인 → 이벤트 생성 → 피드/상세 → RSVP → 공지+핀 → 댓글 → 프로필 수정까지 실데이터 일관 동작 / 권한·엣지: 비참여자 차단, RSVP 동시성, 빈 데이터 상태

**Phase 3 검증**

- ✅ `npm run lint` + `npm run build` 통과, `lib/database.types.ts` 재생성 반영
- ✅ Supabase MCP `list_tables`(5개 테이블) / `get_advisors(security)` 스키마·RLS·함수 경고 0건 (잔여 1건은 사전 존재 Auth 설정 `auth_leaked_password_protection` — 마이그레이션 무관, 대시보드 토글 필요)
- ✅ SQL로 PRD 9장 권한 매트릭스 직접 검증 — 비참여자 차단 / 참여자 읽기·댓글 / 주최자 전권 / 트리거 자동참여 / RLS 재귀 없음
- ⏸️ **Playwright E2E (보류):** 보호 라우트 인증 세션 필요 → 테스트 계정 확보 후 진행. 시나리오: 로그인→생성→피드/상세→RSVP→공지+핀→댓글→프로필
- **🎯 M2 게이트:** 스키마·RLS·wire-up 구현 완료 = DB 연동 첫 동작 버전(E2E 검증만 보류)

> **참고:** 라우트가 `app/protected/*` → `app/(app)/*` 라우트 그룹으로 이동되어 실제 URL은 `/`, `/dashboard`, `/events/[eventId]`, `/profile` 등이다(위 Task 산출물 경로의 `/protected` 표기는 구버전). Enum 카테고리는 mock 표시값과 동일한 한글값(`운동/친목/스터디/기타`)으로 정의했다. 대시보드(Phase 6)는 아직 mock을 사용한다.

---

### Phase 7 — 관리자 & 사용자 제재 ✅ — **완료** (Playwright E2E 보류)

> **목표:** 운영을 위한 관리자 기능을 추가한다. 관리자는 전체 모임을 조회·삭제하고, 사용자에게 제재(영구 차단/기간제 정지)를 부여·해제한다. 제재된 사용자는 앱 접근과 쓰기가 모두 차단된다.
> **데이터:** 실데이터 · **선행:** Phase 3 · **후행:** 없음
> **설계 결정:** ① 관리자 = `auth.users.app_metadata.role='admin'`(변조 불가, 앱 외 SQL/대시보드 1회 지정·재로그인 필요) ② 제재 = `user_sanctions` 테이블(영구/기간제 `banned_until` + 사유, 이력 보존) ③ 적용 = 접근 차단(`(app)/layout`→`/banned`) + 쓰기 차단(write RLS에 `NOT is_banned`). 권한·제재는 `profiles`에 두지 않아 자가 승격을 차단.

- [x] **Task 019: 관리자/제재 스키마 — `is_admin`·`user_sanctions`·`is_banned` + RLS 보강** ✅ `P0`
  - 산출물: 마이그레이션(`private.is_admin()`, `user_sanctions`+인덱스, `private.is_banned(uuid)`, user_sanctions RLS), 기존 정책 ALTER POLICY(events SELECT/DELETE에 `is_admin`, write 정책에 `NOT is_banned`), `lib/database.types.ts` 재생성
  - **DoD:** `get_advisors(security)` 경고 0건(스키마), 타입 재생성
  - **## 테스트 체크리스트:** SQL — 관리자 전체 조회·삭제 허용·비관리자 차단 / 차단 사용자 쓰기 차단 / 비관리자 user_sanctions INSERT 차단 / 일반 사용자 기존 플로우 회귀 없음

- [x] **Task 020: 차단 enforcement — layout 가드 + `/banned` + 관리자 네비** ✅ `P0`
  - 산출물: `app/(app)/layout.tsx`(활성 제재 시 `/banned` 리다이렉트·isAdmin 계산), `app/banned/page.tsx`(사유·해제시각+로그아웃), `components/nav/header-nav.tsx`(관리자 링크)
  - **DoD:** 차단 사용자 전 경로 `/banned` 차단, 관리자만 관리자 링크 노출

- [x] **Task 021: 관리자 페이지 + Server Actions** ✅ `P0`
  - 산출물: `app/(app)/admin/page.tsx`(이벤트·사용자 관리), `app/(app)/admin/actions.ts`(`adminDeleteEvent`/`sanctionUser`/`liftSanction`), `components/admin/admin-event-list.tsx`, `components/admin/admin-user-list.tsx`
  - **DoD:** 관리자 전체 이벤트 삭제·사용자 제재/해제 동작, 비관리자 `/admin` 접근 시 `/`로 리다이렉트

- [x] **Task 022: ROADMAP 갱신** ✅ — Phase 4~6 보류, Phase 7 추가

**Phase 7 검증**

- ✅ `npm run lint` + `npm run build`, `get_advisors(security)` 스키마 경고 0건
- ✅ SQL 권한 매트릭스(관리자/비관리자/차단자) 검증
- ⏸️ **Playwright E2E (보류):** 관리자 지정 후 재로그인 → `/admin` 삭제·제재 → 차단 계정 `/banned`·쓰기 차단 → 해제 복귀

> **관리자 지정 방법 (앱 외 1회):** Supabase 대시보드 또는 SQL로 지정 후 **재로그인**(토큰 갱신 시 반영).
>
> ```sql
> update auth.users
> set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
> where email = '관리자이메일';
> ```

---

### Phase 4 — 카풀 매칭 (풀스택) — ⏸️ **보류 (구현 안 함)**

> **목표:** 운전자 등록부터 탑승 신청·승인까지 카풀 조율을 앱 안에서 완결한다. **화면 먼저 → 데이터 연결** 흐름 권장.
> **데이터:** 실데이터 · **선행:** Phase 3 · **후행:** Phase 6 (Phase 5와 독립)

- [ ] **Task 019: carpools / carpool_requests 마이그레이션 + RLS** `C-01` `P0`
  - 산출물: 마이그레이션 SQL, RLS 정책, `lib/database.types.ts`(재생성)
  - `carpools`(event_id, driver_id, total_seats, departure_note, status open/full/closed), `carpool_requests`(carpool_id, requester_id, status pending/approved/rejected)
  - RLS(PRD 9장): carpools INSERT(참여자)/UPDATE·DELETE(운전자+주최자), carpool_requests UPDATE(운전자)/DELETE(신청자)
  - **DoD:** 두 테이블 생성, `get_advisors` 경고 0건, 타입 재생성
  - **## 테스트 체크리스트:** SQL로 RLS 검증 — 운전자만 신청 승인/거절, 신청자만 취소, 비참여자 INSERT 차단

- [ ] **Task 020: 카풀 탭 UI + 운전자 등록 폼** `C-01` `C-04` `P0`
  - 산출물: `app/protected/events/[eventId]/carpools/page.tsx`, `components/carpool/carpool-card.tsx`, `components/carpool/driver-form.tsx`, actions
  - 운전자 카드 목록(잔여 좌석·탑승자) 화면 먼저 → 운전자 등록 폼 Server Action 연결
  - **DoD:** 운전자 등록 시 카드 노출, 잔여 좌석 표시(실데이터)
  - **## 테스트 체크리스트 (Playwright):** 등록→카드 노출 / 좌석 수 0·음수 유효성 / 빈 출발지 / 동일 사용자 중복 운전자 등록 처리

- [ ] **Task 021: 탑승 신청 → 승인/거절 플로우** `C-02` `C-03` `C-05` `P0`
  - 산출물: `components/carpool/request-button.tsx`, `components/carpool/request-list.tsx`, actions (request/approve/reject)
  - 참여자 탑승 신청 → 운전자 승인/거절, 내 신청 현황 표시
  - **DoD:** 신청·승인·거절 상태 전이 정확, 승인 시 좌석 차감
  - **## 테스트 체크리스트 (Playwright):** 신청→pending / 운전자 승인→approved·좌석 차감 / 거절→rejected / 비운전자 승인 액션 차단(RLS) / **좌석 초과 신청 동시성**(잔여 1석에 2명 동시 승인 시 1명만 성공) / 중복 신청 방지

- [ ] **Task 022: 잔여 좌석 게이지 + 카풀 취소** `C-04` `C-06` `P0/P1`
  - 산출물: `components/carpool/seat-gauge.tsx`, cancel action
  - 잔여 좌석 게이지 바, 만석 시 status=full·신청 버튼 비활성, 신청자/운전자 취소(P1)
  - **DoD:** 좌석 게이지 정확, 만석 처리·취소 동작
  - **## 테스트 체크리스트 (Playwright):** 게이지 0~만석 표시 / 만석 시 신청 버튼 비활성 / 신청자 취소→좌석 복원 / 운전자 카풀 취소→신청자 상태 처리

**Phase 4 검증**

- `npm run lint` + `npm run build` 통과, `get_advisors`로 carpools·carpool_requests RLS 점검
- **Playwright E2E:** 운전자 등록→신청→승인→좌석 차감/게이지→취소→복원. 엣지: **좌석 동시성**, 만석 차단, 권한별 액션 차단

---

### Phase 5 — 정산 (풀스택) — ⏸️ **보류 (구현 안 함)**

> **목표:** 비용을 입력하고 균등/차등으로 분배해 각자 금액과 송금 여부를 관리한다. **화면 먼저 → 데이터 연결** 흐름 권장.
> **데이터:** 실데이터 · **선행:** Phase 3 · **후행:** Phase 6 (Phase 4와 독립)

- [ ] **Task 023: expenses / expense_shares 마이그레이션 + RLS** `X-01` `P0`
  - 산출물: 마이그레이션 SQL, RLS 정책, `lib/database.types.ts`(재생성)
  - `expenses`(event_id, title, total_amount, paid_by, split_type equal/custom), `expense_shares`(expense_id, user_id, amount, is_paid, paid_at)
  - RLS(PRD 9장): expenses INSERT/UPDATE/DELETE(주최자), expense_shares SELECT(본인+주최자)/UPDATE(주최자 송금확인)
  - **DoD:** 두 테이블 생성, `get_advisors` 경고 0건, 타입 재생성
  - **## 테스트 체크리스트:** SQL로 RLS 검증 — 본인 share만 조회, 주최자만 is_paid 변경

- [ ] **Task 024: 정산 탭 UI + 비용 항목 입력 폼 (균등/차등)** `X-01` `X-02` `X-06` `P0/P1`
  - 산출물: `app/protected/events/[eventId]/expenses/page.tsx`, `components/expense/expense-form.tsx`, `components/expense/expense-list.tsx`, actions
  - 항목명·금액·지불자, 분배 방식 선택(균등 N분의1 / 차등 직접 지정), 다중 항목(P1). 화면 먼저 → Server Action 연결
  - **DoD:** 비용 항목 생성, 분배 방식 저장(실데이터)
  - **## 테스트 체크리스트 (Playwright):** 균등 입력→share 생성 / 차등 입력 / **차등 합계 ≠ 총액 시 유효성 차단** / 금액 0·음수·소수점 경계값 / 다중 항목 누적

- [ ] **Task 025: 참여자별 납부 금액 자동 계산** `X-02` `X-03` `P0`
  - 산출물: 분배 계산 로직 (`lib/expense/calculate-shares.ts`), 개인별 금액 조회 UI
  - 균등: 총액/참여자 수(나머지 처리), 차등: 입력값 그대로. 내 납부액 상단 강조
  - **DoD:** 합계 = 총액 보장, 내 금액 정확 표시
  - **## 테스트 체크리스트 (Playwright + 단위 검증):** 균등 나누어떨어짐/나머지 분배 정확 / **분배 합계 = 총액 불변식** / 참여자 1명 / 차등 합계 검증 / 내 금액 강조

- [ ] **Task 026: 송금 완료 체크** `X-04` `P0`
  - 산출물: `components/expense/paid-toggle.tsx`, mark-paid action
  - 주최자가 수신 확인 시 `is_paid` 체크(paid_at 기록), 미정산 인원 카운트
  - **DoD:** 송금 체크 즉시 반영, 권한대로 동작
  - **## 테스트 체크리스트 (Playwright):** 주최자 체크→is_paid 반영·미정산 카운트 감소 / 체크 해제 / 참여자에게 토글 미노출 / 비주최자 액션 차단(RLS)

**Phase 5 검증**

- `npm run lint` + `npm run build` 통과, `get_advisors`로 expenses·expense_shares RLS 점검
- **Playwright E2E:** 비용 입력(균등/차등)→본인 금액 확인→송금 체크→미정산 카운트 감소. 엣지: **차등 합계 불일치 차단**, 나머지 분배, 권한별 노출 차이

---

### Phase 6 — 주최자 대시보드 (풀스택) — ⏸️ **보류 (구현 안 함)**

> **목표:** 한 화면에서 RSVP·미승인 카풀·미정산을 동시에 파악한다. **M4 — MVP 출시.**
> **데이터:** 실데이터 · **선행:** Phase 3·4·5 (집계 데이터 의존)

- [ ] **Task 027: 대시보드 셸 + 내 이벤트 목록 위젯 + 생성 FAB** `D-01` `D-05` `P0/P1`
  - 산출물: `app/protected/dashboard/page.tsx`, `components/dashboard/event-list-widget.tsx`, `components/dashboard/create-fab.tsx`
  - 내가 주최한 이벤트 목록(예정/진행중/완료), 이벤트 생성 FAB(→ `/events/new`)
  - **DoD:** 주최 이벤트 목록 표시, FAB로 생성 페이지 이동
  - **## 테스트 체크리스트 (Playwright):** 주최 이벤트만 노출 / 상태별 분류 / 빈 상태 / FAB 이동

- [ ] **Task 028: RSVP 현황 위젯** `D-02` `P0`
  - 산출물: `components/dashboard/rsvp-widget.tsx`, 집계 쿼리
  - 이벤트별 참석/불참/미정 인원 카운트 KPI 카드
  - **DoD:** 카운트가 실제 RSVP와 일치
  - **## 테스트 체크리스트 (Playwright):** 카운트 정확성 / RSVP 변경 후 재집계 반영 / 참여자 0명 이벤트

- [ ] **Task 029: 미승인 카풀 신청 위젯** `D-03` `C-05` `P0`
  - 산출물: `components/dashboard/carpool-widget.tsx`, 집계 쿼리
  - status=pending 신청 건수 + 해당 카풀 탭 바로가기
  - **DoD:** 대기 건수 정확, 바로가기 동작
  - **## 테스트 체크리스트 (Playwright):** pending 건수 정확 / 승인·거절 후 카운트 감소 / 0건 빈 상태 / 바로가기 링크

- [ ] **Task 030: 미정산 현황 위젯** `D-04` `X-05` `P0`
  - 산출물: `components/dashboard/expense-widget.tsx`, 집계 쿼리
  - 이벤트별 미수금 인원·잔여 금액(is_paid=false 합계)
  - **DoD:** 미정산 인원·금액 정확
  - **## 테스트 체크리스트 (Playwright):** 미수금 인원·금액 합계 정확 / 송금 체크 후 감소 / 전원 정산 완료 시 0 표시

- [ ] **Task 031: 통합 테스트 — 전체 사용자 플로우** `P0`
  - 산출물: Playwright 시나리오 모음 (주최자 풀 플로우 + 참여자 풀 플로우)
  - **## 테스트 체크리스트 (Playwright):**
    - 주최자: 회원가입/로그인 → 이벤트 생성 → 공지+핀 → 정산 입력 → 대시보드에서 RSVP·미승인 카풀·미정산 확인 → 송금 체크
    - 참여자: 로그인 → 이벤트 RSVP → 댓글 → 카풀 신청 → 본인 정산 금액 확인
    - 권한/엣지: 비참여자 접근 차단, RSVP·좌석 동시성, 차등 정산 합계 검증, 빈 데이터 상태
  - **DoD:** 모든 시나리오 통과 확인 후 Phase 6 및 MVP 완료 처리

**Phase 6 검증**

- `npm run lint` + `npm run build` 통과, `get_advisors`로 전체 테이블 RLS 최종 점검
- **Playwright E2E:** Task 031의 주최자/참여자 풀 플로우 전체 통과 = **M4 MVP 출시 게이트**

---

## 위험 요소 & 대응

| 위험                                 | 영향                                                                   | 대응                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **mock→실데이터 전환 리팩토링 비용** | Phase 0~2 UI를 Phase 3에서 한꺼번에 연결하며 다수 컴포넌트 수정 발생   | UI 컴포넌트는 데이터 소스를 prop/로더로 주입받게 설계해 교체 지점을 최소화, wire-up Task(016~018)를 기능 단위로 쪼개 점진 전환, 각 전환마다 Playwright 회귀 테스트 |
| **UI 가정과 스키마 드리프트**        | UI를 먼저 만들어 mock 필드가 실 스키마와 어긋날 위험(컬럼명·타입·관계) | mock 타입을 **PRD 8장 컬럼명/타입에 맞춰** 정의(Task 000), Phase 3 Task 014에서 mock↔실 컬럼 1:1 대응 점검 후 일괄 정렬, 타입 재생성으로 `npm run build` 게이트    |
| **RLS 정책 누락/오류**               | 데이터 노출·무단 수정                                                  | 스키마 Task마다 `get_advisors(security)` 경고 0건 게이트, SQL로 권한 매트릭스(PRD 9장) 직접 검증, RLS는 Phase 3에서 전체 일괄 적용                                 |
| **카풀 좌석 동시성**                 | 잔여 1석에 2명 동시 승인 시 초과 배정                                  | 승인 Server Action에서 트랜잭션 + 좌석 수 조건부 UPDATE(`WHERE 잔여>0`), Playwright 동시 승인 테스트                                                               |
| **정산 차등 합계 불일치**            | 분배 합 ≠ 총액으로 금액 오류                                           | 폼 제출 전 합계 검증, 계산 로직에 "합계 = 총액" 불변식 단위 검증, 균등 나머지 분배 규칙 명시                                                                       |
| **이벤트 접근 범위 오류**            | 비참여자가 상세/탭 열람                                                | RLS(참여자+주최자) + 페이지 가드 이중화, Suspense 경계에서 미인증 redirect                                                                                         |
| **스키마 변경 후 타입 미반영**       | 빌드 통과해도 런타임 불일치                                            | 마이그레이션 직후 `generate_typescript_types` 재생성 → `npm run build` 게이트                                                                                      |
| **세션 꼬임 (Fluid compute)**        | 무작위 로그아웃                                                        | proxy의 `getClaims()` 호출 규칙 준수, 클라이언트 전역 캐싱 금지(CLAUDE.md)                                                                                         |
| **솔로 개발 범위 초과**              | P1까지 욕심내다 일정 지연                                              | P0 우선 완성 후 P1 착수, Phase별 독립 배포로 점진 출시                                                                                                             |

---

**📅 최종 업데이트:** 2026-06-18
**📊 진행 상황:** Phase 0~3 + Phase 7(관리자·제재) 구현 완료(E2E 보류). Phase 4~6(카풀·정산·대시보드)은 보류(구현 안 함).
