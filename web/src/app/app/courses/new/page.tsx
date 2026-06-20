import { PageHeader } from "@/components/app/page-header"
import { GpxUploadForm } from "@/components/courses/gpx-upload-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { listFitnessActivities } from "@/lib/supabase/fitness"
import { computeProfilePace } from "@/lib/fitness"

export const metadata = {
  title: "Nouvelle prédiction · Chronotrail",
}

export default async function NewCoursePage() {
  const supabase = await createClient()
  const activities = await listFitnessActivities(supabase)
  const profilePace = computeProfilePace(activities)
  return (
    <>
      <PageHeader
        title="Nouvelle prédiction"
        description="Importe un fichier GPX pour obtenir un chrono estimé, tes splits et un plan de nutrition."
      />

      <div className="px-4 py-6 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Importer un GPX</CardTitle>
            <CardDescription>
              Formats acceptés : .gpx (trace d&apos;une course ou d&apos;un
              parcours).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GpxUploadForm profilePaceSec={profilePace ?? undefined} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
