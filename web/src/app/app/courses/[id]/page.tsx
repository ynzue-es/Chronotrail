import Link from "next/link"
import { notFound } from "next/navigation"
import {
  TimerIcon,
  PathIcon,
  GaugeIcon,
  TrendUpIcon,
  TrendDownIcon,
  ForkKnifeIcon,
  MapTrifoldIcon,
  ChartBarIcon,
  SlidersIcon,
  GameControllerIcon,
} from "@phosphor-icons/react/dist/ssr"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CollapsibleSection } from "@/components/courses/collapsible-section"
import { CourseMapPanel } from "@/components/courses/course-map-panel"
import { ElevationProfile } from "@/components/courses/elevation-profile"
import { FuelingPlanView } from "@/components/courses/fueling-plan"
import { SplitsTable } from "@/components/courses/splits-table"
import { NutritionSettings } from "@/components/courses/nutrition-settings"
import { NutritionProductsCard } from "@/components/courses/nutrition-products-card"
import { DeleteCourseButton } from "@/components/courses/delete-course-button"
import { CourseFavoriteButton } from "@/components/courses/course-favorite-button"
import { createClient } from "@/lib/supabase/server"
import { getCourse } from "@/lib/supabase/courses"
import { listProducts, listFavoriteProductIds } from "@/lib/supabase/products"
import { analyzeCourse } from "@/lib/gpx/analyze"
import { sampleProfile } from "@/lib/gpx/profile"
import { buildFuelingPlan, type FuelProduct } from "@/lib/gpx/fueling"
import { computeLegs } from "@/lib/gpx/legs"
import { RavitoEditor } from "@/components/courses/ravito-editor"
import { LegPlanView } from "@/components/courses/leg-plan"
import { DEFAULT_NUTRITION, type NutritionProduct, type TrackPoint } from "@/types/course"
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatPace,
} from "@/lib/format"

function downsample(points: TrackPoint[], max = 1500): [number, number][] {
  const step = Math.max(1, Math.ceil(points.length / max))
  const out: [number, number][] = []
  for (let i = 0; i < points.length; i += step) {
    out.push([points[i].lng, points[i].lat])
  }
  const last = points[points.length - 1]
  out.push([last.lng, last.lat])
  return out
}

/** Produit de référence pour le plan : favori (gel en priorité) sinon rien. */
function pickFuelProduct(
  products: NutritionProduct[],
  favoriteIds: string[],
): FuelProduct | null {
  const favs = products.filter((p) => favoriteIds.includes(p.id))
  const chosen = favs.find((p) => p.kind === "gel") ?? favs[0]
  return chosen ? { name: chosen.name, carbsG: chosen.carbs_g } : null
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const course = await getCourse(supabase, id)
  if (!course || !course.track_points) notFound()

  const points = course.track_points
  const referencePace = course.reference_pace_s_per_km ?? 360
  const nutrition = course.nutrition_settings ?? DEFAULT_NUTRITION

  const [products, favoriteProductIds] = await Promise.all([
    listProducts(supabase),
    listFavoriteProductIds(supabase),
  ])
  const fuelProduct = pickFuelProduct(products, favoriteProductIds)

  const { stats, prediction, splits, keySegments } = analyzeCourse(
    points,
    referencePace,
    nutrition,
  )
  const plan = buildFuelingPlan(
    points,
    stats.segments,
    prediction,
    nutrition,
    fuelProduct,
  )

  const profile = sampleProfile(points, stats.segments)
  const coordinates = downsample(points)
  const avgPace =
    stats.distanceM > 0 ? (prediction.totalTimeS / stats.distanceM) * 1000 : 0
  const totalKm = stats.distanceM / 1000

  // Ravitos & plan par étapes.
  const aidStations = course.aid_stations ?? []
  const hasRavitos = aidStations.length > 0
  const legs = hasRavitos
    ? computeLegs(stats.segments, prediction, nutrition, aidStations, fuelProduct)
    : []

  // Distance cumulée par point (pour localiser un ravito à un km donné).
  const cumDist = [0]
  for (let i = 0; i < stats.segments.length; i++) {
    cumDist.push(stats.segments[i].cumDistM)
  }
  const locateKm = (km: number): { lat: number; lng: number } => {
    const d = km * 1000
    let i = 1
    while (i < cumDist.length && cumDist[i] < d) i++
    const a = points[Math.max(0, i - 1)]
    const b = points[Math.min(points.length - 1, i)]
    const span = cumDist[i] - cumDist[i - 1] || 1
    const frac = Math.min(1, Math.max(0, (d - cumDist[i - 1]) / span))
    return { lat: a.lat + (b.lat - a.lat) * frac, lng: a.lng + (b.lng - a.lng) * frac }
  }

  const sortedRavitos = [...aidStations]
    .filter((a) => a.km > 0 && a.km < totalKm)
    .sort((a, b) => a.km - b.km)

  const markers = hasRavitos
    ? sortedRavitos.map((a, i) => ({ km: a.km, index: i + 1 }))
    : plan.events.map((e) => ({ km: e.km, index: e.index }))
  const mapCues = hasRavitos
    ? sortedRavitos.map((a) => ({ ...locateKm(a.km), km: a.km }))
    : plan.events.map((e) => ({ lng: e.lng, lat: e.lat, km: e.km }))

  return (
    <>
      <PageHeader
        title={course.name}
        description="Ton chrono estimé, où prendre quoi, et le détail du parcours."
        action={
          <div className="flex items-center gap-1">
            <Button asChild size="sm" variant="outline">
              <Link href={`/app/courses/${course.id}/simulator`}>
                <GameControllerIcon size={14} weight="bold" />
                Simuler
              </Link>
            </Button>
            <CourseFavoriteButton
              courseId={course.id}
              initial={course.is_favorite}
            />
            <DeleteCourseButton courseId={course.id} />
          </div>
        }
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        {/* Résumé */}
        <Card>
          <CardContent className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3 lg:grid-cols-6">
            <Metric
              icon={<TimerIcon size={14} weight="duotone" />}
              label="Temps estimé"
              value={formatDuration(prediction.totalTimeS)}
            />
            <Metric
              icon={<PathIcon size={14} weight="duotone" />}
              label="Distance"
              value={formatDistance(stats.distanceM)}
            />
            <Metric
              icon={<TrendUpIcon size={14} weight="duotone" />}
              label="D+"
              value={`+${formatElevation(stats.elevationGainM)}`}
            />
            <Metric
              icon={<TrendDownIcon size={14} weight="duotone" />}
              label="D−"
              value={`−${formatElevation(stats.elevationLossM)}`}
            />
            <Metric
              icon={<GaugeIcon size={14} weight="duotone" />}
              label="Allure moy."
              value={formatPace(avgPace)}
            />
            <Metric
              icon={<ForkKnifeIcon size={14} weight="duotone" />}
              label="Prises"
              value={`${plan.events.length}`}
            />
          </CardContent>
        </Card>

        {/* Headline : profil + plan d'alimentation, intégrés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ForkKnifeIcon size={18} weight="duotone" className="text-primary" />
              Quand prendre quoi
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Les repères numérotés sur le profil correspondent aux prises du plan
              ci-dessous.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ElevationProfile profile={profile} markers={markers} />

            {/* Gestion des ravitos */}
            <details className="group rounded-lg border border-border/70">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span>
                  Ravitos{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {hasRavitos
                      ? `${sortedRavitos.length} défini${sortedRavitos.length > 1 ? "s" : ""}`
                      : "à définir"}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground group-open:hidden">
                  Gérer
                </span>
              </summary>
              <div className="border-t border-border/70 p-3">
                <RavitoEditor
                  courseId={course.id}
                  initial={aidStations}
                  totalKm={totalKm}
                />
              </div>
            </details>

            {hasRavitos ? (
              <LegPlanView legs={legs} product={fuelProduct} />
            ) : (
              <>
                <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  💡 Ajoute les ravitos de ta course (ci-dessus) pour un plan
                  par étapes : combien emporter entre chaque point, selon le D+
                  et la distance.
                </div>
                <FuelingPlanView plan={plan} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Carte */}
        <CollapsibleSection
          title="Carte du tracé"
          icon={<MapTrifoldIcon size={18} weight="duotone" className="text-primary" />}
          defaultOpen
        >
          <CourseMapPanel
            coordinates={coordinates}
            bounds={stats.bounds}
            cues={mapCues}
          />
        </CollapsibleSection>

        {/* Segments marquants */}
        {keySegments.length > 0 && (
          <CollapsibleSection
            title="Segments marquants"
            icon={<TrendUpIcon size={18} weight="duotone" className="text-primary" />}
            hint={`${keySegments.length} repérés`}
          >
            <div className="flex flex-wrap gap-3">
              {keySegments.map((seg, i) => (
                <div
                  key={i}
                  className="flex min-w-[160px] flex-col gap-1 rounded-md border border-border p-3"
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    {seg.type === "climb" ? (
                      <TrendUpIcon size={14} weight="bold" className="text-destructive" />
                    ) : (
                      <TrendDownIcon size={14} weight="bold" className="text-blue-500" />
                    )}
                    {seg.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    km {seg.startKm.toFixed(1)}–{seg.endKm.toFixed(1)} ·{" "}
                    {seg.type === "climb" ? "+" : "−"}
                    {Math.round(seg.elevationM)} m · {(seg.avgGrade * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ≈ {formatDuration(seg.timeS)}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Splits */}
        <CollapsibleSection
          title="Détail des splits"
          icon={<ChartBarIcon size={18} weight="duotone" className="text-primary" />}
          hint="km par km"
        >
          <SplitsTable splits={splits} />
        </CollapsibleSection>

        {/* Réglages & produits */}
        <CollapsibleSection
          title="Réglages & produits"
          icon={<SlidersIcon size={18} weight="duotone" className="text-primary" />}
        >
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div>
              <h3 className="mb-3 text-sm font-medium">Nutrition & allure</h3>
              <NutritionSettings
                courseId={course.id}
                carbsPerHour={nutrition.carbsPerHour}
                waterPerHour={nutrition.waterPerHour}
                referencePaceSecPerKm={referencePace}
              />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium">À emporter</h3>
              <NutritionProductsCard
                totalCarbsG={plan.totalCarbsG}
                products={products}
                initialFavoriteIds={favoriteProductIds}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </>
  )
}
