"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SocialButtons } from "./social-buttons"
import { signUpWithPassword, type AuthState } from "@/app/auth/actions"

const initialState: AuthState = {}

export function SignupForm({ next = "/app" }: { next?: string }) {
  const [state, formAction, pending] = useActionState(
    signUpWithPassword,
    initialState
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Créer un compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link
            href={`/auth/login${next !== "/app" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-primary hover:underline"
          >
            Se connecter
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
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">
            8 caractères minimum.
          </p>
        </div>

        {state.error && (
          <p className="text-xs text-destructive" role="alert">
            {state.error}
          </p>
        )}

        {state.message && (
          <p className="text-xs text-primary" role="status">
            {state.message}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          En créant un compte, tu acceptes nos{" "}
          <Link href="/terms" className="hover:text-foreground underline">
            conditions d&apos;utilisation
          </Link>
          .
        </p>
      </form>
    </div>
  )
}
