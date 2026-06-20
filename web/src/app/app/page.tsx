import Link from "next/link"
import {
  PathIcon,
  TimerIcon,
  MountainsIcon,
  PlusIcon,
  StarIcon,
  CaretRightIcon,
  CalendarBlankIcon,
  NewspaperIcon,
} from "@phosphor-icons/react/dist/ssr"
import { createClient } from "@/lib/supabase/server"
import { listCourses } from "@/lib/supabase/courses"
import { listUpcomingRaces } from "@/lib/supabase/races"
import { fetchTrailNews } from "@/lib/news"
import { NearbyRaces } from "@/components/app/nearby-races"
import { NewsList } from "@/components/app/news-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatDistance,
  formatDuration,
  formatElevation,
} from "@/lib/format"

export const metadata = {
  title: "Dashboard · Chronotrail",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const meta = user?.user_metadata ?? {}
  const firstName =
    (meta.firstname as string | undefined) ??
    (meta.given_name as string | undefined) ??
    (meta.full_name as string | undefined)?.split(" ")[0] ??
    null

  const courses = await listCourses(supabase)
  const count = courses.length
  const totalTime = courses.reduce((a, c) => a + (c.predicted_time_s ?? 0), 0)
  const totalGain = courses.reduce((a, c) => a + (c.elevation_gain_m ?? 0), 0)
  const recent = [...courses]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  const [races, news] = await Promise.all([
    listUpcomingRaces(supabase),
    fetchTrailNews(),
  ])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Bandeau d'accueil */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-accent/20 to-background p-6 md:p-8">
        <Ridgeline />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {firstName ? `Salut ${firstName} 👋` : "Salut 👋"}
            </h1>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {count === 0
                ? "Importe ton premier GPX pour obtenir ton chrono estimé, tes splits et ton plan de nutrition."
                : "Prêt à préparer ta prochaine course ?"}
            </p>
          </div>
          <Button asChild size="lg" className="w-fit">
            <Link href="/app/courses/new">
              <PlusIcon size={15} weight="bold" />
              Nouvelle prédiction
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<PathIcon size={18} weight="duotone" />}
          label="Courses prédites"
          value={String(count)}
        />
        <StatCard
          icon={<TimerIcon size={18} weight="duotone" />}
          label="Temps total estimé"
          value={count > 0 ? formatDuration(totalTime) : "—"}
        />
        <StatCard
          icon={<MountainsIcon size={18} weight="duotone" />}
          label="D+ cumulé"
          value={count > 0 ? `+${formatElevation(totalGain)}` : "—"}
        />
      </div>

      {/* Dernières prédictions + Courses proches */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Dernières prédictions</CardTitle>
            {count > 0 && (
              <Link
                href="/app/courses"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Tout voir
                <CaretRightIcon size={12} weight="bold" />
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="-mx-2 flex flex-col">
                {recent.map((c) => (
                  <Link
                    key={c.id}
                    href={`/app/courses/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {c.is_favorite && (
                        <StarIcon
                          size={13}
                          weight="fill"
                          className="shrink-0 text-amber-500"
                        />
                      )}
                      <span className="truncate text-sm font-medium">
                        {c.name}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground tabular-nums">
                      <span className="hidden sm:inline">
                        {c.distance_m != null
                          ? formatDistance(c.distance_m)
                          : "—"}
                      </span>
                      <span className="font-medium text-foreground">
                        {c.predicted_time_s != null
                          ? formatDuration(c.predicted_time_s)
                          : "—"}
                      </span>
                      <CaretRightIcon size={12} weight="bold" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <CalendarBlankIcon
              size={16}
              weight="duotone"
              className="text-primary"
            />
            <CardTitle className="text-base">Courses près de chez toi</CardTitle>
          </CardHeader>
          <CardContent>
            <NearbyRaces races={races} />
          </CardContent>
        </Card>
      </div>

      {/* Actualités */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <NewspaperIcon size={16} weight="duotone" className="text-primary" />
          <CardTitle className="text-base">Actualités trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 md:grid-cols-2">
            <NewsList items={news.slice(0, 4)} />
            <NewsList items={news.slice(4, 8)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-3 py-2">
      <p className="text-sm text-muted-foreground">
        Aucune course pour le moment. Importe un fichier GPX pour ta première
        prédiction.
      </p>
      <Button asChild size="sm">
        <Link href="/app/courses/new">
          <PlusIcon size={12} weight="bold" />
          Importer un GPX
        </Link>
      </Button>
    </div>
  )
}

function Ridgeline() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end opacity-[0.07]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 200"
        className="h-32 w-full text-primary"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 L120,90 L220,130 L340,50 L460,110 L600,30 L740,100 L860,55 L1000,120 L1120,70 L1200,110 L1200,200 L0,200 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
