import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// 구글 등 OAuth 제공자가 인증 후 ?code=...를 붙여 돌려보내는 콜백 라우트.
// PKCE 코드를 세션으로 교환한 뒤 next 경로로 이동시킨다.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/protected";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 세션 교환 성공 → 최종 목적지로 이동
      redirect(next);
    }
    // 교환 실패 → 에러 페이지로 이동
    redirect(`/auth/error?error=${error.message}`);
  }

  // 인증 코드가 없는 비정상 접근
  redirect(`/auth/error?error=No authorization code`);
}
