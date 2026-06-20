import { CourseAnalysis, NutritionSettings, TrackPoint } from "@/types/course"
import { computeStats } from "./stats"
import { predict } from "./prediction"
import { computeSplits } from "./splits"
import { detectKeySegments } from "./segments"
import { computeCues } from "./nutrition"

/**
 * Analyse complète d'une trace : stats, prédiction de temps ajustée à la pente,
 * splits par km, segments marquants et points de relance nutrition.
 * Source unique de vérité, appelée à l'upload (pour le résumé stocké) et au
 * rendu de la page détail (recalcul à la volée depuis track_points).
 */
export function analyzeCourse(
  points: TrackPoint[],
  referencePaceSecPerKm: number,
  nutrition: NutritionSettings,
): CourseAnalysis {
  const stats = computeStats(points)
  const prediction = predict(stats.segments, referencePaceSecPerKm)
  const splits = computeSplits(stats.segments, prediction, nutrition)
  const keySegments = detectKeySegments(stats.segments, prediction)
  const cues = computeCues(points, stats.segments, prediction, nutrition)

  return { stats, prediction, splits, keySegments, cues }
}
