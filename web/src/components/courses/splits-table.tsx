import { Split } from "@/types/course"
import { formatDuration, formatPace } from "@/lib/format"
import { gradeColor } from "@/lib/grade"
import { cn } from "@/lib/utils"

export function SplitsTable({ splits }: { splits: Split[] }) {
  if (splits.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun split.</p>
  }

  // Met en avant les km les plus durs (top 3 par D+).
  const hardKms = new Set(
    [...splits]
      .sort((a, b) => b.elevationGainM - a.elevationGainM)
      .slice(0, 3)
      .filter((s) => s.elevationGainM >= 20)
      .map((s) => s.km),
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Km</th>
              <th className="py-2 pr-3 font-medium">Temps</th>
              <th className="py-2 pr-3 font-medium">Cumulé</th>
              <th className="py-2 pr-3 font-medium">Allure</th>
              <th className="py-2 pr-3 font-medium">D+</th>
              <th className="py-2 pr-3 font-medium">D−</th>
              <th className="py-2 pr-3 font-medium">Pente</th>
            </tr>
          </thead>
          <tbody>
            {splits.map((s) => (
              <tr
                key={s.km}
                className={cn(
                  "border-b border-border/40",
                  hardKms.has(s.km) && "bg-accent/30",
                )}
              >
                <td className="py-1.5 pr-3 font-medium tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3.5 w-1 rounded-full"
                      style={{ backgroundColor: gradeColor(s.avgGrade) }}
                      aria-hidden
                    />
                    {s.km}
                  </span>
                </td>
                <td className="py-1.5 pr-3 tabular-nums">
                  {formatDuration(s.timeS)}
                </td>
                <td className="py-1.5 pr-3 font-semibold tabular-nums">
                  {formatDuration(s.cumTimeS)}
                </td>
                <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">
                  {formatPace(s.paceSecPerKm)}
                </td>
                <td className="py-1.5 pr-3 tabular-nums">
                  {s.elevationGainM >= 1 ? `+${Math.round(s.elevationGainM)}` : "-"}
                </td>
                <td className="py-1.5 pr-3 tabular-nums">
                  {s.elevationLossM >= 1 ? `−${Math.round(s.elevationLossM)}` : "-"}
                </td>
                <td className="py-1.5 pr-3 tabular-nums">
                  <span style={{ color: gradeColor(s.avgGrade) }}>
                    {(s.avgGrade * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Barre de couleur = pente · ligne surlignée = km le plus dur · « Cumulé » =
        temps de passage estimé à la fin du km.
      </p>
    </div>
  )
}
