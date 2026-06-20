import { DropIcon, CookieIcon, FlaskIcon, CircleIcon } from "@phosphor-icons/react"
import { NutritionProduct } from "@/types/course"

const STYLE: Record<
  NutritionProduct["kind"],
  { icon: typeof DropIcon; cls: string }
> = {
  gel: { icon: DropIcon, cls: "bg-amber-100 text-amber-600" },
  bar: { icon: CookieIcon, cls: "bg-orange-100 text-orange-600" },
  drink: { icon: FlaskIcon, cls: "bg-sky-100 text-sky-600" },
  chew: { icon: CircleIcon, cls: "bg-violet-100 text-violet-600" },
}

export function ProductThumb({
  product,
  size = 36,
}: {
  product: NutritionProduct
  size?: number
}) {
  if (product.image_url) {
    return (
      <div
        className="shrink-0 overflow-hidden rounded-md border border-border/60"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
    )
  }

  const { icon: Icon, cls } = STYLE[product.kind] ?? STYLE.gel
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md ${cls}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon size={Math.round(size * 0.5)} weight="duotone" />
    </div>
  )
}
