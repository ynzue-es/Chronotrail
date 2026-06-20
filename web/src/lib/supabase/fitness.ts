import type { SupabaseClient } from "@supabase/supabase-js"
import { FitnessActivity } from "@/types/course"

export async function listFitnessActivities(
  supabase: SupabaseClient,
): Promise<FitnessActivity[]> {
  const { data, error } = await supabase
    .from("fitness_activities")
    .select("*")
    .order("activity_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error(`Lecture du profil échouée : ${error.message}`)
  return (data ?? []) as FitnessActivity[]
}

export type NewFitnessActivity = {
  userId: string
  name: string
  activityDate: string | null
  distanceM: number
  elevationGainM: number
  movingTimeS: number
  referencePaceSecPerKm: number
}

export async function addFitnessActivity(
  supabase: SupabaseClient,
  a: NewFitnessActivity,
): Promise<string> {
  const { data, error } = await supabase
    .from("fitness_activities")
    .insert({
      user_id: a.userId,
      name: a.name,
      activity_date: a.activityDate,
      distance_m: a.distanceM,
      elevation_gain_m: a.elevationGainM,
      moving_time_s: a.movingTimeS,
      reference_pace_s_per_km: a.referencePaceSecPerKm,
    })
    .select("id")
    .single()
  if (error) throw new Error(`Enregistrement échoué : ${error.message}`)
  return data.id as string
}

export async function deleteFitnessActivity(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("fitness_activities")
    .delete()
    .eq("id", id)
  if (error) throw new Error(`Suppression échouée : ${error.message}`)
}
