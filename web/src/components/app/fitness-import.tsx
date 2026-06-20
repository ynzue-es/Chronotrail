"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { UploadSimpleIcon, SpinnerIcon, InfoIcon } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FitnessImport() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const data = new FormData()
      data.set("gpx", file)
      const res = await fetch("/app/api/fitness", { method: "POST", body: data })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? "Import échoué.")
      } else {
        router.refresh()
      }
    } catch {
      setError("Erreur réseau.")
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="fitness-gpx" className="text-sm font-medium">
        Ajouter une course réelle (GPX)
      </Label>
      <Input
        id="fitness-gpx"
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        onChange={onFile}
        disabled={loading}
      />
      {loading && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SpinnerIcon size={12} className="animate-spin" />
          Analyse…
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <details className="text-xs text-muted-foreground">
        <summary className="flex cursor-pointer items-center gap-1.5">
          <InfoIcon size={12} /> Où trouver le GPX d&apos;une course ?
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Strava</strong> : une de tes courses → <code>⋯</code> →{" "}
            <em>Exporter en GPX</em>.
          </li>
          <li>
            <strong>Garmin Connect</strong> : une activité → ⚙️ →{" "}
            <em>Exporter au format GPX</em>.
          </li>
          <li>
            Choisis une course <strong>enregistrée</strong> (avec horodatage).
            Plus tu en ajoutes, plus la prédiction est précise.
          </li>
        </ul>
      </details>
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <UploadSimpleIcon size={11} />
        Une seule course suffit pour démarrer.
      </p>
    </div>
  )
}
