"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPace, parsePace } from "@/lib/format"

type Props = {
  courseId: string
  carbsPerHour: number
  waterPerHour: number
  referencePaceSecPerKm: number
}

export function NutritionSettings({
  courseId,
  carbsPerHour,
  waterPerHour,
  referencePaceSecPerKm,
}: Props) {
  const router = useRouter()
  const [carbs, setCarbs] = React.useState(String(carbsPerHour))
  const [water, setWater] = React.useState(String(waterPerHour))
  const [pace, setPace] = React.useState(
    formatPace(referencePaceSecPerKm).replace("/km", ""),
  )
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const paceSec = parsePace(pace)
    if (!Number.isFinite(paceSec)) {
      setError("Allure invalide (format m:ss).")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/app/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carbsPerHour: Number(carbs),
          waterPerHour: Number(water),
          referencePace: paceSec,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? "Échec de la mise à jour.")
        setSaving(false)
        return
      }
      router.refresh()
    } catch {
      setError("Erreur réseau.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ns-pace">Allure de référence (plat)</Label>
        <Input
          id="ns-pace"
          value={pace}
          onChange={(e) => setPace(e.target.value)}
          placeholder="5:30"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ns-carbs">Glucides (g/h)</Label>
          <Input
            id="ns-carbs"
            type="number"
            min={0}
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ns-water">Eau (ml/h)</Label>
          <Input
            id="ns-water"
            type="number"
            min={0}
            value={water}
            onChange={(e) => setWater(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving} variant="secondary">
        {saving ? "Recalcul…" : "Recalculer"}
      </Button>
    </form>
  )
}
