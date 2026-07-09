import { ImageResponse } from "next/og"

export const alt = "ekadku.com — Kad Jemputan Digital Malaysia"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0e0e0e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
          <div style={{ fontSize: 60, color: "#D4AF37" }}>♥</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 88, color: "#f5f0e8", letterSpacing: "-3px" }}>e</span>
            <span style={{ fontSize: 88, color: "#D4AF37", letterSpacing: "-3px" }}>kad</span>
            <span style={{ fontSize: 88, color: "#f5f0e8", letterSpacing: "-3px" }}>ku</span>
            <span style={{ fontSize: 36, color: "#a89060", letterSpacing: "-1px" }}>.com</span>
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#8a7050", letterSpacing: "0.25em", textTransform: "uppercase" }}>
          Kad Jemputan Digital Malaysia
        </div>

        <div style={{ display: "flex", gap: 36, fontSize: 22, color: "#5a4a30", marginTop: 4 }}>
          <span>Perkahwinan</span>
          <span style={{ color: "#D4AF37" }}>·</span>
          <span>Hari Jadi</span>
          <span style={{ color: "#D4AF37" }}>·</span>
          <span>Korporat</span>
        </div>

        <div
          style={{
            marginTop: 20,
            background: "rgba(212,175,55,0.10)",
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: 40,
            padding: "14px 36px",
            fontSize: 26,
            color: "#D4AF37",
            letterSpacing: "0.05em",
          }}
        >
          Mulai RM30 sahaja · Tanpa Langganan
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
      </div>
    ),
    { ...size }
  )
}
