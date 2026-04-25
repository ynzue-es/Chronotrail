import { createClient } from "@/lib/supabase/server"
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
import { StravaIcon } from "@/components/marketing/icons/strava-icon"
import { GoogleIcon } from "@/components/marketing/icons/google-icon"

export const metadata = {
  title: "Paramètres — Chronotrail",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const metadata = user?.user_metadata ?? {}
  const email = user?.email ?? ""
  const firstName = (metadata.firstname as string | undefined) ?? ""
  const lastName = (metadata.lastname as string | undefined) ?? ""

  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? []
  const hasStrava =
    metadata.provider === "strava" || providers.includes("strava")
  const hasGoogle = providers.includes("google")

  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Gère ton profil, tes connexions et tes préférences."
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Les informations affichées sur ton tableau de bord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstname">Prénom</Label>
                  <Input
                    id="firstname"
                    name="firstname"
                    defaultValue={firstName}
                    placeholder="Prénom"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastname">Nom</Label>
                  <Input
                    id="lastname"
                    name="lastname"
                    defaultValue={lastName}
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={email}
                  disabled
                />
              </div>

              <div>
                <Button type="submit" disabled>
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connexions</CardTitle>
            <CardDescription>
              Comptes liés à ton profil Chronotrail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <ConnectionRow
                icon={<StravaIcon />}
                label="Strava"
                connected={hasStrava}
              />
              <ConnectionRow
                icon={<GoogleIcon />}
                label="Google"
                connected={hasGoogle}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zone de danger</CardTitle>
            <CardDescription>
              Déconnexion et suppression du compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-2">
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="outline" size="sm">
                  Se déconnecter
                </Button>
              </form>
              <Button variant="destructive" size="sm" disabled>
                Supprimer mon compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function ConnectionRow({
  icon,
  label,
  connected,
}: {
  icon: React.ReactNode
  label: string
  connected: boolean
}) {
  return (
    <div className="flex items-center justify-between border border-border/60 px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      {connected ? (
        <span className="inline-flex items-center gap-1 text-xs text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          Connecté
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Non connecté</span>
      )}
    </div>
  )
}
