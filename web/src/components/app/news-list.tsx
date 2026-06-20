import { ArrowSquareOutIcon, NewspaperIcon } from "@phosphor-icons/react/dist/ssr"
import { NewsItem } from "@/lib/news"
import { NewsThumb } from "@/components/app/news-thumb"

function relativeDate(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const days = Math.round((Date.now() - d.getTime()) / 86400000)
  if (days <= 0) return "aujourd'hui"
  if (days === 1) return "hier"
  if (days < 7) return `il y a ${days} j`
  if (days < 30) return `il y a ${Math.round(days / 7)} sem.`
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function NewsList({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <NewspaperIcon size={14} weight="duotone" />
        Pas d&apos;actus disponibles pour le moment.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/50">
      {items.map((item) => (
        <a
          key={item.link}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 py-2.5"
        >
          <div className="size-14 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted">
            <NewsThumb image={item.image} seed={item.source || item.title} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
              {item.title}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.source}
              {item.date && ` · ${relativeDate(item.date)}`}
            </p>
          </div>

          <ArrowSquareOutIcon
            size={13}
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          />
        </a>
      ))}
    </div>
  )
}
