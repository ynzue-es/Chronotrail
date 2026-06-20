"use client"

import { PlayIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Button } from "@/components/ui/button"
import { DashboardMockup } from "./dashboard-mockup"
import { MountainScene } from "./mountain-scene"

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero() {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  }

  return (
    <section className="relative overflow-hidden">
      <MountainScene />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-24 md:grid-cols-2 md:items-center md:gap-16 md:pt-24 md:pb-32">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
          >
            <motion.span
              className="size-1.5 rounded-full bg-primary"
              animate={reduce ? undefined : { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            V1 · Beta publique
          </motion.div>

          <motion.h1
            variants={item}
            className="mb-6 text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
          >
            Ton chrono de trail,{" "}
            <span className="text-primary">avant la course.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mb-8 max-w-lg text-balance text-base text-muted-foreground md:text-lg"
          >
            Prédiction de temps, plan de splits et nutrition personnalisée.
            Gratuit, open-source, et fait pour la commu trail.
          </motion.p>

          <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="/auth/signup">
                Commencer gratuitement
                <ArrowRightIcon size={16} weight="bold" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/auth/login">J&apos;ai déjà un compte</a>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <PlayIcon size={14} weight="fill" className="text-primary" />
            <a href="#demo" className="hover:text-foreground transition-colors">
              Ou essaie avec un exemple, sans compte
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: reduce ? 0 : 30, scale: reduce ? 1 : 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
        >
          <FloatWrap reduce={!!reduce}>
            <DashboardMockup />
          </FloatWrap>
        </motion.div>
      </div>
    </section>
  )
}

/** Gentle idle float for the mockup card. */
function FloatWrap({
  children,
  reduce,
}: {
  children: React.ReactNode
  reduce: boolean
}) {
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}
