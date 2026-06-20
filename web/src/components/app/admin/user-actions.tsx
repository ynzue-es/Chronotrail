"use client"

import { useState, useTransition } from "react"
import { ProhibitIcon, TrashIcon, CheckCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { deleteUser, setBanned } from "@/app/app/admin/actions"

export function UserActions({
  id,
  banned,
  isSelf,
}: {
  id: string
  banned: boolean
  isSelf: boolean
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">toi</span>
  }

  const onBan = () =>
    start(async () => {
      setError(null)
      const r = await setBanned(id, !banned)
      if (!r.ok) setError(r.error ?? "Erreur")
    })

  const onDelete = () =>
    start(async () => {
      if (!confirm("Supprimer définitivement cet utilisateur ?")) return
      setError(null)
      const r = await deleteUser(id)
      if (!r.ok) setError(r.error ?? "Erreur")
    })

  return (
    <div className="flex items-center justify-end gap-1.5">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBan}
        disabled={pending}
        className="h-8 gap-1.5 text-xs"
        title={banned ? "Débannir" : "Bannir"}
      >
        {banned ? (
          <>
            <CheckCircleIcon size={14} /> Débannir
          </>
        ) : (
          <>
            <ProhibitIcon size={14} /> Bannir
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={pending}
        className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
        title="Supprimer"
      >
        <TrashIcon size={14} />
      </Button>
    </div>
  )
}
