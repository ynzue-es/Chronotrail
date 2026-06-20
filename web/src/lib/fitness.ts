import { FitnessActivity } from "@/types/course"

export const DEFAULT_REFERENCE_PACE = 360 // 6:00/km par défaut

/**
 * Allure de référence "profil" : moyenne des courses importées, pondérée par
 * la récence (demi-vie ~120 j) et la distance (les longues sont plus fiables).
 * Renvoie null si aucune course.
 */
export function computeProfilePace(
  activities: Pick<
    FitnessActivity,
    "reference_pace_s_per_km" | "distance_m" | "activity_date" | "created_at"
  >[],
): number | null {
  if (activities.length === 0) return null

  const now = Date.now()
  const HALF_LIFE_DAYS = 120

  let sumW = 0
  let sumWP = 0
  for (const a of activities) {
    const dateStr = a.activity_date ?? a.created_at
    const ageDays = Math.max(
      0,
      (now - new Date(dateStr).getTime()) / 86400000,
    )
    const recency = Math.pow(0.5, ageDays / HALF_LIFE_DAYS)
    const distW = Math.sqrt(Math.max(1, a.distance_m) / 1000)
    const w = recency * distW
    sumW += w
    sumWP += w * a.reference_pace_s_per_km
  }
  if (sumW <= 0) return null
  return Math.round(sumWP / sumW)
}
