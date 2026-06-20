"use client"

import * as React from "react"
import {
  StarIcon,
  ShoppingBagIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react"
import { NutritionProduct } from "@/types/course"
import { cn } from "@/lib/utils"
import { ProductThumb } from "@/components/courses/product-thumb"

const KIND_LABEL: Record<NutritionProduct["kind"], string> = {
  gel: "Gel",
  bar: "Barre",
  drink: "Boisson",
  chew: "Pâte",
}

function buyUrl(p: NutritionProduct): string {
  if (p.shop_url) return p.shop_url
  const q = encodeURIComponent([p.brand, p.name].filter(Boolean).join(" "))
  return `https://www.decathlon.fr/search?Ntt=${q}`
}

export function NutritionProductsCard({
  totalCarbsG,
  products,
  initialFavoriteIds,
}: {
  totalCarbsG: number
  products: NutritionProduct[]
  initialFavoriteIds: string[]
}) {
  const [favorites, setFavorites] = React.useState<Set<string>>(
    new Set(initialFavoriteIds),
  )
  const [pending, setPending] = React.useState<string | null>(null)

  async function toggleFavorite(id: string) {
    const next = !favorites.has(id)
    setPending(id)
    // maj optimiste
    setFavorites((prev) => {
      const s = new Set(prev)
      if (next) s.add(id)
      else s.delete(id)
      return s
    })
    try {
      const res = await fetch("/app/api/products/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, favorite: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // rollback
      setFavorites((prev) => {
        const s = new Set(prev)
        if (next) s.delete(id)
        else s.add(id)
        return s
      })
    } finally {
      setPending(null)
    }
  }

  const favProducts = products.filter((p) => favorites.has(p.id))
  const carbs = Math.round(totalCarbsG)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md bg-muted/50 p-3 text-sm">
        Sur cette course :{" "}
        <strong>≈ {carbs} g de glucides</strong> à consommer.
        {favProducts.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {favProducts.map((p) => {
              const units = Math.max(1, Math.ceil(carbs / p.carbs_g))
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-sm">
                    <strong className="tabular-nums">≈ {units}</strong> ×{" "}
                    {p.name}
                    {p.brand ? ` (${p.brand})` : ""}
                  </span>
                  <a
                    href={buyUrl(p)}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ShoppingBagIcon size={12} weight="bold" />
                    Acheter
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Catalogue {favProducts.length === 0 && "— choisis tes favoris ★"}
        </span>
        {products.map((p) => {
          const fav = favorites.has(p.id)
          return (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-1.5"
            >
              <button
                type="button"
                onClick={() => toggleFavorite(p.id)}
                disabled={pending === p.id}
                aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={cn(
                  "shrink-0 transition-colors",
                  fav
                    ? "text-amber-500"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <StarIcon size={16} weight={fav ? "fill" : "regular"} />
              </button>
              <ProductThumb product={p} size={32} />
              <div className="min-w-0 flex-1 text-sm">
                <span className="truncate">{p.name}</span>
                {p.brand && (
                  <span className="text-muted-foreground"> · {p.brand}</span>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {p.carbs_g} g · {KIND_LABEL[p.kind]}
              </span>
              <a
                href={buyUrl(p)}
                target="_blank"
                rel="sponsored noopener noreferrer"
                aria-label="Voir en boutique"
                className="shrink-0 text-muted-foreground hover:text-primary"
              >
                <ArrowSquareOutIcon size={14} />
              </a>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Certains liens sont des liens affiliés : un achat peut nous reverser une
        commission, sans surcoût pour toi. Quantités indicatives, à adapter à ta
        tolérance.
      </p>
    </div>
  )
}
