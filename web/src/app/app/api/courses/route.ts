import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseGpx } from "@/lib/gpx/parse"
import { analyzeCourse } from "@/lib/gpx/analyze"
import { createCourse, listCourses, uploadGpx } from "@/lib/supabase/courses"
import { DEFAULT_NUTRITION, type NutritionSettings } from "@/types/course"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  try {
    const courses = await listCourses(supabase)
    return NextResponse.json({ courses })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

function numField(form: FormData, key: string, fallback: number): number {
  const raw = form.get(key)
  const n = raw === null ? NaN : parseFloat(String(raw))
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 })
  }

  const name = String(form.get("name") ?? "").trim()
  const file = form.get("gpx")
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 })
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Fichier GPX requis" }, { status: 400 })
  }

  const referencePaceSecPerKm = numField(form, "referencePace", 360) // 6:00/km
  const nutrition: NutritionSettings = {
    carbsPerHour: numField(form, "carbsPerHour", DEFAULT_NUTRITION.carbsPerHour),
    waterPerHour: numField(form, "waterPerHour", DEFAULT_NUTRITION.waterPerHour),
  }

  // 1. Parse + analyse (valide le GPX avant tout upload)
  let trackPoints, stats, prediction
  try {
    const xml = await file.text()
    trackPoints = parseGpx(xml)
    const analysis = analyzeCourse(trackPoints, referencePaceSecPerKm, nutrition)
    stats = analysis.stats
    prediction = analysis.prediction
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  // 2. Upload storage + 3. insert DB (rollback du fichier si l'insert échoue)
  let gpxPath: string | undefined
  try {
    gpxPath = await uploadGpx(supabase, user.id, file)
    const id = await createCourse(supabase, {
      userId: user.id,
      name,
      gpxPath,
      distanceM: stats.distanceM,
      elevationGainM: stats.elevationGainM,
      elevationLossM: stats.elevationLossM,
      bounds: stats.bounds,
      trackPoints,
      nutritionSettings: nutrition,
      referencePaceSecPerKm,
      predictedTimeS: prediction.totalTimeS,
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    if (gpxPath) {
      await supabase.storage.from("gpx-files").remove([gpxPath]).catch(() => {})
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
