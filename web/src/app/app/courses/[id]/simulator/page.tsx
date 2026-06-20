import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr"
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { RaceSimulator } from "@/components/courses/race-simulator"
import { createClient } from "@/lib/supabase/server"
import { getCourse } from "@/lib/supabase/courses"
import { analyzeCourse } from "@/lib/gpx/analyze"
import { sampleProfile } from "@/lib/gpx/profile"
import { downsampleForSim } from "@/lib/sim/race-sim"
import { DEFAULT_NUTRITION } from "@/types/course"

export const metadata = {
  title: "Simulateur · Chronotrail",
}

export default async function SimulatorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const course = await getCourse(supabase, id)
  if (!course || !course.track_points) notFound()

  const points = course.track_points
  const referencePace = course.reference_pace_s_per_km ?? 360
  const nutrition = course.nutrition_settings ?? DEFAULT_NUTRITION

  const { stats, prediction } = analyzeCourse(points, referencePace, nutrition)
  const profile = sampleProfile(points, stats.segments)
  const sim = downsampleForSim(stats.segments, prediction)

  return (
    <>
      <PageHeader
        title={`Simulateur — ${course.name}`}
        description="Joue avec tes apports, la chaleur et l'allure : vois quand tu craques."
        action={
          <Link
            href={`/app/courses/${course.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon size={14} weight="bold" />
            Retour à la course
          </Link>
        }
      />

      <div className="px-4 py-6 md:px-8">
        <Card>
          <CardContent className="pt-6">
            <RaceSimulator
              profile={profile}
              segments={sim.segments}
              prediction={sim.prediction}
              initialCarbs={nutrition.carbsPerHour}
              initialWater={nutrition.waterPerHour}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
