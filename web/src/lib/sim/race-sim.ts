import { Prediction, TrackSegment } from "@/types/course"

export type SimParams = {
  carbsPerHour: number // glucides ingérés (g/h)
  waterPerHour: number // eau bue (ml/h)
  tempC: number // température extérieure
  effort: number // multiplicateur d'allure (0.9 prudent … 1.15 agressif)
  cutoffH: number // barrière horaire (h) ; 0 = aucune
}

export type SimPoint = {
  t: number // temps écoulé (s)
  distM: number
  energy: number // réserve glucidique 0-100
  hydration: number // 0-100 (100 = bien hydraté)
  freshness: number // fraîcheur musculaire 0-100
  perf: number // facteur de performance (0.4 = marche … 1)
}

export type SimResult = {
  series: SimPoint[]
  finishTimeS: number
  baselineTimeS: number
  abandoned: boolean
  abandonAtS: number | null
  abandonDistM: number | null
  cause: "barrière horaire" | "déshydratation" | null
}

const WEIGHT_KG = 70
const GLYCOGEN_START = WEIGHT_KG * 6.4 // ~450 g (~1800 kcal) de réserve glucidique

const clampPct = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))

/** Surcoût métabolique selon la pente (vs plat). */
function costMult(grade: number): number {
  if (grade > 0) return 1 + 4 * Math.min(grade, 0.45)
  return Math.max(0.6, 1 + 1.8 * Math.max(grade, -0.45))
}

/**
 * Réduit segments + temps à ~maxBins tronçons agrégés.
 */
export function downsampleForSim(
  segments: TrackSegment[],
  prediction: Prediction,
  maxBins = 300,
): { segments: TrackSegment[]; prediction: Prediction } {
  const n = segments.length
  if (n <= maxBins) return { segments, prediction }
  const size = Math.ceil(n / maxBins)
  const outSeg: TrackSegment[] = []
  const outTimes: number[] = []
  for (let i = 0; i < n; i += size) {
    let dist = 0
    let gain = 0
    let loss = 0
    let time = 0
    let cumDistM = segments[i].cumDistM
    for (let j = i; j < Math.min(i + size, n); j++) {
      dist += segments[j].distM
      gain += segments[j].gain
      loss += segments[j].loss
      time += prediction.segmentTimes[j] ?? 0
      cumDistM = segments[j].cumDistM
    }
    const grade = dist > 0 ? (gain - loss) / dist : 0
    outSeg.push({ fromIdx: i, distM: dist, gain, loss, grade, cumDistM })
    outTimes.push(time)
  }
  return {
    segments: outSeg,
    prediction: { totalTimeS: prediction.totalTimeS, segmentTimes: outTimes },
  }
}

/**
 * Modèle énergétique : on suit la réserve de glycogène (g) et le déficit
 * hydrique (L). Quand le glycogène baisse, on RALENTIT (donc on brûle moins et
 * on tient sur les graisses) → on peut finir en marchant. L'abandon n'arrive
 * que sur barrière horaire dépassée ou déshydratation sévère (> ~9 %).
 */
export function simulateRace(
  segments: TrackSegment[],
  prediction: Prediction,
  params: SimParams,
): SimResult {
  const baselineTimeS = prediction.totalTimeS
  const effort = Math.max(0.7, params.effort)
  const cutoffS = params.cutoffH > 0 ? params.cutoffH * 3600 : Infinity

  let glycogen = GLYCOGEN_START
  let deficitL = 0
  let freshness = 100
  let t = 0
  let abandonAtS: number | null = null
  let abandonDistM: number | null = null
  let cause: SimResult["cause"] = null

  const dehydrationPct = () => (deficitL / WEIGHT_KG) * 100

  const stateToPoint = (distM: number): SimPoint => {
    const energy = clampPct((glycogen / GLYCOGEN_START) * 100)
    const hydration = clampPct(100 - dehydrationPct() * 12.5)
    return { t, distM, energy, hydration, freshness, perf: perfNow() }
  }

  function perfNow(): number {
    const gRatio = glycogen / GLYCOGEN_START
    const pe = gRatio >= 0.15 ? 1 : 0.5 + (0.5 * gRatio) / 0.15 // bonk -> marche (0.5)
    const dh = dehydrationPct()
    const ph = dh <= 2 ? 1 : Math.max(0.6, 1 - (dh - 2) * 0.06)
    const pf = 0.8 + (0.2 * freshness) / 100
    return Math.max(0.4, Math.min(1, pe * ph * pf))
  }

  const raw: SimPoint[] = [stateToPoint(0)]

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const grade = seg.grade
    const baseDtH = (prediction.segmentTimes[i] ?? 0) / effort / 3600
    if (baseDtH <= 0) continue

    const perf = perfNow()
    const actualDtH = baseDtH / perf
    const power = Math.max(0.4, Math.min(1.2, perf * effort))
    const hours = t / 3600
    const fatSpare = Math.max(0.6, 1 - 0.05 * hours) // au fil des heures, plus de gras, moins de glucides

    // Glycogène (g) : conso (×puissance ×pente ×épargne) vs apport (cap 90 g/h).
    const carbBurn = 95 * power * costMult(grade) * fatSpare * actualDtH
    const carbIntake = Math.min(params.carbsPerHour, 90) * actualDtH
    glycogen = Math.max(0, Math.min(GLYCOGEN_START, glycogen + carbIntake - carbBurn))

    // Hydratation (déficit en L).
    const sweat =
      (0.5 + 0.5 * Math.max(0, (params.tempC - 12) / 10) + 0.3 * power) * actualDtH
    const drink = (params.waterPerHour / 1000) * actualDtH
    deficitL = Math.max(-0.5, deficitL + sweat - drink)

    // Fraîcheur musculaire (temps + descentes + détresse).
    const distress = glycogen / GLYCOGEN_START < 0.15 ? 1 : 0
    const freshLoss = (6 + 35 * Math.max(0, -grade) + distress * 4) * actualDtH
    freshness = clampPct(freshness - freshLoss)

    t += actualDtH * 3600

    // Abandon : barrière horaire ou déshydratation sévère.
    if (!abandonAtS && t > cutoffS) {
      abandonAtS = cutoffS
      abandonDistM = seg.cumDistM
      cause = "barrière horaire"
    }
    if (!abandonAtS && dehydrationPct() >= 9) {
      abandonAtS = t
      abandonDistM = seg.cumDistM
      cause = "déshydratation"
    }

    raw.push(stateToPoint(seg.cumDistM))
  }

  const step = Math.max(1, Math.ceil(raw.length / 240))
  const series = raw.filter((_, i) => i % step === 0 || i === raw.length - 1)

  return {
    series,
    finishTimeS: t,
    baselineTimeS,
    abandoned: abandonAtS != null,
    abandonAtS,
    abandonDistM,
    cause,
  }
}
