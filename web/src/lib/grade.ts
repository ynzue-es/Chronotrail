/**
 * Couleur (hex) en fonction de la pente (rise/run).
 * Descente -> bleu, plat -> vert, montée douce -> orange, montée raide -> rouge.
 * Utilisé par le profil altimétrique (SVG) et la carte (MapLibre).
 */
export function gradeColor(grade: number): string {
  const g = grade * 100 // en %
  if (g <= -12) return "#1d4ed8" // descente très raide
  if (g <= -6) return "#3b82f6" // descente raide
  if (g <= -2) return "#60a5fa" // descente douce
  if (g < 2) return "#16a34a" // plat
  if (g < 6) return "#f59e0b" // montée douce
  if (g < 12) return "#ea580c" // montée
  return "#dc2626" // montée très raide
}
