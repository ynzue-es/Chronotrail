import type { SupabaseClient } from "@supabase/supabase-js"
import { Race } from "@/types/course"

/** Courses à venir (date >= aujourd'hui), triées par date. */
export async function listUpcomingRaces(
  supabase: SupabaseClient,
  limit = 30,
): Promise<Race[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from("races")
    .select("*")
    .gte("race_date", today)
    .order("race_date", { ascending: true })
    .limit(limit)
  if (error) throw new Error(`Lecture des courses échouée : ${error.message}`)
  return (data ?? []) as Race[]
}
