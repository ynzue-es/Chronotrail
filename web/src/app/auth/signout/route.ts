import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { siteUrl } from "@/lib/site-url"

export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(siteUrl("/"), { status: 303 })
}
