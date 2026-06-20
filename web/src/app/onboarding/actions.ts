"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { parsePace } from "@/lib/format"

export type OnboardingState = { error?: string }

function safeNext(next: FormDataEntryValue | null): string {
  if (typeof next !== "string") return "/app"
  if (!next.startsWith("/") || next.startsWith("//")) return "/app"
  return next
}

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const firstname = String(formData.get("firstname") ?? "").trim()
  const lastname = String(formData.get("lastname") ?? "").trim()
  const paceRaw = String(formData.get("reference_pace") ?? "").trim()
  const next = safeNext(formData.get("next"))

  if (!firstname) {
    return { error: "Ton prénom est requis." }
  }

  // Reference flat pace (optional). Stored at the user level so it pre-fills
  // future course predictions instead of being asked again each time.
  const metadata: Record<string, string | number> = {
    firstname,
    lastname,
    full_name: [firstname, lastname].filter(Boolean).join(" "),
  }
  if (paceRaw) {
    const sec = parsePace(paceRaw)
    if (!Number.isFinite(sec) || sec < 120 || sec > 1800) {
      return { error: "Allure invalide. Utilise le format m:ss (ex. 6:00)." }
    }
    metadata.reference_pace_s_per_km = Math.round(sec)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/onboarding")
  }

  const { error } = await supabase.auth.updateUser({ data: metadata })
  if (error) {
    return { error: error.message }
  }

  redirect(next)
}
