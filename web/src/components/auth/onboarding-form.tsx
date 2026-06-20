"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { completeOnboarding, type OnboardingState } from "@/app/onboarding/actions"

const initialState: OnboardingState = {}

export function OnboardingForm({
  next = "/app",
  defaultFirst = "",
  defaultLast = "",
}: {
  next?: string
  defaultFirst?: string
  defaultLast?: string
}) {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenue sur Chronotrail 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Comment doit-on t&apos;appeler ? On personnalise ton espace avec ça.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="firstname">Prénom</Label>
          <Input
            id="firstname"
            name="firstname"
            type="text"
            autoComplete="given-name"
            required
            defaultValue={defaultFirst}
            placeholder="Kilian"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lastname">Nom</Label>
          <Input
            id="lastname"
            name="lastname"
            type="text"
            autoComplete="family-name"
            defaultValue={defaultLast}
            placeholder="Jornet"
          />
        </div>

        {state.error && (
          <p className="text-xs text-destructive" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Enregistrement…" : "Continuer"}
        </Button>
      </form>
    </div>
  )
}
