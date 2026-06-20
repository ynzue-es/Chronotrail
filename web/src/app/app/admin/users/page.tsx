import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { requireAdmin } from "@/lib/admin"
import { getAdminUsers } from "@/lib/supabase/admin-users"
import { PageHeader } from "@/components/app/page-header"
import { AutoRefresh } from "@/components/app/admin/auto-refresh"
import { UserActions } from "@/components/app/admin/user-actions"
import { formatDate, timeAgo } from "@/lib/datetime"

export const dynamic = "force-dynamic"

type PageProps = { searchParams: Promise<{ q?: string }> }

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const me = await requireAdmin()
  const { q } = await searchParams
  const query = (q ?? "").trim().toLowerCase()

  let users = await getAdminUsers()
  if (query) {
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(query) ||
        (u.fullName ?? "").toLowerCase().includes(query)
    )
  }
  users.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <AutoRefresh seconds={20} />
      <PageHeader
        title="Utilisateurs"
        description={`${users.length} compte${users.length > 1 ? "s" : ""}`}
        action={
          <form className="relative">
            <MagnifyingGlassIcon
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Rechercher email / nom"
              className="h-9 w-64 rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:border-primary"
            />
          </form>
        }
      />

      <div className="p-4 md:px-8">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Méthode</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Inscrit</th>
                <th className="px-4 py-3 font-medium">Dernière activité</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => {
                const banned = Boolean(
                  u.bannedUntil && new Date(u.bannedUntil).getTime() > Date.now()
                )
                return (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 shrink-0 rounded-full ${
                            u.online ? "bg-emerald-500" : "bg-muted-foreground/30"
                          }`}
                          title={u.online ? "En ligne" : "Hors ligne"}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {u.fullName ?? "-"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {u.provider}
                    </td>
                    <td className="px-4 py-3">
                      {banned ? (
                        <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                          Banni
                        </span>
                      ) : u.confirmedAt ? (
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                          Confirmé
                        </span>
                      ) : (
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.online ? "en ligne" : timeAgo(u.lastSeen ?? u.lastSignInAt)}
                    </td>
                    <td className="px-4 py-3">
                      <UserActions
                        id={u.id}
                        banned={banned}
                        isSelf={u.id === me.id}
                      />
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Aucun utilisateur.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
