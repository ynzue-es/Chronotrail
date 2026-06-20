"use client"

import * as React from "react"
import { Dialog } from "radix-ui"
import { ListIcon, XIcon } from "@phosphor-icons/react"
import { AppSidebar } from "./app-sidebar"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"

type MobileNavProps = {
  email: string
  avatarUrl?: string | null
  displayName?: string | null
  history?: { id: string; name: string; is_favorite: boolean }[]
  totalCourses?: number
}

export function MobileNav({
  history = [],
  totalCourses,
  ...userProps
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
          <ListIcon size={18} weight="regular" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex items-center justify-end p-2">
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fermer">
                <XIcon size={18} />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <AppSidebar history={history} totalCourses={totalCourses} />
          </div>
          <UserMenu {...userProps} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
