import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  deleteCourse,
  getCourse,
  setCourseFavorite,
  setCourseAidStations,
  updateCourseNutrition,
} from "@/lib/supabase/courses"
import { analyzeCourse } from "@/lib/gpx/analyze"
import { DEFAULT_NUTRITION, type NutritionSettings } from "@/types/course"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const course = await getCourse(supabase, id)
  if (!course) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ course })
}

// Met à jour les réglages (nutrition + allure de référence) et recalcule le temps.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const course = await getCourse(supabase, id)
  if (!course) return NextResponse.json({ error: "not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))

  // Toggle favori (ne touche pas au reste).
  if (typeof body.isFavorite === "boolean") {
    try {
      await setCourseFavorite(supabase, id, body.isFavorite)
      return NextResponse.json({ isFavorite: body.isFavorite })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
  }

  // Mise à jour des ravitos.
  if (Array.isArray(body.aidStations)) {
    const clean = body.aidStations
      .map((a: { km?: unknown; name?: unknown }) => ({
        km: Number(a.km),
        name: typeof a.name === "string" ? a.name.slice(0, 60) : undefined,
      }))
      .filter((a: { km: number }) => Number.isFinite(a.km) && a.km > 0)
    try {
      await setCourseAidStations(supabase, id, clean)
      return NextResponse.json({ aidStations: clean })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
  }

  if (!course.track_points) {
    return NextResponse.json({ error: "course sans trace" }, { status: 400 })
  }
  const nutrition: NutritionSettings = {
    carbsPerHour:
      Number(body.carbsPerHour) > 0
        ? Number(body.carbsPerHour)
        : (course.nutrition_settings?.carbsPerHour ?? DEFAULT_NUTRITION.carbsPerHour),
    waterPerHour:
      Number(body.waterPerHour) > 0
        ? Number(body.waterPerHour)
        : (course.nutrition_settings?.waterPerHour ?? DEFAULT_NUTRITION.waterPerHour),
  }
  const referencePace =
    Number(body.referencePace) > 0
      ? Number(body.referencePace)
      : (course.reference_pace_s_per_km ?? 360)

  const { prediction } = analyzeCourse(
    course.track_points,
    referencePace,
    nutrition,
  )

  try {
    await updateCourseNutrition(
      supabase,
      id,
      nutrition,
      referencePace,
      prediction.totalTimeS,
    )
    return NextResponse.json({ predictedTimeS: prediction.totalTimeS })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  try {
    await deleteCourse(supabase, id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
