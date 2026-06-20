import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr"
import { StravaIcon } from "./icons/strava-icon"

export function StravaNote() {
  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <span className="opacity-60">
              <StravaIcon />
            </span>
            <LockKeyIcon size={16} weight="duotone" />
            <span className="text-xs font-medium uppercase tracking-wide">
              « Et la connexion Strava ? »
            </span>
          </div>

          <h2 className="mb-3 text-2xl font-semibold tracking-tight">
            Strava a mis son API derrière un paywall. Nous, on reste gratuits.
          </h2>

          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Depuis juin 2026, Strava réserve l&apos;accès à son API aux
            développeurs <strong>payants</strong> (~12 $/mois), avec un plafond de{" "}
            <strong>10 utilisateurs</strong>. Traduction : impossible de proposer
            une vraie connexion Strava gratuite à toute une communauté.
          </p>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Plutôt que de te refiler la facture ou de te brider, on contourne leur
            péage : tu <strong>exportes une course en GPX</strong> (toujours
            gratuit, deux clics depuis Strava ou Garmin) et Chronotrail en déduit
            tes vrais temps. Même résultat, zéro paywall, et tes données restent
            les tiennes.
          </p>
        </div>
      </div>
    </section>
  )
}
