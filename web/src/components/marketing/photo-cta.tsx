"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

export function PhotoCta() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  // Gentle vertical parallax on the photo as the band scrolls through.
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"])

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div className="absolute inset-0 scale-125" style={{ y }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/trail-runners.jpg"
          alt="Deux traileurs sur un sentier de montagne"
          className="h-full w-full object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35" />

      <div className="relative mx-auto max-w-4xl px-6 py-28 text-center md:py-36">
        <motion.h2
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl"
        >
          Prêt pour ta prochaine ligne de départ ?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mx-auto mb-9 max-w-xl text-balance text-white/80 md:text-lg"
        >
          Un GPX, ton allure de référence, et tu pars avec un plan de course
          béton. En deux minutes, sans compte payant.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <Button size="lg" asChild>
            <a href="/auth/signup">
              Préparer ma course
              <ArrowRightIcon size={16} weight="bold" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
