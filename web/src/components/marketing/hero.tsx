"use client"

import { PlayIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Button } from "@/components/ui/button"

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero() {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  }

  return (
    <section className="relative flex min-h-[92vh] w-full items-center overflow-hidden">
      {/* Photo background (Unsplash) with a slow Ken Burns drift */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: reduce ? 1 : 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0"
            animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-mountains.jpg"
              alt="Sommets alpins au lever du soleil au-dessus d'une mer de nuages"
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
        </motion.div>

        {/* Scrims: left for text contrast, top for header, bottom to blend into page */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur"
          >
            <motion.span
              className="size-1.5 rounded-full bg-primary"
              animate={reduce ? undefined : { scale: [1, 1.7, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            V1 · Beta publique
          </motion.div>

          <motion.h1
            variants={item}
            className="mb-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white drop-shadow-sm md:text-6xl lg:text-7xl"
          >
            Ton chrono de trail,{" "}
            <span className="text-primary-foreground/95">avant la course.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mb-9 max-w-xl text-balance text-base text-white/80 md:text-lg"
          >
            Importe ton GPX, on calcule ton temps ajusté à la pente, tes splits
            km par km et ton plan nutrition. Gratuit, open-source, fait pour la
            commu trail.
          </motion.p>

          <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="/auth/signup">
                Commencer gratuitement
                <ArrowRightIcon size={16} weight="bold" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/40 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:text-white"
            >
              <a href="/auth/login">J&apos;ai déjà un compte</a>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-6 flex items-center gap-2 text-sm text-white/70"
          >
            <PlayIcon size={14} weight="fill" className="text-primary" />
            <a href="#preview" className="transition-colors hover:text-white">
              Ou essaie avec un exemple, sans compte
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
