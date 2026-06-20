import { Prediction, TrackSegment } from "@/types/course"

/**
 * Coût énergétique de la course à pied en fonction de la pente (Minetti et al., 2002).
 * `i` = pente (rise/run), valide ~[-0.45, 0.45]. Renvoie le coût en J/kg/m.
 * Le coût au plat (i = 0) vaut 3.6.
 */
function minettiCost(i: number): number {
  const g = Math.max(-0.45, Math.min(0.45, i))
  return (
    155.4 * g ** 5 -
    30.4 * g ** 4 -
    43.3 * g ** 3 +
    46.3 * g ** 2 +
    19.5 * g +
    3.6
  )
}

const FLAT_COST = 3.6

/**
 * Facteur de vitesse relatif au plat pour une pente donnée.
 * < 1 en montée (on ralentit), > 1 en descente modérée (on accélère).
 */
export function gradeSpeedFactor(grade: number): number {
  return FLAT_COST / minettiCost(grade)
}

/** Convertit une allure (s/km) en vitesse (m/s). */
export function paceToSpeed(paceSecPerKm: number): number {
  return 1000 / paceSecPerKm
}

/**
 * Prédit le temps de course à partir d'une allure de référence sur le plat,
 * en ajustant la vitesse segment par segment selon la pente.
 */
export function predict(
  segments: TrackSegment[],
  referencePaceSecPerKm: number,
): Prediction {
  const flatSpeed = paceToSpeed(referencePaceSecPerKm)
  const segmentTimes = new Array<number>(segments.length)
  let totalTimeS = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const speed = flatSpeed * gradeSpeedFactor(seg.grade)
    // garde-fou : vitesse minimale plausible en très forte montée (~3 km/h)
    const safeSpeed = Math.max(speed, 0.83)
    const t = seg.distM / safeSpeed
    segmentTimes[i] = t
    totalTimeS += t
  }

  return { totalTimeS, segmentTimes }
}
