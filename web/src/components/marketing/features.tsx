import {
  PathIcon,
  LightningIcon,
  AppleLogoIcon,
  ChartLineIcon,
  HeartIcon,
  MountainsIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/reveal"

const FEATURES = [
  {
    icon: <PathIcon size={22} weight="duotone" />,
    title: "Prédiction ajustée à la pente",
    description:
      "Chaque montée et descente ajuste ton allure (modèle de coût énergétique), pour un chrono réaliste, pas une simple moyenne.",
  },
  {
    icon: <LightningIcon size={22} weight="duotone" />,
    title: "Calibration sur tes vraies courses",
    description:
      "Importe une course passée (export GPX Strava, Garmin…) : on déduit ton allure réelle et tes prédictions deviennent perso.",
  },
  {
    icon: <AppleLogoIcon size={22} weight="duotone" />,
    title: "Nutrition personnalisée",
    description:
      "Calories par heure, gels, sels, eau, adaptés à ton poids, ton effort et tes tolérances.",
  },
  {
    icon: <ChartLineIcon size={22} weight="duotone" />,
    title: "Splits détaillés",
    description:
      "Temps de passage km par km pour préparer pacing et ravitaillements sereinement.",
  },
  {
    icon: <HeartIcon size={22} weight="duotone" />,
    title: "Historique de courses",
    description:
      "Toutes tes prédictions sauvegardées. Compare, progresse, analyse.",
  },
  {
    icon: <MountainsIcon size={22} weight="duotone" />,
    title: "Profil altimétrique",
    description:
      "Visualise dénivelé, pentes techniques et sections critiques de ton parcours.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <Reveal className="mb-12 max-w-2xl">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Tout ce qu'il te faut pour préparer ta course.
          </h2>
          <p className="text-muted-foreground">
            Un outil complet pensé pour les traileurs, sans superflu.
          </p>
        </Reveal>

        <RevealStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {FEATURES.map((feature) => (
            <RevealItem key={feature.title}>
              <Feature {...feature} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}