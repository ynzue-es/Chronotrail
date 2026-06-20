"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HouseIcon,
  PathIcon,
  PlusCircleIcon,
  GearSixIcon,
  StarIcon,
  GaugeIcon,
  GameControllerIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"

type NavItem = {
  href: string
  label: string
  icon: typeof HouseIcon
  exact?: boolean
}

type HistoryItem = { id: string; name: string; is_favorite: boolean }

const items: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: HouseIcon, exact: true },
  { href: "/app/courses", label: "Mes courses", icon: PathIcon, exact: true },
  {
    href: "/app/courses/new",
    label: "Nouvelle prédiction",
    icon: PlusCircleIcon,
    exact: true,
  },
  { href: "/app/fitness", label: "Ma forme", icon: GaugeIcon },
  { href: "/app/simulator", label: "Simulateur", icon: GameControllerIcon },
  { href: "/app/settings", label: "Paramètres", icon: GearSixIcon },
]

export function AppSidebar({
  history = [],
  totalCourses,
}: {
  history?: HistoryItem[]
  totalCourses?: number
}) {
  const pathname = usePathname()
  const total = totalCourses ?? history.length
  const hasMore = total > history.length

  return (
    <nav className="flex flex-col gap-1 p-3">
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 px-2 py-2 text-sm font-semibold tracking-tight"
      >
        <Logo size={20} className="text-primary" />
        Chronotrail
      </Link>

      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon size={16} weight={active ? "duotone" : "regular"} />
              {item.label}
            </Link>
          )
        })}
      </div>

      {history.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between px-2 pb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Historique
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {total}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {history.map((c) => {
              const active = pathname === `/app/courses/${c.id}`
              return (
                <Link
                  key={c.id}
                  href={`/app/courses/${c.id}`}
                  title={c.name}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {c.is_favorite ? (
                    <StarIcon
                      size={12}
                      weight="fill"
                      className="shrink-0 text-amber-500"
                    />
                  ) : (
                    <span className="size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  )}
                  <span className="truncate">{c.name}</span>
                </Link>
              )
            })}
          </div>
          {hasMore && (
            <Link
              href="/app/courses"
              className="mt-1 block rounded-md px-2 py-1.5 text-xs text-primary transition-colors hover:bg-muted/50"
            >
              Tout voir ({total})
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
