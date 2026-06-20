import { ImageResponse } from "next/og"

export const alt = "Chronotrail · prédis ton chrono de trail à partir d'un GPX"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const LOGO = `data:image/svg+xml,${encodeURIComponent(
  `<svg width="120" height="120" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="7" fill="#2D5F3F"/><circle cx="9" cy="9" r="2.2" fill="#A7D3B5"/><path d="M4 24.5 L12 11 L16.5 18 L21 8 L28 24.5 Z" fill="#FFFFFF"/><path d="M21 8 L23.4 12.2 L18.6 12.2 Z" fill="#A7D3B5"/></svg>`,
)}`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0F1F15 0%, #2D5F3F 100%)",
          color: "#FAFAF7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} width={96} height={96} alt="" />
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            Chronotrail
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
            Ton chrono de trail, avant la course.
          </div>
          <div style={{ fontSize: 32, color: "#A7D3B5", maxWidth: 880 }}>
            Importe un GPX → temps estimé ajusté à la pente, splits par km et plan
            de nutrition.
          </div>
        </div>

        <div style={{ fontSize: 26, color: "#CFE8D8" }}>chronotrail</div>
      </div>
    ),
    { ...size },
  )
}
