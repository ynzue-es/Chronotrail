"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

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
  const next = safeNext(formData.get("next"))

  if (!firstname) {
    return { error: "Ton prénom est requis." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/onboarding")
  }

  const fullName = [firstname, lastname].filter(Boolean).join(" ")
  const { error } = await supabase.auth.updateUser({
    data: { firstname, lastname, full_name: fullName },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(next)
}
