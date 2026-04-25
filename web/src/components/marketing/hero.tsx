import { PlayIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { DashboardMockup } from "./dashboard-mockup"
import { StravaIcon } from "./icons/strava-icon"
import { GoogleIcon } from "./icons/google-icon"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <RidgelineBackground />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-24 md:grid-cols-2 md:items-center md:gap-16 md:pt-24 md:pb-32">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            V1 — Beta publique
          </div>

          <h1 className="mb-6 text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Ton chrono de trail,{" "}
            <span className="text-primary">avant la course.</span>
          </h1>

          <p className="mb-8 max-w-lg text-balance text-base text-muted-foreground md:text-lg">
            Prédiction de temps, plan de splits et nutrition personnalisée.
            Gratuit, open-source, et fait pour la commu trail.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-[#FC4C02] text-white hover:bg-[#e04400]"
              asChild
            >
              <a href="/auth/strava">
                <StravaIcon />
                Connexion avec Strava
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/auth/google">
                <GoogleIcon />
                Continuer avec Google
              </a>
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <PlayIcon size={14} weight="fill" className="text-primary" />
            <a href="#demo" className="hover:text-foreground transition-colors">
              Ou essaie avec un exemple, sans compte
            </a>
          </div>
        </div>

        <div className="relative">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}

function RidgelineBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-[0.06] dark:opacity-[0.1]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 300"
        className="w-full max-w-6xl text-primary"
        preserveAspectRatio="none"
      >
        <path
          d="M0,250 L80,180 L160,210 L240,120 L340,160 L420,80 L520,140 L620,60 L720,130 L820,90 L920,170 L1020,110 L1120,190 L1200,150 L1200,300 L0,300 Z"
          fill="currentColor"
        />
        <path
          d="M0,270 L100,230 L200,250 L300,200 L400,240 L500,190 L600,230 L700,180 L800,220 L900,200 L1000,240 L1100,210 L1200,230 L1200,300 L0,300 Z"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}