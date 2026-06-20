import type { SupabaseClient } from "@supabase/supabase-js"
import {
  Bounds,
  CourseRow,
  NutritionSettings,
  TrackPoint,
} from "@/types/course"

const BUCKET = "gpx-files"

/** Upload le GPX dans gpx-files/{userId}/{uuid}.gpx (RLS = dossier de l'user). */
export async function uploadGpx(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.gpx`
  // Les navigateurs envoient souvent les .gpx en application/octet-stream :
  // on reconstruit un Blob explicitement typé pour passer la validation du bucket.
  const blob = new Blob([await file.arrayBuffer()], {
    type: "application/gpx+xml",
  })
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "application/gpx+xml",
    upsert: false,
  })
  if (error) throw new Error(`Upload GPX échoué : ${error.message}`)
  return path
}

export type CreateCourseInput = {
  userId: string
  name: string
  gpxPath: string
  distanceM: number
  elevationGainM: number
  elevationLossM: number
  bounds: Bounds
  trackPoints: TrackPoint[]
  nutritionSettings: NutritionSettings
  referencePaceSecPerKm: number
  predictedTimeS: number
}

/** Insère une course (RLS : user_id = auth.uid()). Renvoie l'id créé. */
export async function createCourse(
  supabase: SupabaseClient,
  input: CreateCourseInput,
): Promise<string> {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      user_id: input.userId,
      name: input.name,
      gpx_path: input.gpxPath,
      distance_m: input.distanceM,
      elevation_gain_m: input.elevationGainM,
      elevation_loss_m: input.elevationLossM,
      bounds: input.bounds,
      track_points: input.trackPoints,
      nutrition_settings: input.nutritionSettings,
      reference_pace_s_per_km: input.referencePaceSecPerKm,
      predicted_time_s: input.predictedTimeS,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Création course échouée : ${error.message}`)
  return data.id as string
}

/** Liste les courses de l'utilisateur (résumé, sans track_points). */
export async function listCourses(
  supabase: SupabaseClient,
  opts?: { limit?: number },
): Promise<Omit<CourseRow, "track_points">[]> {
  let query = supabase
    .from("courses")
    .select(
      "id, user_id, name, gpx_path, distance_m, elevation_gain_m, elevation_loss_m, bounds, nutrition_settings, reference_pace_s_per_km, predicted_time_s, is_favorite, created_at, updated_at",
    )
    .order("is_favorite", { ascending: false })
    .order("created_at", { ascending: false })

  if (opts?.limit) query = query.limit(opts.limit)

  const { data, error } = await query
  if (error) throw new Error(`Lecture des courses échouée : ${error.message}`)
  return (data ?? []) as Omit<CourseRow, "track_points">[]
}

/** Compte les courses de l'utilisateur (sans charger les lignes). */
export async function countCourses(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
  if (error) throw new Error(`Comptage échoué : ${error.message}`)
  return count ?? 0
}

/** Récupère une course complète (avec track_points) ou null. */
export async function getCourse(
  supabase: SupabaseClient,
  id: string,
): Promise<CourseRow | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`Lecture de la course échouée : ${error.message}`)
  return (data as CourseRow) ?? null
}

/** Met à jour les réglages nutrition + temps prédit recalculé. */
export async function updateCourseNutrition(
  supabase: SupabaseClient,
  id: string,
  nutritionSettings: NutritionSettings,
  referencePaceSecPerKm: number,
  predictedTimeS: number,
): Promise<void> {
  const { error } = await supabase
    .from("courses")
    .update({
      nutrition_settings: nutritionSettings,
      reference_pace_s_per_km: referencePaceSecPerKm,
      predicted_time_s: predictedTimeS,
    })
    .eq("id", id)

  if (error) throw new Error(`Mise à jour échouée : ${error.message}`)
}

/** Marque / démarque une course en favori. */
export async function setCourseFavorite(
  supabase: SupabaseClient,
  id: string,
  favorite: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("courses")
    .update({ is_favorite: favorite })
    .eq("id", id)
  if (error) throw new Error(`Mise à jour favori échouée : ${error.message}`)
}

/** Met à jour les ravitos de la course. */
export async function setCourseAidStations(
  supabase: SupabaseClient,
  id: string,
  aidStations: { km: number; name?: string }[],
): Promise<void> {
  const { error } = await supabase
    .from("courses")
    .update({ aid_stations: aidStations })
    .eq("id", id)
  if (error) throw new Error(`Mise à jour ravitos échouée : ${error.message}`)
}

/** Supprime une course et son fichier GPX du storage. */
export async function deleteCourse(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const course = await getCourse(supabase, id)
  if (!course) return

  const { error } = await supabase.from("courses").delete().eq("id", id)
  if (error) throw new Error(`Suppression échouée : ${error.message}`)

  if (course.gpx_path) {
    await supabase.storage.from(BUCKET).remove([course.gpx_path])
  }
}
