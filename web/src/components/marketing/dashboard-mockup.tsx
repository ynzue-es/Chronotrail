"use client"

import { AppleLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { motion, useReducedMotion } from "motion/react"

export function DashboardMockup() {
  const reduce = useReducedMotion()
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5 md:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            UTMB · CCC
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            Courmayeur → Chamonix
          </h3>
        </div>
        <div className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-primary">
          Prédiction
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Distance" value="101" unit="km" />
        <Stat label="D+" value="6100" unit="m" />
        <Stat label="km-effort" value="162" unit="" />
      </div>

      <div className="mb-5 rounded-xl border border-border bg-muted/40 p-4">
        <p className="mb-1 text-xs text-muted-foreground">Temps prédit</p>
        <p className="font-mono text-3xl font-semibold tracking-tight">
          22<span className="text-muted-foreground">h</span>47
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Allure moyenne · 13:32 / km-effort
        </p>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Profil altimétrique</span>
          <span className="font-mono">0 → 101 km</span>
        </div>
        <svg
          viewBox="0 0 300 70"
          className="h-16 w-full text-primary"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,60 L15,45 L30,30 L45,20 L60,35 L75,15 L95,25 L115,10 L135,20 L155,5 L180,25 L205,15 L230,35 L255,25 L280,40 L300,55 L300,70 L0,70 Z"
            fill="url(#elevGrad)"
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
          />
          <motion.path
            d="M0,60 L15,45 L30,30 L45,20 L60,35 L75,15 L95,25 L115,10 L135,20 L155,5 L180,25 L205,15 L230,35 L255,25 L280,40 L300,55"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: "easeInOut", delay: 0.6 }}
          />
        </svg>
      </div>

      <div className="rounded-xl border border-border bg-accent/40 p-3">
        <div className="mb-2 flex items-center gap-2">
          <AppleLogoIcon size={14} weight="duotone" className="text-primary" />
          <p className="text-xs font-medium">Plan nutrition</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <NutritionItem value="80g" label="glucides/h" />
          <NutritionItem value="500ml" label="eau/h" />
          <NutritionItem value="1g" label="sel/h" />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold tracking-tight">
        {value}
        {unit && <span className="text-xs text-muted-foreground"> {unit}</span>}
      </p>
    </div>
  )
}

function NutritionItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-sm font-semibold">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  )
}