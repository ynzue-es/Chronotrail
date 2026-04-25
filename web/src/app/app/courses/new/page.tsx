import { UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Nouvelle prédiction — Chronotrail",
}

export default function NewCoursePage() {
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
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nom de la course</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex. UTMB 2026"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="gpx">Fichier GPX</Label>
                <Input
                  id="gpx"
                  name="gpx"
                  type="file"
                  accept=".gpx,application/gpx+xml"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" disabled>
                  <UploadSimpleIcon size={14} weight="bold" />
                  Analyser
                </Button>
                <p className="text-xs text-muted-foreground">
                  Bientôt disponible — le pipeline de prédiction est en cours
                  de branchement.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
