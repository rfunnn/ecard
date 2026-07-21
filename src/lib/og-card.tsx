import { deriveOgText, type OgCardCore } from "./og-meta"

export type OgCardData = (OgCardCore & {
  template: { category: string; image1Url: string | null; thumbnail?: string | null } | null
  theme: { primaryColor: string; bgColor: string; bgImageUrl: string | null } | null
}) | null

/**
 * Renders the OG card layout.
 *
 * `scale` shrinks every fixed pixel value proportionally so the rendered PNG
 * can be emitted at a smaller resolution (fewer pixels → smaller file). This
 * matters for WhatsApp, which silently drops link-preview thumbnails once the
 * og:image exceeds ~300 KB. The design is authored for a 1200×630 canvas, so a
 * scale of 0.7 yields 840×441 — visually identical in a chat/preview card but
 * roughly half the byte size.
 */
export function buildOgImage(card: OgCardData, scale = 1) {
  const s = (n: number) => n * scale

  const primary = card?.theme?.primaryColor ?? "#D4AF37"
  const bg      = card?.theme?.bgColor      ?? "#0e0e0e"
  const img1    = card?.template?.image1Url ?? card?.template?.thumbnail ?? card?.theme?.bgImageUrl ?? null

  const { displayName, eventType, dayAndDateRaw } = deriveOgText(card)
  const dayAndDate = dayAndDateRaw.replace(/\n/g, "  ·  ")

  // Determine if bgColor is light to pick text colour
  const h  = (bg.replace("#", "") + "000000").slice(0, 6)
  const rr = parseInt(h.slice(0, 2), 16) || 0
  const gg = parseInt(h.slice(2, 4), 16) || 0
  const bb = parseInt(h.slice(4, 6), 16) || 0
  const bgIsLight = (rr * 299 + gg * 587 + bb * 114) / 1000 > 130
  const textColor = bgIsLight ? "#1a1a1a" : "#f5efe2"
  const textSub   = bgIsLight ? "#4a4a4a" : "#d8c9a3"

  const nameFontSize = displayName.length > 35 ? s(52) : displayName.length > 22 ? s(62) : s(72)

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
      {/* Template cover photo — full bleed, matches the real page 1 */}
      {img1 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img1}
          width={s(1200)}
          height={s(630)}
          alt=""
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Bottom scrim so the caption stays legible over any photo */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        height: img1 ? "62%" : "100%",
        background: img1
          ? `linear-gradient(0deg, ${bg}f2 0%, ${bg}d0 40%, transparent 100%)`
          : bg,
        display: "flex",
      }} />

      {/* ekadku.com wordmark — top right */}
      <div style={{
        position: "absolute",
        top: s(28),
        right: s(44),
        display: "flex",
        alignItems: "baseline",
        gap: 0,
      }}>
        <span style={{ fontSize: s(24), color: textColor }}>e</span>
        <span style={{ fontSize: s(24), color: primary }}>kad</span>
        <span style={{ fontSize: s(24), color: textColor }}>ku</span>
        <span style={{ fontSize: s(13), color: `${primary}a0` }}>.com</span>
      </div>

      {/* Caption block — anchored to the bottom, like the card's own cover */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingLeft: s(90),
        paddingRight: s(90),
        paddingBottom: s(56),
        paddingTop: s(40),
      }}>
        {/* Event type */}
        {eventType && (
          <div style={{
            fontSize: s(18),
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: primary,
            marginBottom: s(18),
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
          letterSpacing: `${s(-0.5)}px`,
          lineHeight: 1.2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: s(950),
        }}>
          {displayName}
        </div>

        {/* Date */}
        {dayAndDate && (
          <div style={{
            fontSize: s(20),
            color: textSub,
            textAlign: "center",
            letterSpacing: "0.04em",
            marginTop: s(18),
            display: "flex",
          }}>
            {dayAndDate}
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: s(5),
        background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
        display: "flex",
      }} />
    </div>
  )
}
