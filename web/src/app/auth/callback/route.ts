import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { siteUrl } from "@/lib/site-url"

function safeNext(next: string | null): string {
  if (!next) return "/app"
  if (!next.startsWith("/") || next.startsWith("//")) return "/app"
  return next
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))
  const error = searchParams.get("error_description") ?? searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      siteUrl(`/auth/login?error=${encodeURIComponent(error)}`)
    )
  }

  if (!code) {
    return NextResponse.redirect(siteUrl("/auth/login?error=missing_code"))
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(
      siteUrl(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
    )
  }

  return NextResponse.redirect(siteUrl(next))
}
