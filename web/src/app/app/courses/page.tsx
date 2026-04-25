import Link from "next/link"
import { PlusIcon, PathIcon } from "@phosphor-icons/react/dist/ssr"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const metadata = {
  title: "Mes courses — Chronotrail",
}

export default function CoursesPage() {
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
      </div>
    </>
  )
}
