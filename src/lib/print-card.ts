import type { WizardConfig } from "@/types/config"

export interface PrintCardInput {
  slug: string
  title: string
  groomName?: string | null
  brideName?: string | null
  language: string
  isPublished: boolean
  wizardConfig?: WizardConfig | null
  theme: { primaryColor: string; bgColor: string } | null
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

export function generatePrintHTML(card: PrintCardInput): string {
  const wc = card.wizardConfig
  const accent = card.theme?.primaryColor ?? "#9b4d5e"
  const bg = card.theme?.bgColor ?? "#faf7f4"
  const lang = card.language === "ms"

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
  const pgStyle = `width:5in;height:7in;position:relative;overflow:hidden;background-color:${bg};font-family:${SERIF};page-break-after:always;`

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

  function thinDivider(sym: string): string {
    return `<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:4px 0;"><div style="height:1px;width:26px;background:${accent};opacity:0.25;"></div><span style="color:${accent};font-size:6pt;opacity:0.4;">${sym}</span><div style="height:1px;width:26px;background:${accent};opacity:0.25;"></div></div>`
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

  // ── Page 1: Cover ─────────────────────────────────────────────────

  const nameHtml = esc(displayName).replace(" &amp; ", "<br>&amp;<br>")

  const p1: string[] = [
    `<p style="font-family:${SANS};font-size:8pt;letter-spacing:0.38em;color:${accent};text-transform:uppercase;opacity:0.78;margin-bottom:10px;">${esc(eventType)}</p>`,
    divider("&#10022;"),
    `<h1 style="font-family:${nameFontCss};font-size:42pt;color:${accent};line-height:1.05;margin:10px 0 8px;">${nameHtml}</h1>`,
    divider("&#10022;"),
  ]
  if (dayAndDate) {
    p1.push(`<div style="margin:8px 0 3px;">${splitLines(dayAndDate).map(l => `<p style="font-family:${SERIF};font-size:12pt;color:${accent};opacity:0.84;line-height:1.55;">${esc(l)}</p>`).join("")}</div>`)
  }
  if (hijriDate) {
    p1.push(`<p style="font-family:${SERIF};font-size:9pt;color:${accent};opacity:0.58;font-style:italic;margin-top:2px;">${esc(hijriDate)}</p>`)
  }
  if (timeRange) {
    p1.push(`<p style="font-family:${SANS};font-size:9pt;letter-spacing:0.1em;color:${accent};opacity:0.68;margin-top:4px;">${esc(timeRange)}</p>`)
  }
  if (venueLine) {
    p1.push(thinDivider("&middot;"))
    p1.push(`<p style="font-family:${SERIF};font-size:11pt;color:${accent};opacity:0.78;font-style:italic;margin-top:4px;">${esc(venueLine)}</p>`)
  }

  const page1 = `<div style="${pgStyle}">${watermark}${frame}<div style="${centerCol}">${p1.join("")}</div></div>`

  // ── Page 2: Invitation ────────────────────────────────────────────

  const orgs: string[] = []
  if (orgCount >= 1 && org1?.name) {
    orgs.push(`<p style="font-family:${SERIF};font-size:13pt;font-weight:600;color:${accent};">${esc(org1.name)}</p>`)
    if (org1.relationship) {
      orgs.push(`<p style="font-family:${SANS};font-size:7.5pt;color:${accent};opacity:0.52;letter-spacing:0.1em;font-style:italic;">${esc(org1.relationship)}</p>`)
    }
  }
  if (orgCount >= 2 && org2?.name) {
    orgs.push(`<p style="font-family:${SERIF};font-size:9pt;color:${accent};opacity:0.4;margin:5px 0;">&amp;</p>`)
    orgs.push(`<p style="font-family:${SERIF};font-size:13pt;font-weight:600;color:${accent};">${esc(org2.name)}</p>`)
    if (org2.relationship) {
      orgs.push(`<p style="font-family:${SANS};font-size:7.5pt;color:${accent};opacity:0.52;letter-spacing:0.1em;font-style:italic;">${esc(org2.relationship)}</p>`)
    }
  }

  const fullNameLines = fullNames.split("\n").map(l => {
    const isSep = /^[&]$/.test(l.trim()) || /^dan$/i.test(l.trim())
    return `<p style="font-family:${fullNameFontCss};font-size:${isSep ? "10" : "15"}pt;color:${accent};line-height:1.45;${isSep ? "opacity:0.38;" : "font-weight:600;"}">${esc(l) || "&nbsp;"}</p>`
  })

  const p2: string[] = []
  if (openingSpeech) {
    p2.push(`<div style="margin-bottom:8px;">${splitLines(openingSpeech).map((l, i) => `<p style="font-family:${SERIF};font-size:${i === 0 ? "11" : "9"}pt;color:${accent};opacity:${i === 0 ? "0.88" : "0.62"};line-height:1.65;font-style:italic;">${esc(l)}</p>`).join("")}</div>`)
  }
  p2.push(divider("&#10022;"))
  if (orgs.length) {
    p2.push(`<div style="margin:8px 0;text-align:center;">${orgs.join("")}</div>`)
  }
  if (invitationSpeech) {
    p2.push(`<div style="max-width:3.4in;margin:8px auto;">${splitLines(invitationSpeech).map(l => `<p style="font-family:${SERIF};font-size:9pt;color:${accent};opacity:0.68;line-height:1.75;">${esc(l)}</p>`).join("")}</div>`)
  }
  p2.push(divider("&#10022;"))
  p2.push(`<div style="margin-top:5px;">${fullNameLines.join("")}</div>`)

  const page2 = `<div style="${pgStyle}">${watermark}${frame}<div style="${centerCol}">${p2.join("")}</div></div>`

  // ── Page 3: Venue & Details ───────────────────────────────────────

  const progLines = splitLines(eventProgram)

  const topCol = `position:absolute;inset:34px;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden;gap:0;padding-top:6px;`
  const p3: string[] = [
    `<p style="font-family:${SANS};font-size:7.5pt;letter-spacing:0.4em;color:${accent};text-transform:uppercase;opacity:0.62;margin-bottom:8px;">${lang ? "MAKLUMAT MAJLIS" : "EVENT DETAILS"}</p>`,
    divider("&#10022;", "4px"),
  ]
  if (venueLine) {
    p3.push(`<h2 style="font-family:${SERIF};font-size:16pt;color:${accent};font-weight:600;margin:8px 0 4px;">${esc(venueLine)}</h2>`)
  }
  if (venueAddress) {
    p3.push(`<div style="margin:2px 0 5px;">${splitLines(venueAddress).map(l => `<p style="font-family:${SANS};font-size:8pt;color:${accent};opacity:0.62;line-height:1.6;">${esc(l)}</p>`).join("")}</div>`)
  }
  if (gpsCoords) {
    p3.push(`<p style="font-family:${SANS};font-size:7pt;color:${accent};opacity:0.42;margin-bottom:3px;">GPS: ${esc(gpsCoords)}</p>`)
  }
  p3.push(thinDivider("&#10022;"))
  if (dayAndDate) {
    p3.push(`<div style="margin:5px 0 2px;">${splitLines(dayAndDate).map(l => `<p style="font-family:${SERIF};font-size:11pt;color:${accent};opacity:0.84;line-height:1.55;">${esc(l)}</p>`).join("")}</div>`)
  }
  if (timeRange) {
    p3.push(`<p style="font-family:${SANS};font-size:9pt;letter-spacing:0.1em;color:${accent};opacity:0.68;margin-bottom:3px;">${esc(timeRange)}</p>`)
  }
  if (additionalInfo1) {
    p3.push(thinDivider("&middot;"))
    p3.push(`<p style="font-family:${SERIF};font-size:9pt;color:${accent};opacity:0.68;font-style:italic;margin:4px 0;">${esc(additionalInfo1)}</p>`)
  }
  if (progLines.length > 0) {
    p3.push(thinDivider("&middot;"))
    p3.push(`<p style="font-family:${SANS};font-size:7pt;letter-spacing:0.3em;color:${accent};text-transform:uppercase;opacity:0.48;margin-bottom:5px;">${lang ? "ATUR CARA" : "PROGRAMME"}</p>`)
    const progHtml = progLines.slice(0, 8).map(l => {
      const isTime = /^\d{1,2}[:.]\d{2}/.test(l.trim()) || /\b(pagi|petang|malam|am|pm)\b/i.test(l)
      return `<p style="font-family:${SANS};font-size:7.5pt;color:${accent};opacity:${isTime ? "0.48" : "0.82"};line-height:1.55;text-align:left;${!isTime ? "font-weight:700;margin-top:4px;" : ""}">${esc(l)}</p>`
    }).join("")
    p3.push(`<div style="width:100%;max-width:195px;margin:0 auto;">${progHtml}</div>`)
  }

  const page3 = `<div style="${pgStyle}">${watermark}${frame}<div style="${topCol}">${p3.join("")}</div></div>`

  // ── Page 4: Thank You / Contact ───────────────────────────────────

  const waIconSvg = (col: string) =>
    `<svg width="13" height="13" viewBox="0 0 24 24" fill="${col}" style="opacity:0.62;flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`

  const phoneIconSvg = (col: string) =>
    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2" style="opacity:0.62;flex-shrink:0;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.5a16 16 0 006.29 6.29l1.06-1.06a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`

  const contactsHtml = contacts.slice(0, 3).map(c =>
    `<div style="display:flex;align-items:center;justify-content:center;gap:7px;margin:3px 0;">${c.isWhatsApp ? waIconSvg(accent) : phoneIconSvg(accent)}<div style="text-align:left;">${c.name ? `<p style="font-family:${SERIF};font-size:11pt;color:${accent};">${esc(c.name)}</p>` : ""}<p style="font-family:${SANS};font-size:8pt;color:${accent};opacity:0.62;">${esc(c.phone)}</p></div></div>`
  ).join("")

  const closingLines = splitLines(additionalInfo2).slice(0, 4)
  const closingHtml = closingLines.length > 0
    ? closingLines.map(l => `<p style="font-family:${SERIF};font-size:9pt;color:${accent};opacity:0.62;line-height:1.75;font-style:italic;">${esc(l)}</p>`).join("")
    : `<p style="font-family:${SERIF};font-size:9pt;color:${accent};opacity:0.58;font-style:italic;">${lang ? "Kehadiran Dato&#39; | Datin | Tuan | Puan adalah penghormatan besar bagi kami." : "Your presence is the greatest honour to us."}</p>`

  const p4: string[] = [
    `<h2 style="font-family:${SERIF};font-size:22pt;color:${accent};font-weight:600;letter-spacing:0.03em;margin-bottom:8px;">${lang ? "Terima Kasih" : "Thank You"}</h2>`,
    divider("&#10022;"),
    `<div style="max-width:3.2in;margin:6px auto;">${closingHtml}</div>`,
  ]
  if (rsvpNote) {
    p4.push(thinDivider("&middot;"))
    p4.push(`<p style="font-family:${SANS};font-size:7.5pt;color:${accent};opacity:0.58;letter-spacing:0.04em;margin:4px 0;">${esc(rsvpNote)}</p>`)
  }
  if (contacts.length > 0) {
    p4.push(thinDivider("&#10022;"))
    p4.push(`<p style="font-family:${SANS};font-size:6.5pt;letter-spacing:0.35em;color:${accent};text-transform:uppercase;opacity:0.48;margin-bottom:5px;">${lang ? "HUBUNGI" : "CONTACT"}</p>`)
    p4.push(contactsHtml)
  }
  p4.push(thinDivider("&middot;"))
  p4.push(
    `<div style="margin-top:6px;">` +
    `<p style="font-family:${SANS};font-size:6.5pt;letter-spacing:0.2em;color:${accent};text-transform:uppercase;opacity:0.42;margin-bottom:3px;">${lang ? "KAD DIGITAL" : "DIGITAL CARD"}</p>` +
    `<p style="font-family:${SANS};font-size:8pt;color:${accent};opacity:0.58;">e-kadku.com/invite/${esc(card.slug)}</p>` +
    `</div>`
  )

  const page4 =
    `<div style="${pgStyle}">` +
    watermark + frame +
    `<div style="${centerCol}">${p4.join("")}</div>` +
    `<p style="position:absolute;bottom:26px;left:0;right:0;text-align:center;font-family:${SANS};font-size:5.5pt;color:${accent};opacity:0.22;letter-spacing:0.25em;text-transform:uppercase;">e-kad ku &nbsp;&middot;&nbsp; kad jemputan digital</p>` +
    `</div>`

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
<div class="pw">${page1}</div>
<div class="pw">${page2}</div>
<div class="pw">${page3}</div>
<div class="pw">${page4}</div>
</body>
</html>`
}
