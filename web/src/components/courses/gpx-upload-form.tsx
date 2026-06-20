"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { UploadSimpleIcon, SpinnerIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaceCalibrator } from "@/components/courses/pace-calibrator"
import { DEFAULT_NUTRITION } from "@/types/course"
import { formatPace, parsePace } from "@/lib/format"

const PACE_STORAGE_KEY = "ct_ref_pace"

export function GpxUploadForm({
  profilePaceSec,
}: {
  profilePaceSec?: number
}) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fromProfile = typeof profilePaceSec === "number"
  const [pace, setPace] = React.useState(
    fromProfile ? formatPace(profilePaceSec).replace("/km", "") : "5:30",
  )

  // Si pas de profil de forme, reprend la dernière allure utilisée.
  React.useEffect(() => {
    if (fromProfile) return
    const saved = window.localStorage.getItem(PACE_STORAGE_KEY)
    if (saved) setPace(saved)
  }, [fromProfile])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formEl = e.currentTarget
    const data = new FormData(formEl)

    const paceSec = parsePace(pace)
    if (!Number.isFinite(paceSec)) {
      setError("Allure de référence invalide (format attendu : m:ss, ex. 5:30).")
      return
    }
    data.set("referencePace", String(paceSec))
    data.delete("referencePaceText")
    window.localStorage.setItem(PACE_STORAGE_KEY, pace)

    setLoading(true)
    try {
      const res = await fetch("/app/api/courses", { method: "POST", body: data })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "Échec de l'analyse.")
        setLoading(false)
        return
      }
      router.push(`/app/courses/${json.id}`)
    } catch {
      setError("Erreur réseau pendant l'envoi.")
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nom de la course</Label>
        <Input id="name" name="name" placeholder="Ex. UTMB 2026" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="gpx">Fichier GPX du parcours à prédire</Label>
        <Input
          id="gpx"
          name="gpx"
          type="file"
          accept=".gpx,application/gpx+xml,application/xml,text/xml"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="referencePaceText">Allure de référence sur le plat</Label>
        <Input
          id="referencePaceText"
          name="referencePaceText"
          placeholder="5:30"
          value={pace}
          onChange={(e) => setPace(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          {fromProfile
            ? "Pré-rempli depuis ton profil de forme (tes courses réelles). Modifie si besoin."
            : "Ton allure soutenable sur du plat (min:sec / km). Elle est ajustée à la pente pour estimer ton chrono."}
        </p>
      </div>

      <PaceCalibrator
        onCalibrated={(sec) => setPace(formatPace(sec).replace("/km", ""))}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="carbsPerHour">Glucides (g/h)</Label>
          <Input
            id="carbsPerHour"
            name="carbsPerHour"
            type="number"
            min={0}
            defaultValue={DEFAULT_NUTRITION.carbsPerHour}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="waterPerHour">Eau (ml/h)</Label>
          <Input
            id="waterPerHour"
            name="waterPerHour"
            type="number"
            min={0}
            defaultValue={DEFAULT_NUTRITION.waterPerHour}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <SpinnerIcon size={14} weight="bold" className="animate-spin" />
          ) : (
            <UploadSimpleIcon size={14} weight="bold" />
          )}
          {loading ? "Analyse…" : "Analyser"}
        </Button>
      </div>
    </form>
  )
}
