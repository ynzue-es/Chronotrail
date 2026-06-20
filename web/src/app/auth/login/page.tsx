import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Connexion · Chronotrail",
  description: "Connecte-toi à ton compte Chronotrail",
}

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>
}

function safeNext(next: string | undefined): string {
  if (!next) return "/app"
  if (!next.startsWith("/") || next.startsWith("//")) return "/app"
  return next
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  const next = safeNext(params.next)

  return (
    <AuthLayout>
      {params.error && (
        <div className="mb-4 border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {decodeURIComponent(params.error)}
        </div>
      )}
      <LoginForm next={next} />
    </AuthLayout>
  )
}
