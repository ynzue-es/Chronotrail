import {
  NutritionSettings,
  Prediction,
  Split,
  TrackSegment,
} from "@/types/course"

/**
 * Découpe la course en splits par km à partir des segments et de la prédiction.
 * Chaque segment est rattaché au km dans lequel tombe sa fin (cumDistM).
 * Les besoins nutrition/eau sont proratisés sur le temps passé dans le km.
 */
export function computeSplits(
  segments: TrackSegment[],
  prediction: Prediction,
  nutrition: NutritionSettings,
): Split[] {
  const splits: Split[] = []
  if (segments.length === 0) return splits

  let cumTimeS = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const t = prediction.segmentTimes[i] ?? 0
    const kmIndex = Math.floor(seg.cumDistM / 1000) // 0-based

    let split = splits[kmIndex]
    if (!split) {
      split = {
        km: kmIndex + 1,
        distanceM: 0,
        elevationGainM: 0,
        elevationLossM: 0,
        avgGrade: 0,
        timeS: 0,
        cumTimeS: 0,
        paceSecPerKm: 0,
        carbsG: 0,
        waterMl: 0,
      }
      splits[kmIndex] = split
    }

    split.distanceM += seg.distM
    split.elevationGainM += seg.gain
    split.elevationLossM += seg.loss
    split.timeS += t
  }

  // Compacte (au cas où un index serait resté vide) et finalise les dérivés.
  const dense = splits.filter(Boolean)
  for (const split of dense) {
    cumTimeS += split.timeS
    split.cumTimeS = cumTimeS
    split.paceSecPerKm =
      split.distanceM > 0 ? (split.timeS / split.distanceM) * 1000 : 0
    split.avgGrade =
      split.distanceM > 0
        ? (split.elevationGainM - split.elevationLossM) / split.distanceM
        : 0
    split.carbsG = (nutrition.carbsPerHour * split.timeS) / 3600
    split.waterMl = (nutrition.waterPerHour * split.timeS) / 3600
  }

  return dense
}
