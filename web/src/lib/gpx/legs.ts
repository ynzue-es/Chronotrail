import {
  AidStation,
  NutritionSettings,
  Prediction,
  TrackSegment,
} from "@/types/course"
import { FuelProduct } from "@/lib/gpx/fueling"

export type Leg = {
  index: number
  fromName: string
  toName: string
  fromKm: number
  toKm: number
  distanceM: number
  timeS: number // durée de l'étape
  arrivalS: number // temps cumulé à la fin de l'étape (heure de passage au ravito)
  gain: number
  loss: number
  carbsG: number // glucides à consommer/emporter sur l'étape
  waterMl: number
  units: number | null // portions du produit à emporter (arrondi au-dessus)
  demanding: boolean // étape exigeante (gros D+/km ou longue)
}

/** Temps cumulé estimé à une distance donnée (interpolé). */
function timeAtDist(
  cumDist: number[],
  cumTime: number[],
  distM: number,
): number {
  if (distM <= 0) return 0
  const last = cumDist.length - 1
  if (distM >= cumDist[last]) return cumTime[last]
  let i = 1
  while (i < cumDist.length && cumDist[i] < distM) i++
  const span = cumDist[i] - cumDist[i - 1]
  const frac = span > 0 ? (distM - cumDist[i - 1]) / span : 0
  return cumTime[i - 1] + (cumTime[i] - cumTime[i - 1]) * frac
}

/**
 * Découpe la course en étapes entre ravitos et calcule, pour chacune, le temps,
 * le D+/D-, et les ressources à emporter (glucides/eau) — la "gestion des
 * ressources" entre deux points de ravitaillement.
 */
export function computeLegs(
  segments: TrackSegment[],
  prediction: Prediction,
  nutrition: NutritionSettings,
  aidStations: AidStation[],
  product: FuelProduct | null = null,
): Leg[] {
  if (segments.length === 0) return []
  const totalDistM = segments[segments.length - 1].cumDistM

  // Cumuls par point.
  const cumDist = [0]
  const cumTime = [0]
  for (let i = 0; i < segments.length; i++) {
    cumDist.push(segments[i].cumDistM)
    cumTime.push(cumTime[i] + (prediction.segmentTimes[i] ?? 0))
  }

  // Bornes : départ + ravitos (km valides, triés, dédupliqués) + arrivée.
  const stations = [...aidStations]
    .map((a) => ({ km: a.km, name: a.name?.trim() || "" }))
    .filter((a) => a.km > 0.05 && a.km * 1000 < totalDistM - 50)
    .sort((a, b) => a.km - b.km)

  const bounds: { distM: number; name: string }[] = [{ distM: 0, name: "Départ" }]
  stations.forEach((s, i) =>
    bounds.push({ distM: s.km * 1000, name: s.name || `Ravito ${i + 1}` }),
  )
  bounds.push({ distM: totalDistM, name: "Arrivée" })

  const legs: Leg[] = []
  for (let i = 0; i < bounds.length - 1; i++) {
    const a = bounds[i]
    const b = bounds[i + 1]
    const distanceM = b.distM - a.distM
    if (distanceM <= 0) continue

    const tA = timeAtDist(cumDist, cumTime, a.distM)
    const tB = timeAtDist(cumDist, cumTime, b.distM)
    const timeS = tB - tA

    // D+/D- de l'étape.
    let gain = 0
    let loss = 0
    for (const s of segments) {
      const start = s.cumDistM - s.distM
      if (start >= a.distM && s.cumDistM <= b.distM + 1) {
        gain += s.gain
        loss += s.loss
      }
    }

    const hours = timeS / 3600
    const carbsG = nutrition.carbsPerHour * hours
    const waterMl = nutrition.waterPerHour * hours
    const units =
      product && product.carbsG > 0
        ? Math.max(1, Math.ceil(carbsG / product.carbsG))
        : null
    const gainPerKm = distanceM > 0 ? gain / (distanceM / 1000) : 0
    const demanding = gainPerKm >= 55 || timeS >= 2 * 3600

    legs.push({
      index: i + 1,
      fromName: a.name,
      toName: b.name,
      fromKm: a.distM / 1000,
      toKm: b.distM / 1000,
      distanceM,
      timeS,
      arrivalS: tB,
      gain,
      loss,
      carbsG,
      waterMl,
      units,
      demanding,
    })
  }

  return legs
}
