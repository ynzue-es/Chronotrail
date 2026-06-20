import Link from "next/link"
import {
  UsersThreeIcon,
  PulseIcon,
  SealCheckIcon,
  SparkleIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr"
import { requireAdmin } from "@/lib/admin"
import { getAdminUsers, summarize } from "@/lib/supabase/admin-users"
import { PageHeader } from "@/components/app/page-header"
import { AutoRefresh } from "@/components/app/admin/auto-refresh"
import { timeAgo } from "@/lib/datetime"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  await requireAdmin()
  const users = await getAdminUsers()
  const s = summarize(users)
  const online = users
    .filter((u) => u.online)
    .sort((a, b) => (b.lastSeen ?? "").localeCompare(a.lastSeen ?? ""))

  const stats = [
    { label: "Utilisateurs", value: s.total, icon: UsersThreeIcon },
    { label: "En ligne", value: s.online, icon: PulseIcon, live: true },
    { label: "Confirmés", value: s.confirmed, icon: SealCheckIcon },
    { label: "Cette semaine", value: s.newThisWeek, icon: SparkleIcon },
  ]

  return (
    <div>
      <AutoRefresh seconds={10} />
      <PageHeader
        title="Admin"
        description="Vue d'ensemble des utilisateurs · rafraîchi en direct"
        action={
          <Link
            href="/app/admin/users"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Gérer les utilisateurs
            <ArrowRightIcon size={14} weight="bold" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4 md:px-8">
        {stats.map((st) => {
          const Icon = st.icon
          return (
            <div
              key={st.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Icon size={16} weight="duotone" />
                <span className="text-xs">{st.label}</span>
                {st.live && st.value > 0 && (
                  <span className="ml-auto flex size-2 items-center justify-center">
                    <span className="absolute size-2 animate-ping rounded-full bg-emerald-500/60" />
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>
              <p className="font-mono text-2xl font-semibold tracking-tight">
                {st.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="px-4 pb-10 md:px-8">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
            <span className="flex size-2 items-center justify-center">
              <span className="size-2 rounded-full bg-emerald-500" />
            </span>
            <h2 className="text-sm font-semibold">En ligne maintenant</h2>
            <span className="text-xs text-muted-foreground">
              ({online.length})
            </span>
          </div>

          {online.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Personne en ligne pour l&apos;instant.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {online.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {u.fullName ?? u.email}
                    </p>
                    {u.fullName && (
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(u.lastSeen)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
