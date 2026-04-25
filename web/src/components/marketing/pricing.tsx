import { CheckIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

const INCLUDED = [
  "Prédictions de temps illimitées",
  "Connexion Strava",
  "Plan nutrition personnalisé",
  "Historique complet",
  "Export des plans de course",
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-24">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Gratuit. Pour tout le monde. Pour toujours.
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-muted-foreground">
          Chronotrail est open-source et sans pub. Pas de freemium, pas de
          limite cachée. Juste un outil pour aider la commu trail.
        </p>

        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-left shadow-sm">
          <div className="mb-6 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-semibold tracking-tight">
              0€
            </span>
            <span className="text-muted-foreground">/ pour toujours</span>
          </div>
          <ul className="mb-8 space-y-3 text-sm">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckIcon size={16} weight="bold" className="shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button size="lg" className="w-full">
            Créer mon compte
            <ArrowRightIcon size={16} weight="bold" />
          </Button>
        </div>
      </div>
    </section>
  )
}