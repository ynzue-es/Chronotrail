"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ProfilePoint } from "@/lib/gpx/profile"
import { gradeColor } from "@/lib/grade"
import { formatElevation } from "@/lib/format"

type FuelMarker = { km: number; index: number }

type Props = {
  profile: ProfilePoint[]
  markers?: FuelMarker[]
}

type Row = { km: number; ele: number; grade: number }

function ProfileTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: Row }>
}) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">{p.km.toFixed(2)} km</div>
      <div className="text-muted-foreground">{formatElevation(p.ele)}</div>
      <div style={{ color: gradeColor(p.grade) }}>
        Pente {(p.grade * 100).toFixed(1)}%
      </div>
    </div>
  )
}

export function ElevationProfile({ profile, markers = [] }: Props) {
  const data: Row[] = React.useMemo(
    () =>
      profile.map((p) => ({
        km: p.distM / 1000,
        ele: Math.round(p.ele),
        grade: p.grade,
      })),
    [profile],
  )

  // Stops du dégradé : une couleur par point, positionnée à sa fraction de distance.
  const gradientStops = React.useMemo(() => {
    const total = profile.length ? profile[profile.length - 1].distM || 1 : 1
    return profile.map((p, i) => (
      <stop
        key={i}
        offset={`${(p.distM / total) * 100}%`}
        stopColor={gradeColor(p.grade)}
      />
    ))
  }, [profile])

  if (data.length < 2) {
    return <p className="text-sm text-muted-foreground">Profil indisponible.</p>
  }

  return (
    <div className="w-full">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 22, right: 12, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="grade-stroke" x1="0" y1="0" x2="1" y2="0">
                {gradientStops}
              </linearGradient>
              <linearGradient id="grade-fill" x1="0" y1="0" x2="1" y2="0">
                {gradientStops}
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="km"
              type="number"
              domain={[0, data[data.length - 1].km]}
              tickFormatter={(v: number) => `${Math.round(v)}`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              unit=" km"
            />
            <YAxis
              dataKey="ele"
              domain={[
                (min: number) => Math.floor(min - 20),
                (max: number) => Math.ceil(max + 20),
              ]}
              tickFormatter={(v: number) => `${v}`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              width={44}
              unit=" m"
            />
            <Tooltip content={<ProfileTooltip />} />

            {/* ravitos : lignes verticales numérotées (calées sur le plan) */}
            {markers.map((m) => (
              <ReferenceLine
                key={m.index}
                x={m.km}
                stroke="#0ea5e9"
                strokeDasharray="3 3"
                strokeOpacity={0.8}
                label={{
                  value: String(m.index),
                  position: "top",
                  fill: "#0ea5e9",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            ))}

            <Area
              type="monotone"
              dataKey="ele"
              stroke="url(#grade-stroke)"
              strokeWidth={2}
              fill="url(#grade-fill)"
              fillOpacity={0.22}
              isAnimationActive={false}
              dot={false}
            />

            <Brush
              dataKey="km"
              height={22}
              travellerWidth={8}
              stroke="#94a3b8"
              tickFormatter={(v: number) => `${Math.round(v)}`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Bleu = descente · vert = plat · orange/rouge = montée · trait bleu
        numéroté = prise du plan. Glisse les poignées du bas pour zoomer.
      </p>
    </div>
  )
}
