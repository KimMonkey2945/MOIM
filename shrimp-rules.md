# 개발 가이드라인 (AI Agent 전용)

> 이 문서는 코딩 AI Agent의 작업 운영 규칙이다. 일반 개발 지식이 아닌 **이 프로젝트에만 해당하는 규칙·금지사항·다중 파일 연동**만 기술한다. 작업 전 반드시 이 문서를 참조한다.

---

## 1. 프로젝트 개요

- Next.js(App Router) + Supabase 인증 스타터킷이다.
- 소스는 `src/` 없이 **루트 레벨**(`app/`, `components/`, `lib/`)에 둔다.
- 경로 별칭은 `@/*` → 프로젝트 루트(`tsconfig.json`). import는 **항상 `@/` 별칭**을 쓰고 상대 경로(`../`)를 쓰지 않는다.

---

## 2. 프로젝트 아키텍처 (디렉터리 배치)

| 디렉터리                   | 용도                               | 규칙                                                                                  |
| -------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| `app/auth/*`               | 인증 플로우 페이지 + 라우트 핸들러 | 로그인/회원가입/비밀번호 관련 페이지는 여기에만 둔다                                  |
| `app/protected/*`          | 인증 필요 페이지                   | 보호 페이지는 반드시 이 하위에 둔다. `app/protected/layout.tsx`가 공통 네비/푸터 제공 |
| `app/instruments/page.tsx` | 데모 페이지                        | **패턴 참고용 아님** (3.6 참조)                                                       |
| `components/*-form.tsx`    | 인증/입력 폼 컴포넌트              | `"use client"` 폼은 여기에 둔다                                                       |
| `components/ui/*`          | shadcn/ui 프리미티브               | 직접 신규 작성 금지, `npx shadcn@latest add`로만 추가                                 |
| `lib/supabase/*`           | Supabase 클라이언트 3변종          | 3절 규칙 엄수                                                                         |
| `lib/database.types.ts`    | 생성된 DB 타입                     | **수동 수정 금지** (6절 참조)                                                         |
| `lib/utils.ts`             | `cn()`, `hasEnvVars`               |                                                                                       |
| `proxy.ts` (루트)          | 미들웨어 진입점                    | `middleware.ts` 신규 생성 금지 (4절 참조)                                             |
| `docs/guides/*`            | 한국어 개발 가이드                 | 일부는 `src/` 기준 이상 구조 설명 — **실제 배치는 이 문서를 우선**                    |

---

## 3. Supabase 클라이언트 3변종 규칙 (최우선)

실행 컨텍스트마다 **정해진 파일**을 import 한다. 잘못 고르면 세션이 깨진다.

| 실행 컨텍스트                                    | import 대상             | 함수 형태                      |
| ------------------------------------------------ | ----------------------- | ------------------------------ |
| 브라우저 / Client Component (`"use client"`)     | `@/lib/supabase/client` | `createClient()` (동기)        |
| Server Component / Route Handler / Server Action | `@/lib/supabase/server` | `await createClient()` (async) |
| 미들웨어(`proxy.ts`)                             | `@/lib/supabase/proxy`  | `updateSession(request)`       |

### 3.1 금지

- ❌ 클라이언트를 모듈/전역 변수에 캐싱하지 말 것. Fluid compute에서 세션이 꼬인다.
- ❌ Server Component에서 `@/lib/supabase/client`를 import 하지 말 것.
- ❌ Client Component에서 `@/lib/supabase/server`를 import 하지 말 것.

### 3.2 강제

- ✅ 매 호출/요청마다 `createClient()`를 새로 호출한다.
  ```ts
  // ✅ 함수 내부에서 매번 생성
  const supabase = await createClient();
  ```
  ```ts
  // ❌ 모듈 최상단 캐싱 금지
  const supabase = createClient();
  export async function load() {
    /* supabase 재사용 */
  }
  ```
- ✅ `client.ts`/`server.ts`는 `createServerClient<Database>` / `createBrowserClient<Database>`로 **`Database` 제네릭을 항상 전달**한다.

### 3.6 instruments 데모 예외

- `app/instruments/page.tsx`는 생성 타입에 없는 데모 테이블이라 `@ts-expect-error`로 우회한다.
- ❌ 이 `@ts-expect-error` 패턴을 다른 신규 코드에 복제하지 말 것. 신규 테이블은 6절대로 타입을 재생성한다.

---

## 4. Proxy(미들웨어) 규칙

대상 파일: `proxy.ts`(루트), `lib/supabase/proxy.ts`.

- ❌ `middleware.ts`를 새로 만들지 말 것. 이 프로젝트는 새 명칭 **proxy**를 쓴다.
- ❌ `lib/supabase/proxy.ts`의 `createServerClient`와 `supabase.auth.getClaims()` 호출 **사이에 어떤 코드도 삽입하지 말 것**. 사용자가 무작위로 로그아웃되는 디버깅 난해한 버그를 유발한다.
- ❌ `getClaims()` 호출을 제거하지 말 것.
- ✅ `updateSession`은 반환되는 `supabaseResponse` 객체를 **그대로** 반환한다. 새 Response를 만들면 `supabaseResponse`의 쿠키를 그대로 복사해야 한다.
- ✅ 미인증 리다이렉트 목적지는 `/auth/login`이다.

---

## 5. 환경 변수 규칙

`.env.local`에 다음 **두 변수만** 사용한다:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

- ✅ 키 변수명은 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`다. (Supabase anon 키 값을 넣는다.)
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등 레거시 이름을 새로 도입하지 말 것.
- ✅ 환경변수 존재 검사는 `lib/utils.ts`의 `hasEnvVars`를 재사용한다. 별도 검사 로직을 중복 작성하지 말 것.

---

## 6. 데이터베이스 타입 규칙 (다중 파일 연동)

- ❌ `lib/database.types.ts`를 손으로 수정하지 말 것. 생성된 파일이다.
- ✅ **스키마(테이블/컬럼)를 변경하면 반드시 `lib/database.types.ts`를 재생성한다.** Supabase MCP `generate_typescript_types` 또는 `supabase gen types`를 사용한다. (스키마 변경 ↔ 타입 재생성은 항상 함께 수행)
- ✅ 행 타입은 헬퍼로 가져온다:
  ```ts
  import type { Tables } from "@/lib/database.types";
  type Profile = Tables<"profiles">;
  ```
- 현재 정의 테이블: `profiles`(id, username, full_name, website, avatar_url, bio, updated_at). `username`은 UNIQUE 가정.
- ✅ 폼에서 빈 문자열은 `null`로 변환해 저장한다(UNIQUE 충돌 방지). 패턴: `username.trim() || null`.
- ✅ DB 스키마 작업 전 Supabase MCP `list_tables`로 구조를 먼저 확인한다.

---

## 7. 인증 구현 규칙

- ✅ 사용자 확인은 `supabase.auth.getClaims()`를 쓴다. claims에서 `sub`(user id), `email`을 꺼낸다.
  ```ts
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/auth/login");
  const userId = data.claims.sub as string;
  ```
- ❌ `supabase.auth.getUser()`를 새 코드에 쓰지 말 것 (`getClaims` 통일).
- ✅ 보호 페이지는 claims 검증 후 미인증 시 `redirect("/auth/login")`.
- 인증 라우트 핸들러 (`app/auth/*/route.ts`):
  - 이메일 OTP 확인: `app/auth/confirm/route.ts` GET → `verifyOtp`.
  - OAuth 콜백: `app/auth/callback/route.ts` GET → `exchangeCodeForSession(code)`.
  - ✅ 실패 시 `redirect(\`/auth/error?error=...\`)` 패턴을 따른다.

---

## 8. Suspense / cacheComponents 규칙

- `next.config.ts`에 `cacheComponents: true`가 켜져 있다.
- ✅ 동적 데이터(인증 claims, DB 조회)를 다루는 부분은 **별도 async 컴포넌트로 분리해 `<Suspense>`로 감싼다**. 예: `app/protected/profile/page.tsx`의 `ProfileDetails`, `app/instruments/page.tsx`의 `InstrumentsData`.
  ```tsx
  export default function Page() {
    return (
      <Suspense fallback={<p>불러오는 중...</p>}>
        <DataComponent />
      </Suspense>
    );
  }
  ```
- ❌ 페이지 default export 함수 본문에서 직접 `await supabase...`로 동적 데이터를 조회하지 말 것 (Suspense 경계 없이).

---

## 9. 폼 / Client Component 규칙

대상: `components/*-form.tsx`, `components/social-auth-buttons.tsx` 등.

- ✅ 파일 첫 줄에 `"use client";`.
- ✅ Supabase는 `@/lib/supabase/client`의 `createClient()`를 **handler 함수 내부에서** 호출한다.
- ✅ 상태 패턴을 통일한다: `useState`로 `error: string | null`, `isLoading: boolean`(필요 시 `success`).
- ✅ 제출 핸들러는 `try / catch / finally` 구조, catch는 다음 형태:
  ```ts
  catch (error: unknown) {
    setError(error instanceof Error ? error.message : "An error occurred");
  }
  ```
- ✅ 에러 표시는 `<p className="text-sm text-red-500">`, 버튼은 `disabled={isLoading}`로 로딩 처리.
- ✅ UI는 `components/ui`의 `Card / Input / Label / Button` 조합을 재사용한다.

---

## 10. UI / 스타일링 규칙

- ✅ shadcn/ui(new-york 스타일, `components.json`). 신규 UI 프리미티브는 `npx shadcn@latest add [name]`로만 추가한다.
- ✅ 클래스 병합은 `cn()`(`@/lib/utils`)을 쓴다. `clsx`/`twMerge`를 직접 import 하지 말 것.
- ✅ 아이콘은 `lucide-react`. 브랜드 로고처럼 lucide에 없는 것만 인라인 SVG(예: `social-auth-buttons.tsx`의 `GoogleIcon`).
- Tailwind CSS v3 + `tailwindcss-animate`. 테마는 `next-themes`(`ThemeSwitcher`).

---

## 11. 코드 컨벤션

- ✅ 컴포넌트는 **named export**, 페이지(`page.tsx`)·레이아웃·라우트는 **default export**.
- ✅ 파일명 kebab-case (`social-auth-buttons.tsx`), 컴포넌트명 PascalCase (`SocialAuthButtons`).
- ✅ 주석·커밋 메시지·문서는 **한국어**, 변수·함수명은 **영어**.
- ✅ 커밋 메시지는 이모지 + 컨벤셔널 형식(예: `✨ feat: ...`, `🔧 chore: ...`)을 따른다.

---

## 12. 검증 워크플로우

- 테스트 러너는 없다. 변경 검증은 다음으로 한다:
  ```bash
  npm run lint    # ESLint (flat config: eslint.config.mjs)
  npm run build   # 프로덕션 빌드 + 타입 체크
  ```
- 추가 명령: `npm run type-check`(tsc --noEmit), `npm run format`(Prettier), `npm run format:check`.
- ✅ Husky + lint-staged가 커밋 시 `eslint --fix` + `prettier --write`를 자동 실행한다. 포맷을 수동으로 어기지 말 것.

---

## 13. 핵심 파일 상호작용 표 (동시 수정 규칙)

| 작업                        | 함께 수정/실행해야 할 것                                             |
| --------------------------- | -------------------------------------------------------------------- |
| DB 스키마(테이블/컬럼) 변경 | `lib/database.types.ts` **재생성** (6절)                             |
| 새 보호 페이지 추가         | `app/protected/` 하위 배치 + claims 검증 + `redirect("/auth/login")` |
| 새 인증 폼 추가             | `components/*-form.tsx`(`"use client"`) + 대응 `app/auth/*/page.tsx` |
| 새 UI 프리미티브 필요       | `npx shadcn@latest add` (수동 작성 금지)                             |
| 환경변수 추가/변경          | `lib/utils.ts`의 `hasEnvVars`, `.env.local` 일관성 확인              |
| 미들웨어 동작 변경          | `lib/supabase/proxy.ts`만 수정 (`proxy.ts` 루트는 진입점)            |

---

## 14. AI 의사결정 기준

1. Supabase 클라이언트가 필요하면 → **실행 컨텍스트**를 먼저 판별(브라우저/서버/미들웨어) → 3절 표대로 import.
2. 데이터 조회가 동적이면 → Suspense 경계로 감쌀 위치를 결정(8절).
3. 사용자 인증 정보가 필요하면 → `getClaims()` 사용(7절), `getUser()` 금지.
4. 새 테이블/컬럼을 다루는데 타입에 없으면 → `@ts-expect-error`로 우회하지 말고 **타입 재생성**(6절).
5. UI 프리미티브가 `components/ui`에 없으면 → 직접 만들지 말고 `shadcn add`.
6. `docs/guides/*`와 실제 코드 배치가 충돌하면 → **이 문서(shrimp-rules.md)와 실제 코드를 우선**.

---

## 15. 금지 행위 (요약)

- ❌ Supabase 클라이언트 전역/모듈 캐싱.
- ❌ 컨텍스트에 안 맞는 client/server 변종 import.
- ❌ `proxy.ts`의 `createServerClient`~`getClaims()` 사이 코드 삽입, `getClaims()` 제거, `supabaseResponse` 미반환.
- ❌ `middleware.ts` 신규 생성.
- ❌ `lib/database.types.ts` 수동 편집.
- ❌ 새 코드에서 `getUser()` 사용, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 신규 도입.
- ❌ `@ts-expect-error`로 누락 테이블 우회(instruments 데모 외).
- ❌ 상대 경로 import(`../`), `clsx`/`twMerge` 직접 사용, `components/ui` 수동 작성.
- ❌ 주석/커밋/문서를 영어로 작성(변수·함수명만 영어).
