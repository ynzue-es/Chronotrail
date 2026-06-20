import { requireAdmin } from "@/lib/admin"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirects non-admins away before rendering anything.
  await requireAdmin()
  return <>{children}</>
}
