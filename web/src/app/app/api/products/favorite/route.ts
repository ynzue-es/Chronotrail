import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { setFavoriteProduct } from "@/lib/supabase/products"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const productId = String(body.productId ?? "")
  const favorite = Boolean(body.favorite)
  if (!productId) {
    return NextResponse.json({ error: "productId requis" }, { status: 400 })
  }

  try {
    await setFavoriteProduct(supabase, user.id, productId, favorite)
    return NextResponse.json({ ok: true, favorite })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
