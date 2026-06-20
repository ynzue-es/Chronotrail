import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr"

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  hint,
  children,
}: {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-card"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-base font-semibold tracking-tight">
          {icon}
          {title}
          {hint && (
            <span className="text-xs font-normal text-muted-foreground">
              {hint}
            </span>
          )}
        </span>
        <CaretDownIcon
          size={16}
          weight="bold"
          className="text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  )
}
