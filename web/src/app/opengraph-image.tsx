import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const alt = "Chronotrail · prédis ton chrono de trail à partir d'un GPX"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const LOGO = `data:image/svg+xml,${encodeURIComponent(
  `<svg width="120" height="120" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="7" fill="#2D5F3F"/><circle cx="9" cy="9" r="2.2" fill="#A7D3B5"/><path d="M4 24.5 L12 11 L16.5 18 L21 8 L28 24.5 Z" fill="#FFFFFF"/><path d="M21 8 L23.4 12.2 L18.6 12.2 Z" fill="#A7D3B5"/></svg>`,
)}`

export default async function OpengraphImage() {
  // Embed the hero photo as a data URI so Satori can use it as the background.
  const photo = await readFile(
    join(process.cwd(), "public/images/hero-mountains.jpg")
  )
  const bg = `data:image/jpeg;base64,${photo.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bg}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
        {/* Dark scrim for text contrast */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(8,16,11,0.92) 0%, rgba(8,16,11,0.6) 45%, rgba(8,16,11,0.2) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
            width: "100%",
            color: "#FAFAF7",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} width={84} height={84} alt="" />
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
              Chronotrail
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: 74,
                fontWeight: 800,
                lineHeight: 1.04,
                maxWidth: 940,
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
              }}
            >
              Ton chrono de trail, avant la course.
            </div>
            <div style={{ fontSize: 31, color: "#CFE8D8", maxWidth: 860 }}>
              Importe un GPX → temps estimé ajusté à la pente, splits par km et
              plan de nutrition.
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 26, color: "#CFE8D8" }}>
            chronotrail.fr · gratuit & open-source
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
