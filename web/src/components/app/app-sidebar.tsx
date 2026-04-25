"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MountainsIcon,
  HouseIcon,
  PathIcon,
  PlusCircleIcon,
  GearSixIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: typeof HouseIcon
  exact?: boolean
}

const items: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: HouseIcon, exact: true },
  { href: "/app/courses", label: "Mes courses", icon: PathIcon },
  { href: "/app/courses/new", label: "Nouvelle prédiction", icon: PlusCircleIcon },
  { href: "/app/settings", label: "Paramètres", icon: GearSixIcon },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 px-2 py-2 text-sm font-semibold tracking-tight"
      >
        <MountainsIcon size={20} weight="duotone" className="text-primary" />
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
                "flex items-center gap-2 px-2 py-1.5 text-xs transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon size={16} weight={active ? "duotone" : "regular"} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
