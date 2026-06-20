"use client"

import dynamic from "next/dynamic"
import { Bounds } from "@/types/course"

const CourseMap = dynamic(
  () => import("./course-map").then((m) => m.CourseMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center rounded-lg border border-border text-sm text-muted-foreground">
        Chargement de la carte…
      </div>
    ),
  },
)

type Props = {
  coordinates: [number, number][]
  bounds: Bounds
  cues: { lng: number; lat: number; km: number }[]
}

export function CourseMapPanel(props: Props) {
  return <CourseMap {...props} />
}
