"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SocialButtons } from "./social-buttons"
import { signInWithPassword, type AuthState } from "@/app/auth/actions"

const initialState: AuthState = {}

export function LoginForm({ next = "/app" }: { next?: string }) {
  const [state, formAction, pending] = useActionState(
    signInWithPassword,
    initialState
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Connexion à Chronotrail
        </h1>
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href={`/auth/signup${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-primary hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>

      <SocialButtons next={next} disabled={pending} />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="toi@exemple.fr"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error && (
          <p className="text-xs text-destructive" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </div>
  )
}
