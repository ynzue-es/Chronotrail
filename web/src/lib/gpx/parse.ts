import { TrackPoint } from "@/types/course"
import { XMLParser } from "fast-xml-parser"

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : parseFloat(String(value))
  return Number.isFinite(n) ? n : null
}

/**
 * Parse un fichier GPX en liste de points.
 * - lat/lon obligatoires et finis (les points invalides sont ignorés)
 * - <ele> manquante => report de la dernière altitude connue (0 au tout début)
 * - <time> optionnel
 * Lève une erreur explicite si le GPX ne contient aucun point exploitable.
 */
export function parseGpx(xmlString: string): TrackPoint[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: true,
  })

  let obj: any
  try {
    obj = parser.parse(xmlString)
  } catch {
    throw new Error("Fichier GPX illisible (XML invalide).")
  }

  if (!obj?.gpx) {
    throw new Error("Fichier GPX invalide : balise <gpx> absente.")
  }

  const result: TrackPoint[] = []
  let lastEle = 0

  for (const trk of toArray<any>(obj.gpx.trk)) {
    for (const seg of toArray<any>(trk.trkseg)) {
      for (const pt of toArray<any>(seg.trkpt)) {
        const lat = num(pt.lat)
        const lng = num(pt.lon)
        if (lat === null || lng === null) continue
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue

        const ele = num(pt.ele)
        if (ele !== null) lastEle = ele

        const time = pt.time !== undefined ? String(pt.time) : undefined

        result.push({ lat, lng, ele: ele ?? lastEle, time })
      }
    }
  }

  if (result.length < 2) {
    throw new Error("Le GPX ne contient pas assez de points exploitables.")
  }

  return result
}
