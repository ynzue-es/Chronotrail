"use client"

import * as React from "react"
import { NewspaperIcon } from "@phosphor-icons/react"

function hue(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}

/**
 * Vignette d'actu : la vraie image si dispo et valide, sinon (ou si l'image
 * casse au chargement) un dégradé déterministe propre + icône journal.
 */
export function NewsThumb({
  image,
  seed,
}: {
  image: string | null
  seed: string
}) {
  const [broken, setBroken] = React.useState(false)
  const showImg = image && !broken

  if (showImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        className="size-full object-cover transition-transform group-hover:scale-105"
      />
    )
  }

  const h = hue(seed)
  return (
    <div
      className="flex size-full items-center justify-center"
      style={{
        background: `linear-gradient(135deg, hsl(${h} 45% 42%), hsl(${h} 52% 26%))`,
      }}
    >
      <NewspaperIcon size={20} weight="duotone" className="text-white/85" />
    </div>
  )
}
