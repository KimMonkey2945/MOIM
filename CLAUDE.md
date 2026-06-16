# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사 (flat config: eslint.config.mjs)
```

테스트 러너는 설정되어 있지 않다. 변경 검증은 `npm run lint` 와 `npm run build`(타입 체크 포함)로 한다.

## 환경 변수

`.env.local` 에 다음 두 변수가 필요하다:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

- 키 변수명은 `PUBLISHABLE_KEY` 다 (레거시 `ANON_KEY` 아님). Supabase 대시보드의 anon 키 값을 이 변수에 넣어도 동작한다.
- `lib/utils.ts`의 `hasEnvVars`가 이 두 변수 존재 여부를 확인한다. 미설정 시 proxy의 인증 리다이렉트와 일부 UI(`EnvVarWarning`)가 비활성화된다.

## 아키텍처

Next.js(App Router) + Supabase 인증 스타터킷. 소스는 `src/` 없이 루트 레벨(`app/`, `components/`, `lib/`)에 위치한다. 경로 별칭은 `@/*` → 프로젝트 루트(`tsconfig.json`).

### Supabase 클라이언트 — 세 가지 변종 (핵심)

실행 컨텍스트마다 별도의 클라이언트 팩토리를 사용해야 한다. **클라이언트를 전역 변수에 캐싱하지 말 것** (Fluid compute 환경에서 세션이 꼬인다). 매 호출/요청마다 새로 생성한다.

- `lib/supabase/client.ts` → `createClient()` — 브라우저(Client Component)용. `createBrowserClient`.
- `lib/supabase/server.ts` → `async createClient()` — 서버(Server Component, Route Handler, Server Action)용. `cookies()` 기반. Server Component에서 쿠키 set 실패는 의도적으로 무시된다 (proxy가 세션을 갱신하므로).
- `lib/supabase/proxy.ts` → `updateSession()` — 미들웨어용. 모든 요청에서 세션을 갱신하고 미인증 사용자를 `/auth/login`으로 리다이렉트한다.

세 파일 모두 `Database` 제네릭(`@/lib/database.types`)을 받아 타입 세이프 쿼리를 제공한다.

### Proxy (= 미들웨어)

이 프로젝트는 Next.js의 새 명칭인 **proxy**를 사용한다. 루트 `proxy.ts`가 기존 `middleware.ts` 역할을 하며, `lib/supabase/proxy.ts`의 `updateSession`을 호출한다. `matcher`로 정적 자산을 제외한 모든 경로에 적용된다.

`updateSession` 내부 규칙(주석에 명시되어 있고 반드시 지킬 것):
- `createServerClient`와 `getClaims()` 호출 사이에 어떤 코드도 넣지 말 것 — 사용자가 무작위로 로그아웃되는 디버깅 난해한 버그를 유발한다.
- 반환되는 `supabaseResponse` 객체를 그대로 반환할 것. 새 Response를 만들 경우 쿠키를 그대로 복사해야 한다.

### 인증 패턴

- 사용자 확인은 `supabase.auth.getClaims()` 를 사용한다 (`getUser()` 아님). claims에서 `sub`(user id), `email` 등을 꺼낸다. (예: `app/protected/profile/page.tsx`)
- 보호 페이지는 `app/protected/` 하위에 두며, `app/protected/layout.tsx`가 공통 네비/푸터를 제공한다. 페이지 단에서 claims 검증 후 미인증 시 `redirect("/auth/login")`.
- 인증 플로우 페이지/폼: `app/auth/*` (login, sign-up, forgot-password, update-password, confirm route handler). 대응 폼 컴포넌트는 `components/*-form.tsx`.
- 이메일 OTP 확인은 `app/auth/confirm/route.ts`의 GET 핸들러가 `verifyOtp`로 처리한다.

### 데이터베이스 타입

- `lib/database.types.ts`는 Supabase에서 **생성된** 타입이다. 직접 손으로 수정하지 말 것 — 스키마 변경 시 재생성한다 (Supabase MCP의 `generate_typescript_types` 또는 `supabase gen types`).
- 행 타입은 `Tables<"profiles">` 형태의 헬퍼로 가져온다 (`import type { Tables } from "@/lib/database.types"`).
- 현재 정의된 테이블: `profiles` (id, username, full_name, website, avatar_url, bio, updated_at). `username`은 UNIQUE 가정 — 폼에서 빈 문자열을 `null`로 변환해 저장한다(`components/profile-form.tsx`).
- `app/instruments/page.tsx`의 `instruments`는 생성 타입에 없는 데모용 테이블이라 `@ts-expect-error`로 우회한다. 패턴으로 따라 하지 말 것.

### UI / 스타일링

- shadcn/ui (new-york 스타일, `components.json`). 기본 UI 프리미티브는 `components/ui/`. 새 컴포넌트는 `npx shadcn@latest add [name]`.
- Tailwind CSS v3 + `tailwindcss-animate`. 클래스 병합은 `cn()`(`lib/utils.ts`, clsx + tailwind-merge).
- 아이콘은 lucide-react. 테마는 next-themes(`ThemeSwitcher`).

### Next.js 설정

`next.config.ts`에 `cacheComponents: true`가 켜져 있다. 동적 데이터를 다루는 컴포넌트는 `<Suspense>`로 감싸는 패턴을 따른다 (예: `app/protected/page.tsx`의 `UserDetails`, `app/instruments/page.tsx`).

## 코드 컨벤션

- 컴포넌트는 named export, 페이지는 default export.
- 파일명 kebab-case, 컴포넌트명 PascalCase. import는 항상 `@/` 별칭 사용(상대 경로 지양).
- 주석/커밋 메시지/문서는 한국어, 변수·함수명은 영어.
- `docs/guides/`에 한국어 개발 가이드가 있으나 일부는 이상적 구조(`src/` 기준)를 설명한다. 실제 디렉터리 배치는 위 아키텍처 설명을 우선한다.

## MCP 서버

`.mcp.json`에 supabase(원격 프로젝트 연결), playwright, context7, sequential-thinking, shrimp-task-manager가 설정되어 있다. 스키마/DB 작업 전 supabase MCP의 `list_tables`로 구조를 먼저 확인한다.
