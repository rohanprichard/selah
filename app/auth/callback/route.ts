import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") ?? "/my-songs";

  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/my-songs";

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const encoded = encodeURIComponent(error.message);
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encoded}`);
  }

  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
