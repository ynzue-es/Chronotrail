"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, TrashIcon, MagicWandIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AidStation } from "@/types/course"

type Row = { km: string; name: string }

export function RavitoEditor({
  courseId,
  initial,
  totalKm,
}: {
  courseId: string
  initial: AidStation[]
  totalKm: number
}) {
  const router = useRouter()
  const [rows, setRows] = React.useState<Row[]>(
    initial.length
      ? initial.map((a) => ({ km: String(a.km), name: a.name ?? "" }))
      : [],
  )
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function update(i: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  }
  function add() {
    setRows((r) => [...r, { km: "", name: "" }])
  }
  function remove(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i))
  }
  function autoSplit() {
    const step = 10
    const next: Row[] = []
    for (let km = step; km < totalKm - 1; km += step) {
      next.push({ km: String(km), name: `Ravito ${next.length + 1}` })
    }
    setRows(next)
  }

  async function save() {
    setError(null)
    const aidStations = rows
      .map((r) => ({ km: parseFloat(r.km.replace(",", ".")), name: r.name.trim() }))
      .filter((a) => Number.isFinite(a.km) && a.km > 0 && a.km < totalKm)
      .sort((a, b) => a.km - b.km)
    setSaving(true)
    try {
      const res = await fetch(`/app/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aidStations }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? "Échec de l'enregistrement.")
      } else {
        router.refresh()
      }
    } catch {
      setError("Erreur réseau.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun ravito. Ajoute les ravitos de ta course (ou découpe
            automatiquement) pour un plan par étapes.
          </p>
        )}
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                min={0}
                max={totalKm}
                value={row.km}
                onChange={(e) => update(i, { km: e.target.value })}
                placeholder="km"
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">km</span>
            </div>
            <Input
              value={row.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder={`Ravito ${i + 1}`}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Supprimer"
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <TrashIcon size={15} />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <PlusIcon size={13} weight="bold" />
          Ajouter un ravito
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={autoSplit}>
          <MagicWandIcon size={13} weight="bold" />
          Découper auto (10 km)
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={saving}
          className="ml-auto"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  )
}
