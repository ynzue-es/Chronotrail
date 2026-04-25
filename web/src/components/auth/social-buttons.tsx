"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/marketing/icons/google-icon"
import { StravaIcon } from "@/components/marketing/icons/strava-icon"
import { createClient } from "@/lib/supabase/client"

type SocialButtonsProps = {
  next?: string
  disabled?: boolean
}

export function SocialButtons({ next = "/app", disabled }: SocialButtonsProps) {
  const [loading, setLoading] = React.useState<"google" | "strava" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function signInWithGoogle() {
    setError(null)
    setLoading("google")
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })
    if (error) {
      setError(error.message)
      setLoading(null)
    }
  }

  function signInWithStrava() {
    setError(null)
    setLoading("strava")
    window.location.href = `/auth/strava?next=${encodeURIComponent(next)}`
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="lg"
        className="w-full bg-[#FC4C02] text-white hover:bg-[#e04400]"
        onClick={signInWithStrava}
        disabled={disabled || loading !== null}
      >
        <StravaIcon />
        {loading === "strava" ? "Redirection…" : "Continuer avec Strava"}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="w-full"
        onClick={signInWithGoogle}
        disabled={disabled || loading !== null}
      >
        <GoogleIcon />
        {loading === "google" ? "Redirection…" : "Continuer avec Google"}
      </Button>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
