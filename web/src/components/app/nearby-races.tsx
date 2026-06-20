"use client"

import * as React from "react"
import {
  MapPinIcon,
  CalendarBlankIcon,
  ArrowSquareOutIcon,
  CrosshairIcon,
} from "@phosphor-icons/react"
import { Race } from "@/types/course"
import { cn } from "@/lib/utils"
import { RaceThumb } from "@/components/app/race-thumb"

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

function daysUntil(dateISO: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateISO)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function NearbyRaces({ races }: { races: Race[] }) {
  const [pos, setPos] = React.useState<{ lat: number; lng: number } | null>(null)
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "granted" | "denied"
  >("idle")

  const ask = React.useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("denied")
      return
    }
    setStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude })
        setStatus("granted")
      },
      () => setStatus("denied"),
      { timeout: 8000, maximumAge: 600000 },
    )
  }, [])

  React.useEffect(() => {
    ask()
  }, [ask])

  const list = React.useMemo(() => {
    const withDist = races.map((r) => ({
      race: r,
      km: pos ? haversineKm(pos, { lat: r.lat, lng: r.lng }) : null,
    }))
    if (pos) withDist.sort((a, b) => (a.km ?? 0) - (b.km ?? 0))
    return withDist.slice(0, 5)
  }, [races, pos])

  if (races.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune course à venir dans le calendrier.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {status !== "granted" && (
        <button
          type="button"
          onClick={ask}
          className="inline-flex w-fit items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <CrosshairIcon size={13} weight="bold" />
          {status === "loading"
            ? "Localisation…"
            : status === "denied"
              ? "Géoloc refusée : courses triées par date"
              : "Activer la géoloc pour voir les plus proches"}
        </button>
      )}

      <div className="flex flex-col divide-y divide-border/50">
        {list.map(({ race, km }) => {
          const days = daysUntil(race.race_date)
          return (
            <a
              key={race.id}
              href={race.url ?? "#"}
              target={race.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group flex items-center gap-3 py-2.5"
            >
              <RaceThumb
                name={race.name}
                imageUrl={race.image_url}
                size={44}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="truncate">{race.name}</span>
                  {race.url && (
                    <ArrowSquareOutIcon
                      size={12}
                      className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon size={11} weight="duotone" />
                    {race.location_name}
                    {km != null && (
                      <span className="text-foreground">
                        {" "}
                        · à {Math.round(km)} km
                      </span>
                    )}
                  </span>
                  {race.distance_km != null && (
                    <span>
                      {race.distance_km} km
                      {race.elevation_gain_m != null &&
                        ` · +${Math.round(race.elevation_gain_m)} m`}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1 text-xs font-medium tabular-nums">
                  <CalendarBlankIcon size={11} weight="duotone" />
                  {formatDate(race.race_date)}
                </div>
                <div
                  className={cn(
                    "text-[11px] tabular-nums",
                    days <= 14
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  dans {days} j
                </div>
              </div>
            </a>
          )
        })}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Dates indicatives : vérifie le site officiel de chaque course.
      </p>
    </div>
  )
}
