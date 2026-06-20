"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { TrashIcon } from "@phosphor-icons/react"
import { FitnessActivity } from "@/types/course"
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatPace,
} from "@/lib/format"

export function FitnessList({
  activities,
}: {
  activities: FitnessActivity[]
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState<string | null>(null)

  async function remove(id: string) {
    if (!confirm("Retirer cette course du profil ?")) return
    setPending(id)
    const res = await fetch(`/app/api/fitness/${id}`, { method: "DELETE" })
    if (res.ok) router.refresh()
    else setPending(null)
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune course dans ton profil. Importe une sortie réelle pour caler tes
        prédictions sur ton niveau.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/50">
      {activities.map((a) => (
        <div key={a.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{a.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {a.activity_date
                ? new Date(a.activity_date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "date ?"}{" "}
              · {formatDistance(a.distance_m)}
              {a.elevation_gain_m != null &&
                ` · +${formatElevation(a.elevation_gain_m)}`}{" "}
              · {formatDuration(a.moving_time_s)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-right text-sm font-medium tabular-nums">
              {formatPace(a.reference_pace_s_per_km)}
              <span className="block text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                réf. plat
              </span>
            </span>
            <button
              type="button"
              onClick={() => remove(a.id)}
              disabled={pending === a.id}
              aria-label="Retirer"
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <TrashIcon size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
