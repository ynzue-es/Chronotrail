import { GaugeIcon, PathIcon } from "@phosphor-icons/react/dist/ssr"
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FitnessImport } from "@/components/app/fitness-import"
import { FitnessList } from "@/components/app/fitness-list"
import { createClient } from "@/lib/supabase/server"
import { listFitnessActivities } from "@/lib/supabase/fitness"
import { computeProfilePace } from "@/lib/fitness"
import { formatPace } from "@/lib/format"

export const metadata = {
  title: "Ma forme · Chronotrail",
}

export default async function FitnessPage() {
  const supabase = await createClient()
  const activities = await listFitnessActivities(supabase)
  const profilePace = computeProfilePace(activities)

  return (
    <>
      <PageHeader
        title="Ma forme"
        description="Importe tes courses réelles : on en déduit ton allure de référence. Plus tu en ajoutes, plus tes prédictions collent à ton niveau."
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Profil + liste */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Mes courses de référence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FitnessList activities={activities} />
            </CardContent>
          </Card>

          {/* Résumé profil + import */}
          <div className="flex flex-col gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="flex items-center gap-3 py-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <GaugeIcon size={22} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Allure de référence (profil)
                  </p>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    {profilePace ? formatPace(profilePace) : "-"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <PathIcon size={11} weight="duotone" />
                    {activities.length} course
                    {activities.length > 1 ? "s" : ""} prise
                    {activities.length > 1 ? "s" : ""} en compte
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <FitnessImport />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
