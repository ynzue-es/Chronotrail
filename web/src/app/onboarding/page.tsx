import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthLayout } from "@/components/auth/auth-layout"
import { OnboardingWizard } from "@/components/auth/onboarding-wizard"

export const metadata = {
  title: "Bienvenue · Chronotrail",
  description: "Termine la création de ton profil Chronotrail",
}

type PageProps = {
  searchParams: Promise<{ next?: string }>
}

function safeNext(next: string | undefined): string {
  if (!next) return "/app"
  if (!next.startsWith("/") || next.startsWith("//")) return "/app"
  return next
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const next = safeNext(params.next)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/onboarding")
  }

  const m = (user.user_metadata ?? {}) as Record<string, string | undefined>
  const hasName = Boolean(m.firstname || m.full_name || m.name)
  if (hasName) {
    redirect(next)
  }

  // Prefill from an OAuth provider profile when available (e.g. Google).
  const defaultFirst = m.given_name ?? m.name?.split(" ")[0] ?? ""
  const defaultLast = m.family_name ?? m.name?.split(" ").slice(1).join(" ") ?? ""

  return (
    <AuthLayout>
      <OnboardingWizard defaultFirst={defaultFirst} defaultLast={defaultLast} />
    </AuthLayout>
  )
}
