import { DropIcon, MountainsIcon } from "@phosphor-icons/react/dist/ssr"
import { FuelingPlan } from "@/lib/gpx/fueling"
import { FuelingBalance } from "@/components/courses/fueling-balance"
import { formatDuration } from "@/lib/format"

export function FuelingPlanView({ plan }: { plan: FuelingPlan }) {
  if (plan.events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Course trop courte pour un plan d&apos;alimentation.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Résumé */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Stat label="Cadence" value={`1 prise / ${plan.intervalMin} min`} />
        <Stat label="Objectif" value={`${plan.carbsPerHour} g/h`} />
        <Stat
          label="Total glucides"
          value={`${Math.round(plan.totalCarbsG)} g`}
        />
        <Stat
          label="Total eau"
          value={`${(plan.totalWaterMl / 1000).toFixed(1)} L`}
        />
        {plan.product && <Stat label="Produit" value={plan.product.name} />}
      </div>

      {/* Impact dans le temps */}
      <FuelingBalance series={plan.series} />

      {/* Plan chronométré (replié : c'est une longue liste régulière) */}
      <details className="group rounded-lg border border-border/70">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span>Détail des prises ({plan.events.length})</span>
          <span className="text-xs text-muted-foreground group-open:hidden">
            Afficher
          </span>
        </summary>
        <div className="border-t border-border/70 p-3">
      <ol className="flex flex-col gap-1.5">
        {plan.events.map((e) => (
          <li
            key={e.index}
            className="flex items-center gap-3 rounded-md border border-border/60 px-3 py-2"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
              {e.index}
            </span>
            <div className="w-20 shrink-0">
              <div className="text-sm font-semibold tabular-nums">
                {formatDuration(e.timeS)}
              </div>
              <div className="text-[11px] text-muted-foreground tabular-nums">
                km {e.km.toFixed(1)}
              </div>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <span className="font-medium">
                {e.units != null && plan.product
                  ? `${e.units} × ${plan.product.name}`
                  : `${Math.round(e.carbsG)} g de glucides`}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · {Math.round(e.carbsG)} g
                <span className="inline-flex items-center gap-0.5">
                  {" "}
                  · <DropIcon size={11} weight="duotone" /> {Math.round(e.waterMl)}{" "}
                  ml
                </span>
              </span>
            </div>
            {e.note && (
              <span className="hidden shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 sm:inline-flex">
                <MountainsIcon size={11} weight="duotone" />
                {e.note}
              </span>
            )}
          </li>
        ))}
      </ol>
        </div>
      </details>

      <p className="text-[11px] text-muted-foreground">
        Plan indicatif basé sur {plan.carbsPerHour} g/h. À adapter à ta
        tolérance digestive et à la météo.
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
