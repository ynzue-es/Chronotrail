"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export type AuthState = {
  error?: string
  message?: string
}

function safeNext(next: FormDataEntryValue | null): string {
  if (typeof next !== "string") return "/app"
  if (!next.startsWith("/") || next.startsWith("//")) return "/app"
  return next
}

export async function signInWithPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = safeNext(formData.get("next"))

  if (!email || !password) {
    return { error: "Email et mot de passe sont requis." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: mapAuthError(error.message) }
  }

  redirect(next)
}

export async function signUpWithPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const firstname = String(formData.get("firstname") ?? "").trim()
  const lastname = String(formData.get("lastname") ?? "").trim()
  const next = safeNext(formData.get("next"))

  if (!firstname) {
    return { error: "Ton prénom est requis." }
  }
  if (!email || !password) {
    return { error: "Email et mot de passe sont requis." }
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." }
  }

  const fullName = [firstname, lastname].filter(Boolean).join(" ")

  const supabase = await createClient()
  const origin = (await headers()).get("origin") ?? ""
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: { firstname, lastname, full_name: fullName },
    },
  })

  if (error) {
    return { error: mapAuthError(error.message) }
  }

  if (data.session) {
    redirect(next)
  }

  return {
    message:
      "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.",
  }
}

function mapAuthError(message: string): string {
  if (/Invalid login credentials/i.test(message))
    return "Email ou mot de passe incorrect."
  if (/User already registered/i.test(message))
    return "Un compte existe déjà avec cet email."
  if (/Email not confirmed/i.test(message))
    return "Email non confirmé. Vérifie ta boîte mail."
  return message
}
