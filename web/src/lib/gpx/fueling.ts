import {
  NutritionSettings,
  Prediction,
  TrackPoint,
  TrackSegment,
} from "@/types/course"

export type FuelProduct = { name: string; carbsG: number }

export type FuelEvent = {
  index: number // 1, 2, 3…
  timeS: number // temps écoulé estimé au moment de la prise
  km: number
  lat: number
  lng: number
  carbsG: number // glucides ingérés à ce point
  waterMl: number
  units: number | null // nombre de portions du produit (si produit choisi)
  note: string | null // ex. "juste avant une montée"
}

export type BalancePoint = {
  min: number // minutes écoulées
  need: number // glucides théoriquement consommés (besoin cumulé)
  intake: number // glucides apportés cumulés par le plan
}

export type FuelingPlan = {
  events: FuelEvent[]
  series: BalancePoint[]
  intervalMin: number
  carbsPerHour: number
  waterPerHour: number
  totalCarbsG: number
  totalWaterMl: number
  product: FuelProduct | null
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/**
 * Construit un plan d'alimentation : des prises espacées dans le temps (et non
 * km par km), exprimées en produits si un produit est fourni, positionnées sur
 * le parcours, avec un repère "avant la montée", et une courbe apport/besoin.
 */
export function buildFuelingPlan(
  points: TrackPoint[],
  segments: TrackSegment[],
  prediction: Prediction,
  nutrition: NutritionSettings,
  product: FuelProduct | null = null,
): FuelingPlan {
  const total = prediction.totalTimeS
  const empty: FuelingPlan = {
    events: [],
    series: [],
    intervalMin: 25,
    carbsPerHour: nutrition.carbsPerHour,
    waterPerHour: nutrition.waterPerHour,
    totalCarbsG: 0,
    totalWaterMl: 0,
    product,
  }
  if (total <= 0 || points.length < 2) return empty

  // Intervalle : calé sur le produit (une portion ≈ une prise) sinon 25 min.
  const intervalMin =
    product && product.carbsG > 0 && nutrition.carbsPerHour > 0
      ? clamp(Math.round(((product.carbsG / nutrition.carbsPerHour) * 60) / 5) * 5, 15, 40)
      : 25
  const interval = intervalMin * 60

  // Temps / distance cumulés par point.
  const cumTime = new Array<number>(points.length).fill(0)
  const cumDist = new Array<number>(points.length).fill(0)
  for (let i = 0; i < segments.length; i++) {
    cumTime[i + 1] = cumTime[i] + (prediction.segmentTimes[i] ?? 0)
    cumDist[i + 1] = segments[i].cumDistM
  }

  // D+ à venir dans les ~400 m après une distance donnée (pour caler "avant la côte").
  const gainAhead = (distM: number): number => {
    let gain = 0
    for (const s of segments) {
      const start = s.cumDistM - s.distM
      if (start >= distM && start <= distM + 450) gain += s.gain
      if (start > distM + 450) break
    }
    return gain
  }

  const events: FuelEvent[] = []
  let idx = 1
  let p = 1
  for (let t = interval; t < total - 120; t += interval) {
    while (p < points.length && cumTime[p] < t) p++
    if (p >= points.length) break
    const a = points[p - 1]
    const b = points[p]
    const span = cumTime[p] - cumTime[p - 1]
    const frac = span > 0 ? (t - cumTime[p - 1]) / span : 0
    const lat = a.lat + (b.lat - a.lat) * frac
    const lng = a.lng + (b.lng - a.lng) * frac
    const distM = cumDist[p - 1] + (cumDist[p] - cumDist[p - 1]) * frac

    const carbsTarget = (nutrition.carbsPerHour * interval) / 3600
    const units = product && product.carbsG > 0
      ? Math.max(1, Math.round(carbsTarget / product.carbsG))
      : null
    const carbsG = units != null ? units * product!.carbsG : carbsTarget
    const waterMl = (nutrition.waterPerHour * interval) / 3600
    const note = gainAhead(distM) >= 25 ? "juste avant une montée" : null

    events.push({
      index: idx++,
      timeS: t,
      km: distM / 1000,
      lat,
      lng,
      carbsG,
      waterMl,
      units,
      note,
    })
  }

  // Courbe besoin cumulé vs apport cumulé (échantillon par minute).
  const series: BalancePoint[] = []
  const totalMin = Math.ceil(total / 60)
  for (let m = 0; m <= totalMin; m++) {
    const tSec = m * 60
    const need = (nutrition.carbsPerHour * tSec) / 3600
    let intake = 0
    for (const e of events) {
      if (e.timeS <= tSec) intake += e.carbsG
      else break
    }
    series.push({ min: m, need: Math.round(need), intake: Math.round(intake) })
  }

  return {
    events,
    series,
    intervalMin,
    carbsPerHour: nutrition.carbsPerHour,
    waterPerHour: nutrition.waterPerHour,
    totalCarbsG: events.reduce((a, e) => a + e.carbsG, 0),
    totalWaterMl: events.reduce((a, e) => a + e.waterMl, 0),
    product,
  }
}
