"use client"

import * as React from "react"
import { GaugeIcon, InfoIcon, SpinnerIcon } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseGpx } from "@/lib/gpx/parse"
import { calibrateFromActivity } from "@/lib/gpx/calibrate"
import { formatDistance, formatDuration, formatPace } from "@/lib/format"

type Props = {
  /** Appelé avec l'allure de référence déduite (s/km). */
  onCalibrated: (secPerKm: number) => void
}

export function PaceCalibrator({ onCalibrated }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const xml = await file.text()
      const points = parseGpx(xml)
      const c = calibrateFromActivity(points)
      onCalibrated(c.referencePaceSecPerKm)
      setResult(
        `D'après ta course (${formatDistance(c.distanceM)}, +${Math.round(
          c.elevationGainM,
        )} m, ${formatDuration(c.movingTimeS)}) → allure de référence ≈ ${formatPace(
          c.referencePaceSecPerKm,
        )}`,
      )
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
      e.target.value = "" // permet de réimporter le même fichier
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-border p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <GaugeIcon size={16} weight="duotone" className="text-primary" />
        Caler mon allure depuis une course passée
      </div>
      <p className="text-xs text-muted-foreground">
        Tu ne connais pas ton allure sur le plat ? Importe <strong>une seule</strong>{" "}
        course récente : on en déduit ton allure réelle ajustée à la pente.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="calib" className="sr-only">
          Fichier GPX d&apos;une course passée
        </Label>
        <Input
          id="calib"
          type="file"
          accept=".gpx,application/gpx+xml,application/xml,text/xml"
          onChange={onFile}
          disabled={loading}
        />
      </div>

      {loading && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SpinnerIcon size={12} className="animate-spin" />
          Analyse de la course…
        </p>
      )}
      {result && <p className="text-xs text-primary">{result}</p>}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <details className="text-xs text-muted-foreground">
        <summary className="flex cursor-pointer items-center gap-1.5">
          <InfoIcon size={12} /> Comment exporter une course (Strava / Garmin) ?
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Strava</strong> : ouvre une de tes courses → menu{" "}
            <code>⋯</code> → <em>Exporter en GPX</em>.
          </li>
          <li>
            <strong>Garmin Connect</strong> : ouvre une activité → ⚙️ →{" "}
            <em>Exporter au format GPX</em>.
          </li>
          <li>
            Choisis une course <strong>enregistrée</strong> (pas un parcours
            planifié), il faut l&apos;horodatage pour calculer ton temps réel.
          </li>
        </ul>
      </details>
    </div>
  )
}
