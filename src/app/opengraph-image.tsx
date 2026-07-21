import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "ekadku.com — Kad Jemputan Digital"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  // process.cwd() is the Next.js project root; icon.png sits there.
  const iconData = await readFile(join(process.cwd(), "icon.png"), "base64")
  const iconSrc = `data:image/png;base64,${iconData}`

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

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 4 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconSrc} width={96} height={96} alt="" style={{ borderRadius: 20 }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 88, color: "#f5f0e8", letterSpacing: "-3px" }}>e</span>
            <span style={{ fontSize: 88, color: "#D4AF37", letterSpacing: "-3px" }}>kad</span>
            <span style={{ fontSize: 88, color: "#f5f0e8", letterSpacing: "-3px" }}>ku</span>
            <span style={{ fontSize: 36, color: "#a89060", letterSpacing: "-1px" }}>.com</span>
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#8a7050", letterSpacing: "0.25em", textTransform: "uppercase" }}>
          Kad Jemputan Digital
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
