import "server-only"
import type { User } from "@supabase/supabase-js"
import { createAdminClient } from "./admin"

export type AdminUser = {
  id: string
  email: string
  fullName: string | null
  provider: string
  createdAt: string
  lastSignInAt: string | null
  confirmedAt: string | null
  bannedUntil: string | null
  lastSeen: string | null
  online: boolean
}

const ONLINE_WINDOW_MS = 2 * 60 * 1000

/** Fetch every user (paginated) enriched with presence + an `online` flag. */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient()

  const perPage = 200
  const raw: User[] = []
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    raw.push(...data.users)
    if (data.users.length < perPage) break
  }

  const { data: presence } = await admin
    .from("user_presence")
    .select("user_id, last_seen")
  const seen = new Map<string, string>(
    (presence ?? []).map((p) => [p.user_id as string, p.last_seen as string])
  )

  const now = Date.now()
  return raw.map((u) => {
    const m = (u.user_metadata ?? {}) as Record<string, string | undefined>
    const lastSeen = seen.get(u.id) ?? null
    const online = lastSeen
      ? now - new Date(lastSeen).getTime() < ONLINE_WINDOW_MS
      : false
    return {
      id: u.id,
      email: u.email ?? "",
      fullName: m.full_name ?? m.name ?? null,
      provider:
        (u.app_metadata?.provider as string | undefined) ??
        (Array.isArray(u.app_metadata?.providers)
          ? (u.app_metadata?.providers as string[])[0]
          : undefined) ??
        "email",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      confirmedAt:
        (u.email_confirmed_at as string | undefined) ??
        (u.confirmed_at as string | undefined) ??
        null,
      bannedUntil:
        (u as { banned_until?: string | null }).banned_until ?? null,
      lastSeen,
      online,
    }
  })
}

export function summarize(users: AdminUser[]) {
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  return {
    total: users.length,
    online: users.filter((u) => u.online).length,
    confirmed: users.filter((u) => u.confirmedAt).length,
    newThisWeek: users.filter((u) => new Date(u.createdAt).getTime() > weekAgo)
      .length,
  }
}
