import { cn } from "@/lib/utils"

/**
 * Mark Chronotrail (montagnes). Dessiné en currentColor pour s'adapter au thème,
 * utilisé dans le header. La version favicon/OG vit dans src/app/icon.svg.
 */
export function Logo({
  size = 24,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="2.2" fill="currentColor" opacity="0.5" />
      <path
        d="M4 24.5 L12 11 L16.5 18 L21 8 L28 24.5 Z"
        fill="currentColor"
      />
    </svg>
  )
}
