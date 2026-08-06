import QRCode from "qrcode"
import type { WizardConfig } from "@/types/config"

export type PrintPageMode = "2" | "4"

export interface PrintCardInput {
  slug: string
  cardNum?: number | null
  title: string
  groomName?: string | null
  brideName?: string | null
  language: string
  isPublished: boolean
  wizardConfig?: WizardConfig | null
  theme: { primaryColor: string; bgColor: string; bodyColor?: string | null } | null
  image1Url?: string | null
  image2Url?: string | null
  pageMode?: PrintPageMode
}

function esc(s: string | undefined | null): string {
  if (!s) return ""
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function splitLines(s: string | undefined | null): string[] {
  if (!s) return []
  return s.split("\n").filter(l => l.trim())
}

// Returns a CSS font-family string using single quotes (safe inside double-quoted HTML attributes)
function fontFamily(font: string | undefined): string {
  const map: Record<string, string> = {
    PlayfairScript: "'Playfair Display', serif",
    Cormorant: "'Cormorant Garamond', serif",
    GreatVibes: "'Great Vibes', cursive",
    DancingScript: "'Dancing Script', cursive",
    Cinzel: "'Cinzel', serif",
    Montserrat: "'Montserrat', sans-serif",
    Lato: "'Lato', sans-serif",
    Spartan: "'Montserrat', sans-serif",
    Default: "'Cormorant Garamond', serif",
  }
  return map[font ?? ""] ?? "'Cormorant Garamond', serif"
}

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Great+Vibes&family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@400;600&family=Dancing+Script:wght@400;600&family=Montserrat:wght@300;400;600&display=swap"

const SERIF = "'Cormorant Garamond', serif"
const SANS = "'Lato', sans-serif"

function safeCssUrl(url: string): string {
  return url.replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")
}

// Builds a self-contained SVG QR code from a URL. Uses the synchronous QRCode.create
// (no external service), so the code renders offline in the print window. Dark modules
// on a white plate keep it reliably scannable regardless of the card's colours.
function qrSvg(text: string, size = 92): string {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: "M" })
    const count = qr.modules.size
    const data = qr.modules.data
    const cell = size / count
    let rects = ""
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (data[r * count + c]) {
          rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><g fill="#1f1f1f">${rects}</g></svg>`
  } catch {
    return ""
  }
}

export function generatePrintHTML(card: PrintCardInput): string {
  const wc = card.wizardConfig
  const accent = card.theme?.primaryColor ?? "#9b4d5e"
  const bg = card.theme?.bgColor ?? "#faf7f4"
  // body is used for paragraph/body text; accent for headings/names/ornaments
  const body = wc?.generalColor ?? card.theme?.bodyColor ?? accent
  const lang = card.language === "ms"
  const pageMode = card.pageMode ?? "4"

  const displayName =
    wc?.displayName ||
    (card.groomName && card.brideName ? `${card.groomName} & ${card.brideName}` : null) ||
    card.title ||
    "Nama Pengantin"

  const nameFontCss = fontFamily(wc?.displayNameFont)
  const fullNameFontCss = fontFamily(wc?.fullNamesFont)

  const eventType = wc?.eventType || (lang ? "Walimatul Urus" : "Wedding Reception")
  const dayAndDate = wc?.dayAndDate || ""
  const hijriDate = wc?.hijriDate || ""
  const venueLine = wc?.venueLine || ""
  const venueAddress = wc?.venueAddress || ""
  const gpsCoords = wc?.gpsCoordinates || ""
  // Venue location QR: prefer the Google Maps URL, fall back to Waze when only that is set.
  const locationUrl = (wc?.googleMapsUrl || "").trim() || (wc?.wazeUrl || "").trim()
  const openingSpeech = wc?.openingSpeech || ""
  const fullNames = wc?.fullNames || displayName
  const invitationSpeech = wc?.invitationSpeech || ""
  const org1 = wc?.organizer1
  const org2 = wc?.organizer2
  const orgCount = wc?.organizerCount ?? 0
  const additionalInfo1 = wc?.additionalInfo1 || ""
  const eventProgram = wc?.eventProgram || ""
  const additionalInfo2 = wc?.additionalInfo2 || ""
  const contacts = (wc?.contacts ?? []).filter(c => c.phone)
  const rsvpNote = wc?.rsvp?.note || ""

  let timeRange = ""
  try {
    if (wc?.startDateTime) {
      const locale = lang ? "ms-MY" : "en-MY"
      const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
      const start = new Date(wc.startDateTime).toLocaleTimeString(locale, opts)
      const end = wc.endDateTime
        ? new Date(wc.endDateTime).toLocaleTimeString(locale, opts)
        : ""
      timeRange = end ? `${start} – ${end}` : start
    }
  } catch {
    // ignore
  }

  // ── Shared style builder ───────────────────────────────────────────

  // All HTML uses double-quoted attributes. CSS font-family values use single quotes which are safe inside double-quoted HTML attributes.
  // Cover (page 1) uses image1Url; inner pages (2-4) use image2Url. Falls back to flat bgColor when no image is set.
  function pgStyle(useImage1: boolean): string {
    const imgUrl = useImage1 ? card.image1Url : (card.image2Url ?? card.image1Url)
    const bgImage = imgUrl
      ? `background-image:url('${safeCssUrl(imgUrl)}');background-size:cover;background-position:center top;`
      : ""
    return `width:5in;height:7in;position:relative;overflow:hidden;background-color:${bg};${bgImage}font-family:${SERIF};page-break-after:always;`
  }

  const frame = [
    `<div style="position:absolute;top:14px;left:14px;right:14px;bottom:14px;border:1px solid ${accent}40;pointer-events:none;"></div>`,
    `<div style="position:absolute;top:18px;left:18px;right:18px;bottom:18px;border:1px solid ${accent}22;pointer-events:none;"></div>`,
    `<div style="position:absolute;top:22px;left:22px;width:18px;height:18px;border-top:1.5px solid ${accent};border-left:1.5px solid ${accent};"></div>`,
    `<div style="position:absolute;top:22px;right:22px;width:18px;height:18px;border-top:1.5px solid ${accent};border-right:1.5px solid ${accent};"></div>`,
    `<div style="position:absolute;bottom:22px;left:22px;width:18px;height:18px;border-bottom:1.5px solid ${accent};border-left:1.5px solid ${accent};"></div>`,
    `<div style="position:absolute;bottom:22px;right:22px;width:18px;height:18px;border-bottom:1.5px solid ${accent};border-right:1.5px solid ${accent};"></div>`,
  ].join("")

  function divider(sym: string, mg = "6px"): string {
    return `<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:${mg} 0;"><div style="height:1px;width:40px;background:${accent};opacity:0.3;"></div><span style="color:${accent};font-size:7pt;opacity:0.55;">${sym}</span><div style="height:1px;width:40px;background:${accent};opacity:0.3;"></div></div>`
  }

  function thinDivider(sym: string, mg = "4px"): string {
    return `<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:${mg} 0;"><div style="height:1px;width:26px;background:${accent};opacity:0.25;"></div><span style="color:${accent};font-size:6pt;opacity:0.4;">${sym}</span><div style="height:1px;width:26px;background:${accent};opacity:0.25;"></div></div>`
  }

  const centerCol = `position:absolute;inset:34px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;gap:0;`

  // Watermark: repeated diagonal text if unpublished
  const watermark = !card.isPublished
    ? `<div style="position:absolute;inset:0;z-index:100;overflow:hidden;pointer-events:none;">${
        Array.from({ length: 9 }, (_, i) =>
          `<div style="position:absolute;top:${i * 84 - 10}px;left:-80px;right:-80px;transform:rotate(-32deg);text-align:center;font-family:sans-serif;font-size:19px;font-weight:900;color:#000;opacity:0.055;letter-spacing:0.5em;white-space:nowrap;">PRATONTON SAHAJA &nbsp; PRATONTON SAHAJA &nbsp; PRATONTON SAHAJA</div>`
        ).join("")
      }</div>`
    : ""

  // ── Shared icon helpers (used by page 4 and packed page 2) ────────

  const waIconSvg = (col: string) =>
    `<svg width="13" height="13" viewBox="0 0 24 24" fill="${col}" style="opacity:0.62;flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`

  const phoneIconSvg = (col: string) =>
    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2" style="opacity:0.62;flex-shrink:0;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.5a16 16 0 006.29 6.29l1.06-1.06a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`

  // ── Page 1: Cover ─────────────────────────────────────────────────

  const nameHtml = esc(displayName).replace(" &amp; ", "<br>&amp;<br>")

  const p1: string[] = [
    `<p style="font-family:${SANS};font-size:8pt;letter-spacing:0.38em;color:${body};text-transform:uppercase;opacity:0.78;margin-bottom:10px;">${esc(eventType)}</p>`,
    divider("&#10022;"),
    `<h1 style="font-family:${nameFontCss};font-size:42pt;color:${accent};line-height:1.05;margin:10px 0 8px;">${nameHtml}</h1>`,
    divider("&#10022;"),
  ]
  if (dayAndDate) {
    p1.push(`<div style="margin:8px 0 3px;">${splitLines(dayAndDate).map(l => `<p style="font-family:${SERIF};font-size:12pt;color:${body};opacity:0.84;line-height:1.55;">${esc(l)}</p>`).join("")}</div>`)
  }
  if (hijriDate) {
    p1.push(`<p style="font-family:${SERIF};font-size:9pt;color:${body};opacity:0.58;font-style:italic;margin-top:2px;">${esc(hijriDate)}</p>`)
  }
  // Time is intentionally omitted on the cover — it's shown on the details page (page 3).
  if (venueLine) {
    p1.push(thinDivider("&middot;"))
    p1.push(`<p style="font-family:${SERIF};font-size:11pt;color:${body};opacity:0.78;font-style:italic;margin-top:4px;">${esc(venueLine)}</p>`)
  }

  const page1 = `<div style="${pgStyle(true)}">${watermark}${frame}<div style="${centerCol}">${p1.join("")}</div></div>`

  // ── Page 2: Invitation ────────────────────────────────────────────

  const orgs: string[] = []
  if (orgCount >= 1 && org1?.name) {
    orgs.push(`<p style="font-family:${SERIF};font-size:13pt;font-weight:600;color:${body};">${esc(org1.name)}</p>`)
    if (org1.relationship) {
      orgs.push(`<p style="font-family:${SANS};font-size:7.5pt;color:${body};opacity:0.52;letter-spacing:0.1em;font-style:italic;">${esc(org1.relationship)}</p>`)
    }
  }
  if (orgCount >= 2 && org2?.name) {
    orgs.push(`<p style="font-family:${SERIF};font-size:9pt;color:${body};opacity:0.4;margin:5px 0;">&amp;</p>`)
    orgs.push(`<p style="font-family:${SERIF};font-size:13pt;font-weight:600;color:${body};">${esc(org2.name)}</p>`)
    if (org2.relationship) {
      orgs.push(`<p style="font-family:${SANS};font-size:7.5pt;color:${body};opacity:0.52;letter-spacing:0.1em;font-style:italic;">${esc(org2.relationship)}</p>`)
    }
  }

  const fullNameLines = fullNames.split("\n").map(l => {
    const isSep = /^[&]$/.test(l.trim()) || /^dan$/i.test(l.trim())
    return `<p style="font-family:${fullNameFontCss};font-size:${isSep ? "10" : "15"}pt;color:${accent};line-height:1.45;${isSep ? "opacity:0.38;" : "font-weight:600;"}">${esc(l) || "&nbsp;"}</p>`
  })

  const p2: string[] = []
  if (openingSpeech) {
    p2.push(`<div style="margin-bottom:8px;">${splitLines(openingSpeech).map((l, i) => `<p style="font-family:${SERIF};font-size:${i === 0 ? "11" : "9"}pt;color:${body};opacity:${i === 0 ? "0.88" : "0.62"};line-height:1.65;font-style:italic;">${esc(l)}</p>`).join("")}</div>`)
  }
  p2.push(divider("&#10022;"))
  if (orgs.length) {
    p2.push(`<div style="margin:8px 0;text-align:center;">${orgs.join("")}</div>`)
  }
  if (invitationSpeech) {
    p2.push(`<div style="max-width:3.4in;margin:8px auto;">${splitLines(invitationSpeech).map(l => `<p style="font-family:${SERIF};font-size:9pt;color:${body};opacity:0.68;line-height:1.75;">${esc(l)}</p>`).join("")}</div>`)
  }
  p2.push(divider("&#10022;"))
  p2.push(`<div style="margin-top:5px;">${fullNameLines.join("")}</div>`)

  const page2 = `<div style="${pgStyle(false)}">${watermark}${frame}<div style="${centerCol}">${p2.join("")}</div></div>`

  // ── Page 3: Venue & Details ───────────────────────────────────────

  const progLines = splitLines(eventProgram)

  const topCol = `position:absolute;inset:34px;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden;gap:0;padding-top:64px;`
  const p3: string[] = [
    `<p style="font-family:${SANS};font-size:7.5pt;letter-spacing:0.4em;color:${body};text-transform:uppercase;opacity:0.62;margin-bottom:8px;">${lang ? "MAKLUMAT MAJLIS" : "EVENT DETAILS"}</p>`,
    divider("&#10022;", "4px"),
  ]
  // Venue block: when a location URL exists, lay the QR on the left and the venue
  // name/address on the right; otherwise fall back to a centered stack.
  const venueInfo: string[] = []
  if (venueLine) {
    venueInfo.push(`<h2 style="font-family:${SERIF};font-size:15pt;color:${accent};font-weight:600;margin:0 0 4px;line-height:1.2;">${esc(venueLine)}</h2>`)
  }
  if (venueAddress) {
    venueInfo.push(`<div style="margin:2px 0;">${splitLines(venueAddress).map(l => `<p style="font-family:${SANS};font-size:8pt;color:${body};opacity:0.62;line-height:1.6;">${esc(l)}</p>`).join("")}</div>`)
  }
  if (gpsCoords) {
    venueInfo.push(`<p style="font-family:${SANS};font-size:7pt;color:${body};opacity:0.42;margin-top:2px;">GPS: ${esc(gpsCoords)}</p>`)
  }

  const venueQrSvg = locationUrl ? qrSvg(locationUrl, 88) : ""
  if (venueQrSvg) {
    const qrCol =
      `<div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:3px;">` +
      `<div style="background:#fff;padding:5px;border-radius:6px;border:1px solid ${accent}22;line-height:0;">${venueQrSvg}</div>` +
      `<p style="font-family:${SANS};font-size:5.5pt;letter-spacing:0.22em;color:${body};text-transform:uppercase;opacity:0.5;">${lang ? "IMBAS LOKASI" : "SCAN LOCATION"}</p>` +
      `</div>`
    p3.push(
      `<div style="display:flex;align-items:center;justify-content:center;gap:14px;margin:8px 0 4px;width:100%;max-width:290px;">` +
      qrCol +
      `<div style="flex:1;text-align:left;">${venueInfo.join("")}</div>` +
      `</div>`
    )
  } else {
    p3.push(...venueInfo)
  }
  p3.push(thinDivider("&#10022;"))
  if (dayAndDate) {
    p3.push(`<div style="margin:5px 0 2px;">${splitLines(dayAndDate).map(l => `<p style="font-family:${SERIF};font-size:11pt;color:${body};opacity:0.84;line-height:1.55;">${esc(l)}</p>`).join("")}</div>`)
  }
  // Time is intentionally omitted here — it's covered by the "Atur Cara" programme below.
  if (additionalInfo1) {
    p3.push(thinDivider("&middot;"))
    p3.push(`<p style="font-family:${SERIF};font-size:9pt;color:${body};opacity:0.68;font-style:italic;margin:4px 0;">${esc(additionalInfo1)}</p>`)
  }
  if (progLines.length > 0) {
    p3.push(thinDivider("&middot;"))
    p3.push(`<p style="font-family:${SANS};font-size:7pt;letter-spacing:0.3em;color:${body};text-transform:uppercase;opacity:0.48;margin-bottom:5px;">${lang ? "ATUR CARA" : "PROGRAMME"}</p>`)
    const progHtml = progLines.slice(0, 8).map(l => {
      const isTime = /^\d{1,2}[:.]\d{2}/.test(l.trim()) || /\b(pagi|petang|malam|am|pm)\b/i.test(l)
      return `<p style="font-family:${SANS};font-size:7.5pt;color:${body};opacity:${isTime ? "0.48" : "0.82"};line-height:1.55;text-align:left;${!isTime ? "font-weight:700;margin-top:4px;" : ""}">${esc(l)}</p>`
    }).join("")
    p3.push(`<div style="width:100%;max-width:195px;margin:0 auto;">${progHtml}</div>`)
  }

  const page3 = `<div style="${pgStyle(false)}">${watermark}${frame}<div style="${topCol}">${p3.join("")}</div></div>`

  // ── Page 4: Thank You / Contact ───────────────────────────────────

  const contactsHtml = contacts.slice(0, 7).map(c =>
    `<div style="display:flex;align-items:center;justify-content:center;gap:7px;margin:3px 0;">${c.isWhatsApp ? waIconSvg(body) : phoneIconSvg(body)}<div style="text-align:left;">${c.name ? `<p style="font-family:${SERIF};font-size:11pt;color:${body};">${esc(c.name)}</p>` : ""}<p style="font-family:${SANS};font-size:8pt;color:${body};opacity:0.62;">${esc(c.phone)}</p></div></div>`
  ).join("")

  const closingLines = splitLines(additionalInfo2).slice(0, 4)
  const closingHtml = closingLines.length > 0
    ? closingLines.map(l => `<p style="font-family:${SERIF};font-size:9pt;color:${body};opacity:0.62;line-height:1.75;font-style:italic;">${esc(l)}</p>`).join("")
    : `<p style="font-family:${SERIF};font-size:9pt;color:${body};opacity:0.58;font-style:italic;">${lang ? "Kehadiran Dato&#39; | Datin | Tuan | Puan adalah penghormatan besar bagi kami." : "Your presence is the greatest honour to us."}</p>`

  const p4: string[] = [
    `<h2 style="font-family:${SERIF};font-size:22pt;color:${accent};font-weight:600;letter-spacing:0.03em;margin-bottom:8px;">${lang ? "Terima Kasih" : "Thank You"}</h2>`,
    divider("&#10022;"),
    `<div style="max-width:3.2in;margin:6px auto;">${closingHtml}</div>`,
  ]
  if (rsvpNote) {
    p4.push(thinDivider("&middot;"))
    p4.push(`<p style="font-family:${SANS};font-size:7.5pt;color:${body};opacity:0.58;letter-spacing:0.04em;margin:4px 0;">${esc(rsvpNote)}</p>`)
  }
  if (contacts.length > 0) {
    p4.push(thinDivider("&#10022;"))
    p4.push(`<p style="font-family:${SANS};font-size:6.5pt;letter-spacing:0.35em;color:${body};text-transform:uppercase;opacity:0.48;margin-bottom:5px;">${lang ? "HUBUNGI" : "CONTACT"}</p>`)
    p4.push(contactsHtml)
  }

  const page4 =
    `<div style="${pgStyle(false)}">` +
    watermark + frame +
    `<div style="${centerCol}">${p4.join("")}</div>` +
    `<p style="position:absolute;bottom:26px;left:0;right:0;text-align:center;font-family:${SANS};font-size:6pt;color:${body};opacity:0.4;letter-spacing:0.2em;">www.ekadku.com</p>` +
    `</div>`

  // ── Packed page 2 (2-page mode): condenses pages 2+3+4 into one ──

  function buildPackedPage(): string {
    const packedCol = `position:absolute;inset:28px;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden;gap:0;padding-top:40px;`
    const items: string[] = []

    // Opening speech (max 3 lines)
    if (openingSpeech) {
      items.push(
        `<div style="margin-bottom:3px;">${
          splitLines(openingSpeech).slice(0, 3).map(l =>
            `<p style="font-family:${SERIF};font-size:6.5pt;color:${body};opacity:0.75;line-height:1.5;font-style:italic;">${esc(l)}</p>`
          ).join("")
        }</div>`
      )
    }

    items.push(divider("&#10022;", "3px"))

    // Organizers
    if (orgCount >= 1 && org1?.name) {
      items.push(`<p style="font-family:${SERIF};font-size:9pt;font-weight:600;color:${body};line-height:1.3;">${esc(org1.name)}</p>`)
      if (org1.relationship) {
        items.push(`<p style="font-family:${SANS};font-size:6pt;color:${body};opacity:0.5;letter-spacing:0.08em;font-style:italic;">${esc(org1.relationship)}</p>`)
      }
    }
    if (orgCount >= 2 && org2?.name) {
      items.push(`<p style="font-family:${SERIF};font-size:7.5pt;color:${body};opacity:0.4;margin:2px 0;">&amp;</p>`)
      items.push(`<p style="font-family:${SERIF};font-size:9pt;font-weight:600;color:${body};line-height:1.3;">${esc(org2.name)}</p>`)
      if (org2.relationship) {
        items.push(`<p style="font-family:${SANS};font-size:6pt;color:${body};opacity:0.5;letter-spacing:0.08em;font-style:italic;">${esc(org2.relationship)}</p>`)
      }
    }

    // Invitation speech (max 4 lines)
    if (invitationSpeech) {
      items.push(
        `<div style="max-width:3.2in;margin:3px auto;">${
          splitLines(invitationSpeech).slice(0, 4).map(l =>
            `<p style="font-family:${SERIF};font-size:6.5pt;color:${body};opacity:0.65;line-height:1.6;">${esc(l)}</p>`
          ).join("")
        }</div>`
      )
    }

    items.push(thinDivider("&middot;", "3px"))

    // Full names (slightly smaller than 4-page)
    const packedNameLines = fullNames.split("\n").map(l => {
      const isSep = /^[&]$/.test(l.trim()) || /^dan$/i.test(l.trim())
      return `<p style="font-family:${fullNameFontCss};font-size:${isSep ? "8" : "12"}pt;color:${accent};line-height:1.35;${isSep ? "opacity:0.38;" : "font-weight:600;"}">${esc(l) || "&nbsp;"}</p>`
    })
    items.push(`<div style="margin:2px 0;">${packedNameLines.join("")}</div>`)

    items.push(thinDivider("&middot;", "3px"))

    // Venue — QR on the left, venue name/address on the right (falls back to a stack).
    const packedVenueInfo: string[] = []
    if (venueLine) {
      packedVenueInfo.push(`<p style="font-family:${SERIF};font-size:9pt;color:${accent};font-weight:600;margin-bottom:2px;line-height:1.2;">${esc(venueLine)}</p>`)
    }
    if (venueAddress) {
      packedVenueInfo.push(
        `<div>${
          splitLines(venueAddress).slice(0, 3).map(l =>
            `<p style="font-family:${SANS};font-size:6pt;color:${body};opacity:0.6;line-height:1.5;">${esc(l)}</p>`
          ).join("")
        }</div>`
      )
    }
    const packedQrSvg = locationUrl ? qrSvg(locationUrl, 54) : ""
    if (packedQrSvg) {
      items.push(
        `<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:2px 0;width:100%;max-width:230px;">` +
        `<div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px;">` +
        `<div style="background:#fff;padding:3px;border-radius:4px;border:1px solid ${accent}22;line-height:0;">${packedQrSvg}</div>` +
        `<p style="font-family:${SANS};font-size:4.5pt;letter-spacing:0.18em;color:${body};text-transform:uppercase;opacity:0.5;">${lang ? "IMBAS LOKASI" : "SCAN LOCATION"}</p>` +
        `</div>` +
        `<div style="flex:1;text-align:left;">${packedVenueInfo.join("")}</div>` +
        `</div>`
      )
    } else {
      items.push(...packedVenueInfo)
    }

    // Day/date is omitted here (shown on the cover) and time is omitted (covered by "Atur Cara").

    // Dress code / additionalInfo1
    if (additionalInfo1) {
      items.push(`<p style="font-family:${SERIF};font-size:6.5pt;color:${body};opacity:0.6;font-style:italic;margin-top:3px;">${esc(additionalInfo1)}</p>`)
    }

    // Programme (max 5 items)
    const packedProgLines = splitLines(eventProgram)
    if (packedProgLines.length > 0) {
      items.push(thinDivider("&middot;", "3px"))
      items.push(`<p style="font-family:${SANS};font-size:5.5pt;letter-spacing:0.3em;color:${body};text-transform:uppercase;opacity:0.45;margin-bottom:2px;">${lang ? "ATUR CARA" : "PROGRAMME"}</p>`)
      const packedProgHtml = packedProgLines.slice(0, 5).map(l => {
        const isTime = /^\d{1,2}[:.]\d{2}/.test(l.trim()) || /\b(pagi|petang|malam|am|pm)\b/i.test(l)
        return `<p style="font-family:${SANS};font-size:6pt;color:${body};opacity:${isTime ? "0.45" : "0.78"};line-height:1.4;text-align:left;${!isTime ? "font-weight:700;margin-top:2px;" : ""}">${esc(l)}</p>`
      }).join("")
      items.push(`<div style="width:100%;max-width:180px;margin:0 auto;">${packedProgHtml}</div>`)
    }

    // Contacts (max 2, inline compact)
    if (contacts.length > 0) {
      items.push(thinDivider("&#10022;", "3px"))
      const packedContactsHtml = contacts.slice(0, 4).map(c =>
        `<div style="display:flex;align-items:center;justify-content:center;gap:5px;margin:2px 0;">${
          c.isWhatsApp ? waIconSvg(body) : phoneIconSvg(body)
        }<p style="font-family:${SANS};font-size:6pt;color:${body};opacity:0.65;">${
          c.name ? `${esc(c.name)} &nbsp;·&nbsp; ` : ""
        }${esc(c.phone)}</p></div>`
      ).join("")
      items.push(packedContactsHtml)
    }

    // Additional Info #2 (additionalInfo2) is intentionally omitted in 2-page mode to save space.

    return `<div style="${pgStyle(false)}">${watermark}${frame}<div style="${packedCol}">${items.join("")}</div>` +
      `<p style="position:absolute;bottom:22px;left:0;right:0;text-align:center;font-family:${SANS};font-size:6pt;color:${body};opacity:0.4;letter-spacing:0.2em;">www.ekadku.com</p>` +
      `</div>`
  }

  // ── Assemble pages based on mode ──────────────────────────────────

  const pages = pageMode === "2"
    ? [page1, buildPackedPage()]
    : [page1, page2, page3, page4]

  return `<!DOCTYPE html>
<html lang="${esc(card.language)}">
<head>
<meta charset="UTF-8">
<title>${esc(displayName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link href="${GOOGLE_FONTS}" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{background:#c8c8c8;}
.pw{display:flex;justify-content:center;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.22);}
@page{size:5in 7in;margin:0;}
@media print{html,body{background:none;}.pw{margin:0;box-shadow:none;}}
</style>
</head>
<body>
${pages.map(p => `<div class="pw">${p}</div>`).join("\n")}
</body>
</html>`
}
