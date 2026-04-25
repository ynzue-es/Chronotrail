import Link from "next/link"
import {
  PathIcon,
  TimerIcon,
  MountainsIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Dashboard — Chronotrail",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const metadata = user?.user_metadata ?? {}
  const firstName =
    (metadata.firstname as string | undefined) ??
    (metadata.given_name as string | undefined) ??
    (metadata.full_name as string | undefined)?.split(" ")[0] ??
    null

  const greeting = firstName ? `Salut ${firstName} 👋` : "Salut 👋"

  return (
    <>
      <PageHeader
        title={greeting}
        description="Ton espace pour prédire tes temps de trail et planifier tes courses."
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
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<PathIcon size={16} weight="duotone" />}
            label="Courses prédites"
            value="0"
            hint="Ajoute ton premier GPX pour démarrer"
          />
          <StatCard
            icon={<TimerIcon size={16} weight="duotone" />}
            label="Temps total estimé"
            value="—"
            hint="Basé sur tes dernières prédictions"
          />
          <StatCard
            icon={<MountainsIcon size={16} weight="duotone" />}
            label="D+ cumulé"
            value="—"
            hint="Sur toutes tes courses"
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium tracking-tight">
            Dernières prédictions
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Aucune course pour le moment</CardTitle>
              <CardDescription>
                Importe un fichier GPX pour obtenir ta première prédiction de
                temps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link href="/app/courses/new">
                  <PlusIcon size={12} weight="bold" />
                  Importer un GPX
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <CardDescription>{label}</CardDescription>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}
