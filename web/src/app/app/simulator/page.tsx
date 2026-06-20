import Link from "next/link"
import {
  GameControllerIcon,
  PathIcon,
  MountainsIcon,
  TimerIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { listCourses } from "@/lib/supabase/courses"
import { formatDistance, formatDuration, formatElevation } from "@/lib/format"

export const metadata = {
  title: "Simulateur · Chronotrail",
}

export default async function SimulatorIndexPage() {
  const supabase = await createClient()
  const courses = await listCourses(supabase)

  return (
    <>
      <PageHeader
        title="Simulateur"
        description="Choisis une course, puis joue avec tes apports, la chaleur et l'allure pour voir quand tu craques."
      />

      <div className="px-4 py-6 md:px-8">
        {courses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucune course à simuler</CardTitle>
              <CardDescription className="pt-1">
                Importe d&apos;abord un GPX pour pouvoir le simuler.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button asChild size="sm">
                <Link href="/app/courses/new">
                  <PlusIcon size={12} weight="bold" />
                  Nouvelle prédiction
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/app/courses/${c.id}/simulator`}
                className="block"
              >
                <Card className="h-full transition-colors hover:border-foreground/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-1.5 truncate">
                      <GameControllerIcon
                        size={15}
                        weight="duotone"
                        className="shrink-0 text-primary"
                      />
                      {c.name}
                    </CardTitle>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <PathIcon size={14} weight="duotone" />
                        {c.distance_m != null ? formatDistance(c.distance_m) : "-"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MountainsIcon size={14} weight="duotone" />
                        {c.elevation_gain_m != null
                          ? `+${formatElevation(c.elevation_gain_m)}`
                          : "-"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <TimerIcon size={14} weight="duotone" />
                        {c.predicted_time_s != null
                          ? formatDuration(c.predicted_time_s)
                          : "-"}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
