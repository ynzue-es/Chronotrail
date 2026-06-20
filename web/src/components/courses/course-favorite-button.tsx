"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { StarIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CourseFavoriteButton({
  courseId,
  initial,
}: {
  courseId: string
  initial: boolean
}) {
  const router = useRouter()
  const [fav, setFav] = React.useState(initial)
  const [pending, setPending] = React.useState(false)

  async function toggle() {
    const next = !fav
    setFav(next)
    setPending(true)
    try {
      const res = await fetch(`/app/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setFav(!next) // rollback
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={pending}
      aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <StarIcon
        size={14}
        weight={fav ? "fill" : "regular"}
        className={cn(fav && "text-amber-500")}
      />
      {fav ? "Favori" : "Favori"}
    </Button>
  )
}
