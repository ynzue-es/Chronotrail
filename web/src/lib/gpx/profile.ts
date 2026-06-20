import { TrackPoint, TrackSegment } from "@/types/course"

export type ProfilePoint = {
  distM: number // distance cumulée
  ele: number // altitude
  grade: number // pente moyenne autour du point
}

/**
 * Échantillonne le profil altimétrique à ~maxSamples points pour un rendu léger.
 * S'appuie sur les segments (cumDistM, grade) déjà calculés par computeStats.
 */
export function sampleProfile(
  points: TrackPoint[],
  segments: TrackSegment[],
  maxSamples = 400,
): ProfilePoint[] {
  const n = segments.length
  if (n === 0) return []

  const step = Math.max(1, Math.ceil(n / maxSamples))
  const out: ProfilePoint[] = []

  // Premier point
  out.push({ distM: 0, ele: points[0].ele, grade: segments[0].grade })

  for (let i = 0; i < n; i += step) {
    const seg = segments[i]
    out.push({
      distM: seg.cumDistM,
      ele: points[seg.fromIdx + 1]?.ele ?? points[seg.fromIdx].ele,
      grade: seg.grade,
    })
  }

  // Dernier point exact
  const last = segments[n - 1]
  out.push({
    distM: last.cumDistM,
    ele: points[points.length - 1].ele,
    grade: last.grade,
  })

  return out
}
