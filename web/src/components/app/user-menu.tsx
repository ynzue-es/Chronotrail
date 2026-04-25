"use client"

import * as React from "react"
import { SignOutIcon, UserCircleIcon } from "@phosphor-icons/react"
import { DropdownMenu } from "radix-ui"
import { cn } from "@/lib/utils"

type UserMenuProps = {
  email: string
  avatarUrl?: string | null
  displayName?: string | null
}

export function UserMenu({ email, avatarUrl, displayName }: UserMenuProps) {
  const label = displayName?.trim() || email

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 border-t border-border/60 px-3 py-3 text-left text-xs transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="size-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <UserCircleIcon size={16} weight="duotone" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-foreground">{label}</div>
            {displayName && (
              <div className="truncate text-[11px] text-muted-foreground">
                {email}
              </div>
            )}
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={8}
          className={cn(
            "z-50 w-56 border border-border bg-popover p-1 text-xs text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        >
          <form action="/auth/signout" method="post">
            <DropdownMenu.Item asChild>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
              >
                <SignOutIcon size={14} weight="regular" />
                Se déconnecter
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
