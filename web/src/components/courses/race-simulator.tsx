"use client"

import * as React from "react"
import {
  PlayIcon,
  PauseIcon,
  ArrowCounterClockwiseIcon,
  DropIcon,
  ForkKnifeIcon,
  ThermometerIcon,
  LightningIcon,
  ClockIcon,
  WarningIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"
import { Prediction, TrackSegment } from "@/types/course"
import { ProfilePoint } from "@/lib/gpx/profile"
import { simulateRace, type SimParams } from "@/lib/sim/race-sim"
import { gradeColor } from "@/lib/grade"
import { formatDuration } from "@/lib/format"

const W = 1000
const H = 220
const PAD = { top: 24, right: 12, bottom: 8, left: 8 }

type Props = {
  profile: ProfilePoint[]
  segments: TrackSegment[]
  prediction: Prediction
  initialCarbs: number
  initialWater: number
}

function barColor(v: number): string {
  if (v >= 50) return "#16a34a"
  if (v >= 25) return "#f59e0b"
  return "#dc2626"
}

function eleAt(profile: ProfilePoint[], distM: number): number {
  if (profile.length === 0) return 0
  let i = 1
  while (i < profile.length && profile[i].distM < distM) i++
  const a = profile[i - 1]
  const b = profile[Math.min(i, profile.length - 1)]
  const span = b.distM - a.distM || 1
  const frac = Math.min(1, Math.max(0, (distM - a.distM) / span))
  return a.ele + (b.ele - a.ele) * frac
}

export function RaceSimulator({
  profile,
  segments,
  prediction,
  initialCarbs,
  initialWater,
}: Props) {
  const [params, setParams] = React.useState<SimParams>({
    carbsPerHour: initialCarbs,
    waterPerHour: initialWater,
    tempC: 18,
    effort: 1,
    cutoffH: 0,
  })
  const [currentT, setCurrentT] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const raf = React.useRef<number | undefined>(undefined)
  const last = React.useRef<number | undefined>(undefined)

  const result = React.useMemo(
    () => simulateRace(segments, prediction, params),
    [segments, prediction, params],
  )
  const maxT = result.abandoned ? result.abandonAtS! : result.finishTimeS

  // Géométrie du profil.
  const geom = React.useMemo(() => {
    const totalDist = profile.length ? profile[profile.length - 1].distM || 1 : 1
    let minEle = Infinity
    let maxEle = -Infinity
    for (const p of profile) {
      if (p.ele < minEle) minEle = p.ele
      if (p.ele > maxEle) maxEle = p.ele
    }
    const span = Math.max(1, maxEle - minEle)
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const x = (d: number) => PAD.left + (d / totalDist) * innerW
    const y = (e: number) => PAD.top + innerH - ((e - minEle) / span) * innerH
    return { totalDist, minEle, x, y, baseY: PAD.top + innerH }
  }, [profile])

  React.useEffect(() => {
    setCurrentT((t) => Math.min(t, maxT))
  }, [maxT])

  React.useEffect(() => {
    if (!playing) return
    const speed = maxT / 22 // toute la course en ~22 s
    const tick = (ts: number) => {
      if (last.current == null) last.current = ts
      const dt = (ts - last.current) / 1000
      last.current = ts
      setCurrentT((prev) => {
        const next = prev + dt * speed
        if (next >= maxT) {
          setPlaying(false)
          return maxT
        }
        return next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      last.current = undefined
    }
  }, [playing, maxT])

  // Point courant de la simulation.
  const cur = React.useMemo(() => {
    const s = result.series
    let i = 0
    while (i < s.length - 1 && s[i + 1].t <= currentT) i++
    return s[i]
  }, [result, currentT])

  const runnerX = geom.x(cur.distM)
  const runnerY = geom.y(eleAt(profile, cur.distM))

  // Dégradé du profil par pente.
  const stops = React.useMemo(() => {
    const total = geom.totalDist
    return profile.map((p, i) => (
      <stop key={i} offset={`${(p.distM / total) * 100}%`} stopColor={gradeColor(p.grade)} />
    ))
  }, [profile, geom.totalDist])

  const areaPath = React.useMemo(() => {
    if (profile.length < 2) return ""
    let d = `M ${geom.x(0)} ${geom.baseY}`
    for (const p of profile) d += ` L ${geom.x(p.distM)} ${geom.y(p.ele)}`
    d += ` L ${geom.x(geom.totalDist)} ${geom.baseY} Z`
    return d
  }, [profile, geom])

  function reset() {
    setPlaying(false)
    setCurrentT(0)
  }

  // Statut courant lisible.
  const status =
    cur.hydration < 15
      ? { txt: "Déshydratation sévère : danger", color: "text-destructive" }
      : cur.energy < 15
        ? { txt: "Fringale : tu passes en mode marche pour tenir", color: "text-amber-600" }
        : cur.hydration < 40
          ? { txt: "Déshydratation : ça ralentit, bois", color: "text-amber-600" }
          : cur.energy < 30
            ? { txt: "Coup de mou : ravitaille-toi", color: "text-amber-600" }
            : cur.freshness < 35
              ? { txt: "Jambes entamées (descentes)", color: "text-amber-600" }
              : { txt: "Ça roule", color: "text-primary" }

  const gauges = [
    { label: "Énergie", value: cur.energy, icon: <ForkKnifeIcon size={14} weight="duotone" /> },
    { label: "Hydratation", value: cur.hydration, icon: <DropIcon size={14} weight="duotone" /> },
    { label: "Fraîcheur", value: cur.freshness, icon: <LightningIcon size={14} weight="duotone" /> },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Verdict */}
      {result.abandoned ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <WarningIcon size={18} weight="fill" className="mt-0.5 shrink-0" />
          <div>
            {result.cause === "barrière horaire" ? (
              <>
                <strong>Hors délai à {formatDuration(result.abandonAtS!)}</strong>
                {" : "}tu n&apos;es qu&apos;à km{" "}
                {((result.abandonDistM ?? 0) / 1000).toFixed(1)} à la barrière.
                Va plus vite, allège le parcours, ou repousse la barrière.
              </>
            ) : (
              <>
                <strong>
                  Abandon probable vers {formatDuration(result.abandonAtS!)}
                </strong>{" "}
                (≈ km {((result.abandonDistM ?? 0) / 1000).toFixed(1)}) :
                déshydratation sévère. Bois davantage.
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircleIcon size={18} weight="fill" className="shrink-0" />
          <span>
            Arrivée estimée en <strong>{formatDuration(result.finishTimeS)}</strong>{" "}
            avec ces réglages.
          </span>
        </div>
      )}

      {/* Profil + bonhomme */}
      <div className="overflow-hidden rounded-lg border border-border">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <defs>
            <linearGradient id="sim-fill" x1="0" y1="0" x2="1" y2="0">
              {stops}
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#sim-fill)" fillOpacity={0.25} />
          <path
            d={areaPath.replace(/ Z$/, "")}
            fill="none"
            stroke="url(#sim-fill)"
            strokeWidth={2}
          />

          {/* abandon */}
          {result.abandoned && result.abandonDistM != null && (
            <line
              x1={geom.x(result.abandonDistM)}
              y1={PAD.top}
              x2={geom.x(result.abandonDistM)}
              y2={geom.baseY}
              stroke="#dc2626"
              strokeDasharray="4 3"
            />
          )}

          {/* trace parcourue */}
          <line
            x1={geom.x(0)}
            y1={geom.baseY}
            x2={runnerX}
            y2={geom.baseY}
            stroke={barColor(Math.min(cur.energy, cur.hydration))}
            strokeWidth={3}
            opacity={0.5}
          />

          {/* bonhomme */}
          <g transform={`translate(${runnerX} ${runnerY})`}>
            <line x1={0} y1={0} x2={0} y2={-22} stroke="currentColor" strokeWidth={1} opacity={0.25} />
            <circle cx={0} cy={0} r={7} fill={barColor(Math.min(cur.energy, cur.hydration))} stroke="#fff" strokeWidth={2} />
            <text x={0} y={-26} textAnchor="middle" fontSize={16}>🏃</text>
          </g>
        </svg>
      </div>

      {/* Lecture */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (currentT >= maxT) setCurrentT(0)
            setPlaying((p) => !p)
          }}
          className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label={playing ? "Pause" : "Lecture"}
        >
          {playing ? <PauseIcon size={16} weight="fill" /> : <PlayIcon size={16} weight="fill" />}
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Recommencer"
        >
          <ArrowCounterClockwiseIcon size={15} weight="bold" />
        </button>
        <input
          type="range"
          min={0}
          max={maxT}
          step={1}
          value={currentT}
          onChange={(e) => {
            setPlaying(false)
            setCurrentT(Number(e.target.value))
          }}
          className="flex-1 accent-[var(--color-primary)]"
        />
        <span className="w-24 text-right text-sm tabular-nums">
          {formatDuration(currentT)} / {formatDuration(maxT)}
        </span>
      </div>

      {/* Jauges */}
      <div className="grid gap-2 sm:grid-cols-3">
        {gauges.map((g) => (
          <div key={g.label} className="rounded-md border border-border/60 p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                {g.icon}
                {g.label}
              </span>
              <span className="font-semibold tabular-nums">
                {Math.round(g.value)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${g.value}%`, backgroundColor: barColor(g.value) }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className={`text-sm font-medium ${status.color}`}>État : {status.txt}</p>

      {/* Paramètres */}
      <div className="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
        <Slider
          icon={<ForkKnifeIcon size={14} weight="duotone" />}
          label="Glucides"
          value={params.carbsPerHour}
          min={0}
          max={90}
          step={5}
          unit="g/h"
          onChange={(v) => setParams((p) => ({ ...p, carbsPerHour: v }))}
        />
        <Slider
          icon={<DropIcon size={14} weight="duotone" />}
          label="Eau"
          value={params.waterPerHour}
          min={0}
          max={1000}
          step={50}
          unit="ml/h"
          onChange={(v) => setParams((p) => ({ ...p, waterPerHour: v }))}
        />
        <Slider
          icon={<ThermometerIcon size={14} weight="duotone" />}
          label="Température"
          value={params.tempC}
          min={0}
          max={40}
          step={1}
          unit="°C"
          onChange={(v) => setParams((p) => ({ ...p, tempC: v }))}
        />
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <LightningIcon size={14} weight="duotone" />
            Allure
          </span>
          <div className="flex gap-1">
            {[
              { k: "Prudent", v: 0.92 },
              { k: "Normal", v: 1 },
              { k: "Agressif", v: 1.12 },
            ].map((o) => (
              <button
                key={o.k}
                type="button"
                onClick={() => setParams((p) => ({ ...p, effort: o.v }))}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                  Math.abs(params.effort - o.v) < 0.01
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {o.k}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon size={14} weight="duotone" />
            Barrière horaire
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={0.5}
              value={params.cutoffH || ""}
              placeholder="aucune"
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  cutoffH: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="h-9 w-24 rounded-md border border-input bg-background px-2 text-sm"
            />
            <span className="text-xs text-muted-foreground">
              h (0 = aucune)
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Modèle illustratif : on suit la réserve de glycogène (≈ 450 g) et le
        déficit hydrique. Si le glycogène chute, tu ralentis (mode marche) au
        lieu d&apos;abandonner. L&apos;abandon vient d&apos;une barrière horaire
        dépassée ou d&apos;une déshydratation sévère. Pas un avis médical.
      </p>

      {/* Sources */}
      <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">
          Sur quoi repose le modèle
        </p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>
            Réserve de glycogène ~400-500 g, conso ~100-120 g/h à intensité
            soutenue, épargnée par les graisses quand on ralentit.{" "}
            <a
              href="https://www.trainingpeaks.com/blog/the-importance-of-carbohydrates-and-glycogen-for-athletes/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TrainingPeaks
            </a>
            ,{" "}
            <a
              href="https://www.cleaneatzkitchen.com/a/blog/glycogen-depletion-by-exercise-intensity-and-time"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Glycogen depletion by intensity
            </a>
          </li>
          <li>
            Apport glucidique 30-90 g/h (cap d&apos;oxydation).{" "}
            <a
              href="https://usecadence.com/blogs/science/carbohydrate-fuel-guide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Cadence · Carbohydrate Fuel Guide
            </a>
          </li>
          <li>Déshydratation : perte &gt; 2 % du poids = baisse de perf ; sévère vers 8-10 %.</li>
        </ul>
      </div>
    </div>
  )
}

function Slider({
  icon,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-medium tabular-nums">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-[var(--color-primary)]"
      />
    </div>
  )
}
