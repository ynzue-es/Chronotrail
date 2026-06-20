import Link from "next/link"
import {
  PlusIcon,
  PathIcon,
  MountainsIcon,
  TimerIcon,
  StarIcon,
} from "@phosphor-icons/react/dist/ssr"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { listCourses } from "@/lib/supabase/courses"
import { formatDistance, formatDuration, formatElevation } from "@/lib/format"

export const metadata = {
  title: "Mes courses · Chronotrail",
}

export default async function CoursesPage() {
  const supabase = await createClient()
  const courses = await listCourses(supabase)

  return (
    <>
      <PageHeader
        title="Mes courses"
        description="Toutes les prédictions que tu as générées."
        action={
          <Button asChild>
            <Link href="/app/courses/new">
              <PlusIcon size={14} weight="bold" />
              Nouvelle prédiction
            </Link>
          </Button>
        }
      />

      <div className="px-4 py-6 md:px-8">
        {courses.length === 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <PathIcon size={16} weight="duotone" />
                <CardDescription>Aucune course</CardDescription>
              </div>
              <CardTitle>Commence par importer un fichier GPX</CardTitle>
              <CardDescription className="pt-2">
                Tes prédictions apparaîtront ici, avec tes splits et ta nutrition.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link key={c.id} href={`/app/courses/${c.id}`} className="block">
                <Card className="h-full transition-colors hover:border-foreground/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-1.5 truncate">
                      {c.is_favorite && (
                        <StarIcon
                          size={14}
                          weight="fill"
                          className="shrink-0 text-amber-500"
                        />
                      )}
                      {c.name}
                    </CardTitle>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <PathIcon size={14} weight="duotone" />
                        {c.distance_m != null
                          ? formatDistance(c.distance_m)
                          : "-"}
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
