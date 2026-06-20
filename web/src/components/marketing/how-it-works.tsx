import {
  UploadSimpleIcon,
  TimerIcon,
  ChartLineIcon,
} from "@phosphor-icons/react/dist/ssr"

const STEPS = [
  {
    number: "01",
    icon: <UploadSimpleIcon size={22} weight="duotone" />,
    title: "Dépose ton GPX",
    description:
      "Glisse le GPX de ton parcours (export Strava, Garmin ou ta montre). On analyse distance, dénivelé et technicité.",
  },
  {
    number: "02",
    icon: <TimerIcon size={22} weight="duotone" />,
    title: "Ton allure, ton profil",
    description:
      "Renseigne ton allure de référence et tes préférences nutritionnelles pour un plan vraiment personnalisé.",
  },
  {
    number: "03",
    icon: <ChartLineIcon size={22} weight="duotone" />,
    title: "Reçois ton plan",
    description:
      "Temps prédit, splits km par km, plan nutrition et hydratation, tout prêt pour le jour J.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
            En 3 étapes, avant ta prochaine course.
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Chronotrail analyse ton parcours, calcule ton temps prévu et te
            prépare un plan complet.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <Step key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="relative flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="font-mono text-xs text-muted-foreground">{number}</span>
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}