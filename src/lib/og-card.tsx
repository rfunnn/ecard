import type { WizardConfig } from "@/types/config"

export type OgCardData = {
  title: string
  groomName: string | null
  brideName: string | null
  wizardConfig: unknown
  template: { category: string; image1Url: string | null } | null
  theme: { primaryColor: string; bgColor: string } | null
} | null

export function buildOgImage(card: OgCardData) {
  const primary = card?.theme?.primaryColor ?? "#D4AF37"
  const bg      = card?.theme?.bgColor      ?? "#0e0e0e"
  const img1    = card?.template?.image1Url  ?? null

  const wc = card?.wizardConfig as WizardConfig | undefined

  const rawName = wc?.displayName ||
    (card?.groomName && card?.brideName
      ? `${card.groomName} & ${card.brideName}`
      : card?.title ?? "Kad Jemputan")
  const displayName = rawName.replace(/\n/g, " ")

  const eventType =
    wc?.eventType ||
    (card?.template?.category === "WEDDING"   ? "Walimatul Urus" :
     card?.template?.category === "BIRTHDAY"  ? "Jemputan Hari Lahir" :
     card?.template?.category === "CORPORATE" ? "Majlis Korporat" :
     "Jemputan Digital")

  const dayAndDate = (wc?.dayAndDate ?? "").replace(/\n/g, "  ·  ")

  // Determine if bgColor is light to pick text colour
  const h  = (bg.replace("#", "") + "000000").slice(0, 6)
  const rr = parseInt(h.slice(0, 2), 16) || 0
  const gg = parseInt(h.slice(2, 4), 16) || 0
  const bb = parseInt(h.slice(4, 6), 16) || 0
  const bgIsLight = (rr * 299 + gg * 587 + bb * 114) / 1000 > 130
  const textColor = bgIsLight ? "#1a1a1a" : "#f0ece4"
  const textSub   = bgIsLight ? "#555555" : "#9a8a6a"

  const nameFontSize = displayName.length > 35 ? 60 : displayName.length > 22 ? 74 : 86

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: bg,
        fontFamily: "Georgia, 'Times New Roman', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Template background image — faded */}
      {img1 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img1}
          width={1200}
          height={630}
          alt=""
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.18,
          }}
        />
      )}

      {/* Gradient overlay so text stays readable regardless of bg image */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(140deg, ${bg}f2 0%, ${bg}88 55%, ${bg}d0 100%)`,
        display: "flex",
      }} />

      {/* Top accent bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
        display: "flex",
      }} />

      {/* Centre content */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 100,
        paddingRight: 100,
        paddingBottom: 50,
      }}>
        {/* Event type */}
        {eventType && (
          <div style={{
            fontSize: 20,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: `${primary}cc`,
            marginBottom: 28,
            display: "flex",
          }}>
            {eventType}
          </div>
        )}

        {/* Display name */}
        <div style={{
          fontSize: nameFontSize,
          color: textColor,
          textAlign: "center",
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 900,
        }}>
          {displayName}
        </div>

        {/* Ornamental divider */}
        <div style={{
          width: 150,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
          marginTop: 28,
          marginBottom: 28,
          display: "flex",
        }} />

        {/* Date */}
        {dayAndDate && (
          <div style={{
            fontSize: 22,
            color: textSub,
            textAlign: "center",
            letterSpacing: "0.04em",
            display: "flex",
          }}>
            {dayAndDate}
          </div>
        )}
      </div>

      {/* ekadku.com wordmark — bottom right */}
      <div style={{
        position: "absolute",
        bottom: 32,
        right: 52,
        display: "flex",
        alignItems: "baseline",
        gap: 0,
      }}>
        <span style={{ fontSize: 30, color: textColor }}>e</span>
        <span style={{ fontSize: 30, color: primary }}>kad</span>
        <span style={{ fontSize: 30, color: textColor }}>ku</span>
        <span style={{ fontSize: 16, color: `${primary}80` }}>.com</span>
      </div>

      {/* Bottom accent bar */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
        display: "flex",
      }} />
    </div>
  )
}
