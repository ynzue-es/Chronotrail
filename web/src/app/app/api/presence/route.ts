import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Heartbeat: upsert the current user's presence row. Called periodically by the
// client <Heartbeat /> mounted in the app layout. RLS restricts writes to self.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let path: string | undefined
  try {
    const body = await request.json()
    if (typeof body?.path === "string") path = body.path.slice(0, 300)
  } catch {
    // no body / invalid json -> ignore
  }

  const { error } = await supabase.from("user_presence").upsert(
    { user_id: user.id, last_seen: new Date().toISOString(), path },
    { onConflict: "user_id" }
  )

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
