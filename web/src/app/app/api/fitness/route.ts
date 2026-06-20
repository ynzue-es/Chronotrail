import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseGpx } from "@/lib/gpx/parse"
import { calibrateFromActivity } from "@/lib/gpx/calibrate"
import {
  addFitnessActivity,
  listFitnessActivities,
} from "@/lib/supabase/fitness"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const activities = await listFitnessActivities(supabase)
    return NextResponse.json({ activities })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
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

  const file = form.get("gpx")
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Fichier GPX requis" }, { status: 400 })
  }
  const name =
    String(form.get("name") ?? "").trim() ||
    file.name.replace(/\.gpx$/i, "") ||
    "Course"

  try {
    const xml = await file.text()
    const points = parseGpx(xml)
    const c = calibrateFromActivity(points) // lève si pas d'horodatage
    const id = await addFitnessActivity(supabase, {
      userId: user.id,
      name,
      activityDate: c.activityDate,
      distanceM: c.distanceM,
      elevationGainM: c.elevationGainM,
      movingTimeS: c.movingTimeS,
      referencePaceSecPerKm: c.referencePaceSecPerKm,
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
