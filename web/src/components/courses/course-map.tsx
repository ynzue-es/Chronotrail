"use client"

import * as React from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Bounds } from "@/types/course"

type CueMarker = { lng: number; lat: number; km: number }

type Props = {
  coordinates: [number, number][] // [lng, lat]
  bounds: Bounds
  cues: CueMarker[]
}

// Style raster OSM libre (sans token), suffisant pour visualiser une trace.
const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
}

export function CourseMap({ coordinates, bounds, cues }: Props) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!ref.current || coordinates.length < 2) return

    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE,
      bounds: [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat],
      ],
      fitBoundsOptions: { padding: 40 },
      attributionControl: { compact: true },
    })

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates },
        },
      })
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#2D5F3F", "line-width": 4 },
      })

      // Départ / arrivée
      const start = coordinates[0]
      const end = coordinates[coordinates.length - 1]
      new maplibregl.Marker({ color: "#16a34a" })
        .setLngLat(start)
        .setPopup(new maplibregl.Popup().setText("Départ"))
        .addTo(map)
      new maplibregl.Marker({ color: "#dc2626" })
        .setLngLat(end)
        .setPopup(new maplibregl.Popup().setText("Arrivée"))
        .addTo(map)

      // Points hydratation / nutrition
      for (const c of cues) {
        const el = document.createElement("div")
        el.style.cssText =
          "width:12px;height:12px;border-radius:50%;background:#0ea5e9;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.2)"
        new maplibregl.Marker({ element: el })
          .setLngLat([c.lng, c.lat])
          .setPopup(
            new maplibregl.Popup().setText(`Ravito ~ km ${c.km.toFixed(1)}`),
          )
          .addTo(map)
      }
    })

    return () => map.remove()
  }, [coordinates, bounds, cues])

  return (
    <div
      ref={ref}
      className="h-[360px] w-full overflow-hidden rounded-lg border border-border"
    />
  )
}
