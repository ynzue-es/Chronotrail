/** Durée en secondes -> "h:mm:ss" ou "mm:ss". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

/** Allure en s/km -> "m:ss/km". */
export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return "-"
  const total = Math.round(secPerKm)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}/km`
}

/** Parse "m:ss" ou "m.ss" ou un nombre de minutes -> s/km. Renvoie NaN si invalide. */
export function parsePace(input: string): number {
  const t = input.trim().replace(",", ".")
  if (!t) return NaN
  if (t.includes(":")) {
    const [m, s] = t.split(":")
    const min = parseInt(m, 10)
    const sec = parseInt(s ?? "0", 10)
    if (!Number.isFinite(min) || !Number.isFinite(sec)) return NaN
    return min * 60 + sec
  }
  const min = parseFloat(t)
  return Number.isFinite(min) ? Math.round(min * 60) : NaN
}

/** Distance en mètres -> "12.3 km". */
export function formatDistance(m: number): string {
  return `${(m / 1000).toFixed(1)} km`
}

/** Dénivelé en mètres -> "1 234 m". */
export function formatElevation(m: number): string {
  return `${Math.round(m).toLocaleString("fr-FR")} m`
}
