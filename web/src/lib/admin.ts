import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

/** Comma-separated list of admin emails, configured server-side. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Server-side guard for admin routes/actions. Returns the current user when
 * they are an admin; otherwise redirects (to login or back to the app).
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/app/admin")
  }
  if (!isAdminEmail(user.email)) {
    redirect("/app")
  }
  return user
}
