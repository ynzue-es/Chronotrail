"use client"

import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BalancePoint } from "@/lib/gpx/fueling"

function hm(min: number): string {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m}min`
}

export function FuelingBalance({ series }: { series: BalancePoint[] }) {
  if (series.length < 2) return null

  return (
    <div className="w-full">
      <div className="h-[170px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={series}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="intake-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2D5F3F" stopOpacity={0.35} />
                <stop offset="1" stopColor="#2D5F3F" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="min"
              type="number"
              domain={[0, series[series.length - 1].min]}
              tickFormatter={hm}
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              width={32}
              unit="g"
            />
            <Tooltip
              labelFormatter={(label) => hm(Number(label))}
              formatter={(value, name) =>
                [
                  `${Number(value)} g`,
                  name === "intake" ? "Apport" : "Besoin",
                ] as [string, string]
              }
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Area
              type="stepAfter"
              dataKey="intake"
              name="intake"
              stroke="#2D5F3F"
              strokeWidth={2}
              fill="url(#intake-fill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="need"
              name="need"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        <span className="font-medium text-primary">Apport</span> (tes prises) vs{" "}
        <span className="font-medium text-destructive">besoin</span> (ta dépense).
        Reste au-dessus de la ligne rouge pour ne pas tomber en panne.
      </p>
    </div>
  )
}
