import {
  ArrowRightIcon,
  TrendUpIcon,
  DropIcon,
  WarningIcon,
  FlagIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Leg } from "@/lib/gpx/legs"
import { FuelProduct } from "@/lib/gpx/fueling"
import { formatDuration, formatDistance, formatElevation } from "@/lib/format"

export function LegPlanView({
  legs,
  product,
}: {
  legs: Leg[]
  product: FuelProduct | null
}) {
  if (legs.length === 0) return null

  return (
    <div className="flex flex-col gap-2.5">
      {legs.map((leg) => (
        <div
          key={leg.index}
          className="rounded-lg border border-border/70 p-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {leg.fromName}
              <ArrowRightIcon size={13} weight="bold" className="text-muted-foreground" />
              {leg.toName}
              {leg.demanding && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  <WarningIcon size={11} weight="fill" />
                  étape exigeante
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <FlagIcon size={11} weight="duotone" />
              passage ≈ {formatDuration(leg.arrivalS)}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
            <span>
              km {leg.fromKm.toFixed(1)}–{leg.toKm.toFixed(1)} ·{" "}
              {formatDistance(leg.distanceM)}
            </span>
            <span>⏱ {formatDuration(leg.timeS)}</span>
            <span className="inline-flex items-center gap-1">
              <TrendUpIcon size={11} weight="duotone" />
              +{formatElevation(leg.gain)} / −{formatElevation(leg.loss)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm">
            <span className="font-medium">À emporter :</span>
            <span>
              {leg.units != null && product
                ? `${leg.units} × ${product.name}`
                : `${Math.round(leg.carbsG)} g de glucides`}
            </span>
            <span className="text-muted-foreground">
              ({Math.round(leg.carbsG)} g)
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <DropIcon size={12} weight="duotone" />
              {Math.round(leg.waterMl / 50) * 50} ml
            </span>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground">
        « À emporter » = ce qu&apos;il faut avoir sur toi entre deux ravitos
        (arrondi au-dessus). Recharge eau et ravito solide à chaque point.
      </p>
    </div>
  )
}
