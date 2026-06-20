import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { listCourses, countCourses } from "@/lib/supabase/courses"
import { isAdminEmail } from "@/lib/admin"
import { AppSidebar } from "@/components/app/app-sidebar"
import { UserMenu } from "@/components/app/user-menu"
import { MobileNav } from "@/components/app/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Heartbeat } from "@/components/app/heartbeat"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/app")
  }

  const email = user.email ?? ""
  const metadata = user.user_metadata ?? {}
  const admin = isAdminEmail(email)

  // Show the onboarding wizard until the user has completed it (flag stored in
  // user_metadata). Catches new signups and Google sign-ins alike.
  if (!metadata.onboarded) {
    redirect("/onboarding?next=/app")
  }

  const displayName =
    (metadata.full_name as string | undefined) ??
    (metadata.name as string | undefined) ??
    [metadata.firstname, metadata.lastname].filter(Boolean).join(" ") ??
    null
  const avatarUrl =
    (metadata.avatar_url as string | undefined) ??
    (metadata.picture as string | undefined) ??
    null

  const SIDEBAR_HISTORY_LIMIT = 12
  const [recentCourses, totalCourses] = await Promise.all([
    listCourses(supabase, { limit: SIDEBAR_HISTORY_LIMIT }),
    countCourses(supabase),
  ])
  const history = recentCourses.map((c) => ({
    id: c.id,
    name: c.name,
    is_favorite: c.is_favorite,
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <Heartbeat />
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border md:flex">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AppSidebar history={history} totalCourses={totalCourses} isAdmin={admin} />
        </div>
        <UserMenu
          email={email}
          avatarUrl={avatarUrl}
          displayName={displayName || null}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="md:hidden">
            <MobileNav
              email={email}
              avatarUrl={avatarUrl}
              displayName={displayName || null}
              history={history}
              totalCourses={totalCourses}
            />
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
