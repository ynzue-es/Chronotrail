function hue(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}

/**
 * Vignette de course : la vraie photo si imageUrl est fournie, sinon une
 * illustration « crête de montagne » générée (couleur déterministe par nom).
 */
export function RaceThumb({
  name,
  imageUrl,
  size = 56,
}: {
  name: string
  imageUrl?: string | null
  size?: number
}) {
  if (imageUrl) {
    return (
      <div
        className="shrink-0 overflow-hidden rounded-md border border-border/60"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
    )
  }

  const h = hue(name)
  const id = `rg-${h}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      className="shrink-0 rounded-md border border-border/60"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 45% 38%)`} />
          <stop offset="1" stopColor={`hsl(${h} 50% 22%)`} />
        </linearGradient>
      </defs>
      <rect width="56" height="56" fill={`url(#${id})`} />
      <circle cx="42" cy="15" r="5" fill="#ffffff" opacity="0.35" />
      <path
        d="M0 56 L14 30 L22 40 L33 22 L44 38 L56 26 L56 56 Z"
        fill="#ffffff"
        opacity="0.28"
      />
      <path
        d="M0 56 L10 40 L20 48 L30 36 L40 47 L50 38 L56 44 L56 56 Z"
        fill="#ffffff"
        opacity="0.18"
      />
    </svg>
  )
}
