"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { TrashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function onDelete() {
    if (!confirm("Supprimer cette course ?")) return
    setLoading(true)
    const res = await fetch(`/app/api/courses/${courseId}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/app/courses")
      router.refresh()
    } else {
      setLoading(false)
      alert("Échec de la suppression.")
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={onDelete} disabled={loading}>
      <TrashIcon size={14} weight="bold" />
      {loading ? "Suppression…" : "Supprimer"}
    </Button>
  )
}
