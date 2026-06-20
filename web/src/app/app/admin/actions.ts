"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"

export type ActionResult = { ok: boolean; error?: string }

export async function deleteUser(id: string): Promise<ActionResult> {
  const me = await requireAdmin()
  if (id === me.id) return { ok: false, error: "Tu ne peux pas te supprimer." }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/app/admin")
  revalidatePath("/app/admin/users")
  return { ok: true }
}

export async function setBanned(
  id: string,
  banned: boolean
): Promise<ActionResult> {
  const me = await requireAdmin()
  if (id === me.id) return { ok: false, error: "Tu ne peux pas te bannir." }

  const admin = createAdminClient()
  // GoTrue uses a duration string; a long one = banned, "none" = unbanned.
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: banned ? "876000h" : "none",
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath("/app/admin")
  revalidatePath("/app/admin/users")
  return { ok: true }
}
