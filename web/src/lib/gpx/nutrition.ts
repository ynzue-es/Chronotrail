import {
  CuePoint,
  NutritionSettings,
  Prediction,
  TrackPoint,
  TrackSegment,
} from "@/types/course"

/**
 * Génère les points de relance hydratation / nutrition.
 * Un rappel est posé tous les `intervalMin` minutes de temps estimé, positionné
 * sur le lieu (lat/lng) et le km atteints à cet instant. Les quantités sont
 * proratisées sur le temps écoulé depuis le rappel précédent.
 */
export function computeCues(
  points: TrackPoint[],
  segments: TrackSegment[],
  prediction: Prediction,
  nutrition: NutritionSettings,
  intervalMin = 20,
): CuePoint[] {
  const total = prediction.totalTimeS
  if (total <= 0 || points.length < 2) return []

  // Temps et distance cumulés à chaque point (boundary entre segments).
  const cumTime = new Array<number>(points.length).fill(0)
  const cumDist = new Array<number>(points.length).fill(0)
  for (let i = 0; i < segments.length; i++) {
    cumTime[i + 1] = cumTime[i] + (prediction.segmentTimes[i] ?? 0)
    cumDist[i + 1] = segments[i].cumDistM
  }

  const interval = intervalMin * 60
  const cues: CuePoint[] = []
  let prevT = 0
  let idx = 1

  for (let t = interval; t < total; t += interval) {
    while (idx < points.length && cumTime[idx] < t) idx++
    if (idx >= points.length) break

    const a = points[idx - 1]
    const b = points[idx]
    const span = cumTime[idx] - cumTime[idx - 1]
    const frac = span > 0 ? (t - cumTime[idx - 1]) / span : 0

    const lat = a.lat + (b.lat - a.lat) * frac
    const lng = a.lng + (b.lng - a.lng) * frac
    const distM = cumDist[idx - 1] + (cumDist[idx] - cumDist[idx - 1]) * frac

    const dt = t - prevT
    cues.push({
      timeS: t,
      km: distM / 1000,
      lat,
      lng,
      carbsG: (nutrition.carbsPerHour * dt) / 3600,
      waterMl: (nutrition.waterPerHour * dt) / 3600,
    })
    prevT = t
  }

  return cues
}
