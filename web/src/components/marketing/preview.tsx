import { Reveal } from "@/components/motion/reveal"
import { DashboardMockup } from "./dashboard-mockup"

export function Preview() {
  return (
    <section id="preview" className="relative border-b border-border/40">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-primary">
            Aperçu
          </p>
          <h2 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Voilà ce que tu obtiens.
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Un plan de course lisible et complet : temps prédit, profil
            altimétrique, splits et nutrition, généré en quelques secondes.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto max-w-xl">
          <div className="rounded-2xl bg-gradient-to-b from-primary/10 to-transparent p-2 md:p-3">
            <DashboardMockup />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
