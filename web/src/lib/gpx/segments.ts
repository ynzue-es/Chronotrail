import { KeySegment, Prediction, TrackSegment } from "@/types/course"

type Dir = "up" | "down" | "flat"

function classify(grade: number): Dir {
  if (grade > 0.02) return "up"
  if (grade < -0.02) return "down"
  return "flat"
}

function kmAt(distM: number): number {
  return distM / 1000
}

function labelFor(type: "climb" | "descent", elevationM: number, grade: number): string {
  const pct = Math.abs(grade * 100)
  if (type === "climb") {
    if (elevationM >= 400 || pct >= 12) return "Grosse côte"
    if (elevationM >= 150) return "Côte"
    return "Bosse"
  }
  if (pct >= 12) return "Descente raide"
  if (elevationM >= 200) return "Longue descente"
  return "Descente"
}

/**
 * Détecte les segments marquants (côtes / descentes) en regroupant les
 * micro-segments de même tendance. Les courtes interruptions (plat / sens
 * inverse) plus courtes que GAP_M sont absorbées dans le segment courant.
 * On ne conserve que les segments significatifs (dénivelé ou longueur).
 */
export function detectKeySegments(
  segments: TrackSegment[],
  prediction: Prediction,
): KeySegment[] {
  const GAP_M = 120 // tolérance d'interruption absorbée (m)
  const MIN_ELEV_M = 30 // dénivelé minimal pour retenir un segment
  const MIN_DIST_M = 250 // ou longueur minimale

  const result: KeySegment[] = []

  let runDir: Dir | null = null
  let startDist = 0
  let dist = 0
  let gain = 0
  let loss = 0
  let timeS = 0
  let gapDist = 0 // distance accumulée en tendance contraire/plate

  const flush = (endDist: number) => {
    if (runDir === "up" || runDir === "down") {
      const elevationM = runDir === "up" ? gain : loss
      if (elevationM >= MIN_ELEV_M || dist >= MIN_DIST_M) {
        const grade = dist > 0 ? (gain - loss) / dist : 0
        result.push({
          type: runDir === "up" ? "climb" : "descent",
          startKm: kmAt(startDist),
          endKm: kmAt(endDist),
          distanceM: dist,
          elevationM,
          avgGrade: grade,
          timeS,
          label: labelFor(runDir === "up" ? "climb" : "descent", elevationM, grade),
        })
      }
    }
  }

  const reset = (dir: Dir, atDist: number) => {
    runDir = dir
    startDist = atDist
    dist = 0
    gain = 0
    loss = 0
    timeS = 0
    gapDist = 0
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const dir = classify(seg.grade)
    const t = prediction.segmentTimes[i] ?? 0
    const segStartDist = seg.cumDistM - seg.distM

    if (runDir === null) {
      reset(dir, segStartDist)
    }

    if (dir === runDir) {
      gapDist = 0
    } else {
      gapDist += seg.distM
      // interruption trop longue => on clôture le segment courant
      if (gapDist > GAP_M) {
        flush(segStartDist)
        reset(dir, segStartDist)
      }
    }

    dist += seg.distM
    gain += seg.gain
    loss += seg.loss
    timeS += t
  }

  // clôture finale
  flush(segments.length ? segments[segments.length - 1].cumDistM : 0)

  return result
}
