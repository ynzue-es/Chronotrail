import { Bounds, CourseStats, TrackPoint, TrackSegment } from "@/types/course"

const EARTH_R = 6371000 // rayon terrestre moyen (m)

/** Distance haversine entre deux points (m). */
export function haversine(a: TrackPoint, b: TrackPoint): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Moyenne glissante simple sur les altitudes pour atténuer le bruit GPS. */
function smoothElevations(points: TrackPoint[], window = 5): number[] {
  const n = points.length
  const out = new Array<number>(n)
  const half = Math.floor(window / 2)
  for (let i = 0; i < n; i++) {
    let sum = 0
    let count = 0
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < n) {
        sum += points[j].ele
        count++
      }
    }
    out[i] = sum / count
  }
  return out
}

function computeBounds(points: TrackPoint[]): Bounds {
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lng > maxLng) maxLng = p.lng
  }
  return { minLat, maxLat, minLng, maxLng }
}

/**
 * Calcule distance, D+/D- (lissés), bounds et la liste des segments enrichis.
 * Le D+/D- n'est compté qu'au-delà d'un petit seuil pour éviter de cumuler
 * le bruit d'altitude (hystérésis sur l'altitude lissée).
 */
export function computeStats(points: TrackPoint[]): CourseStats {
  const ele = smoothElevations(points)
  const segments: TrackSegment[] = []

  let distanceM = 0
  let elevationGainM = 0
  let elevationLossM = 0

  // Hystérésis : on ne valide une variation d'altitude qu'au-delà de NOISE.
  const NOISE = 1.5 // m
  let refEle = ele[0]

  for (let i = 0; i < points.length - 1; i++) {
    const dist = haversine(points[i], points[i + 1])
    distanceM += dist

    const deltaSeg = ele[i + 1] - ele[i]
    const grade = dist > 0.5 ? Math.max(-1, Math.min(1, deltaSeg / dist)) : 0

    // D+/D- avec hystérésis sur l'altitude lissée
    let gain = 0
    let loss = 0
    const deltaRef = ele[i + 1] - refEle
    if (deltaRef > NOISE) {
      gain = deltaRef
      elevationGainM += deltaRef
      refEle = ele[i + 1]
    } else if (deltaRef < -NOISE) {
      loss = -deltaRef
      elevationLossM += -deltaRef
      refEle = ele[i + 1]
    }

    segments.push({
      fromIdx: i,
      distM: dist,
      gain,
      loss,
      grade,
      cumDistM: distanceM,
    })
  }

  return {
    distanceM,
    elevationGainM,
    elevationLossM,
    bounds: computeBounds(points),
    segments,
  }
}
