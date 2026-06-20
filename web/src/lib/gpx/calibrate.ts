import { TrackPoint } from "@/types/course"
import { computeStats } from "./stats"
import { gradeSpeedFactor } from "./prediction"

export type Calibration = {
  referencePaceSecPerKm: number // allure de référence sur le plat déduite
  movingTimeS: number // temps réel retenu (pauses longues exclues)
  distanceM: number
  elevationGainM: number
  activityDate: string | null // date de l'activité (ISO YYYY-MM-DD)
}

/**
 * Déduit l'allure de référence sur le plat à partir d'une COURSE PASSÉE réelle
 * (GPX d'activité, avec horodatage). On inverse le modèle d'ajustement à la
 * pente : temps_total = allure_plat × Σ(dist_i / facteur_pente_i) / 1000,
 * donc allure_plat = temps_réel / Σ(dist_i / facteur_pente_i) × 1000.
 *
 * Lève une erreur si le GPX n'a pas d'horodatage (c'est alors un parcours, pas
 * une activité enregistrée).
 */
export function calibrateFromActivity(points: TrackPoint[]): Calibration {
  const withTime = points.filter((p) => p.time)
  if (withTime.length < 2) {
    throw new Error(
      "Ce GPX n'a pas d'horodatage : exporte une activité enregistrée (et non un parcours/itinéraire).",
    )
  }

  // Temps réel : somme des intervalles, en ignorant les longues pauses (> 5 min)
  // pour rester proche du temps de déplacement.
  let movingTimeS = 0
  for (let i = 0; i < points.length - 1; i++) {
    const t1 = points[i].time
    const t2 = points[i + 1].time
    if (!t1 || !t2) continue
    const dt = (new Date(t2).getTime() - new Date(t1).getTime()) / 1000
    if (dt > 0 && dt < 300) movingTimeS += dt
  }
  if (movingTimeS <= 0) {
    throw new Error("Horodatage du GPX inexploitable.")
  }

  const stats = computeStats(points)

  // Σ(dist_i / facteur_pente_i), l'effort « équivalent plat » de la course.
  let flatEquivM = 0
  for (const seg of stats.segments) {
    flatEquivM += seg.distM / gradeSpeedFactor(seg.grade)
  }
  if (flatEquivM <= 0) {
    throw new Error("Trace inexploitable pour la calibration.")
  }

  const referencePaceSecPerKm = (movingTimeS / flatEquivM) * 1000

  const firstTime = withTime[0].time
  const d = firstTime ? new Date(firstTime) : null
  const activityDate =
    d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : null

  return {
    referencePaceSecPerKm,
    movingTimeS,
    distanceM: stats.distanceM,
    elevationGainM: stats.elevationGainM,
    activityDate,
  }
}
