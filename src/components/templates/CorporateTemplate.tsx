"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Navigation, Calendar, Building2 } from "lucide-react"
import type { InvitationCardData } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { wizardFont, calendarUrl, parseProgramText, useCountdown, multiLine } from "./templateUtils"
import { PhotoGallery } from "./PhotoGallery"

interface WishEntry { guestName: string; message: string }

function CorporateRule({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1" style={{ background: `${color}20` }} />
      <div className="w-1.5 h-1.5 rotate-45" style={{ background: color, opacity: 0.4 }} />
      <div className="h-px flex-1" style={{ background: `${color}20` }} />
    </div>
  )
}

interface Props { card: InvitationCardData }

export function CorporateTemplate({ card }: Props) {
  const cfg = card.wizardConfig as WizardConfig | undefined
  const { theme } = card

  const seg = cfg?.segments ?? {
    venue: true, date: true, time: true, endTime: true,
    saveDateBtn: true, eventProgram: true, countdown: true,
    attendance: true, wishes: true, confirmBtn: true, writeWishBtn: true,
    photoGallery: true,
  }

  const displayParts = cfg?.displayName
    ? cfg.displayName.split(/\s*&\s*/).map((s) => s.trim()).filter(Boolean)
    : [card.groomName ?? "", card.brideName ?? ""].filter(Boolean)
  const primaryName = displayParts[0] ?? card.title ?? ""
  const secondaryName = displayParts[1] ?? ""

  const startDT = cfg?.startDateTime ? new Date(cfg.startDateTime)
    : card.eventDate ? new Date(card.eventDate) : null
  const endDT = cfg?.endDateTime ? new Date(cfg.endDateTime) : null
  const eventPassed = startDT ? startDT < new Date() : false

  const countdown = useCountdown(cfg?.startDateTime ?? card.eventDate ?? "")

  const [wishes, setWishes] = useState<WishEntry[]>([])
  useState(() => {
    if (!seg.wishes || !card.isPublished || !card.slug) return
    fetch(`/api/rsvp/${card.slug}`)
      .then((r) => r.json())
      .then((d) => setWishes(
        (d.rsvps ?? []).filter((r: { message?: string }) => r.message?.trim())
      ))
      .catch(() => {})
  })

  const venueName  = cfg?.venueLine    || card.venueName   || ""
  const address    = cfg?.venueAddress || card.venueAddress || ""
  const mapsUrl    = cfg?.googleMapsUrl || card.venueMapUrl || ""
  const wazeUrl    = cfg?.wazeUrl || ""

  const bodyColor    = cfg?.generalColor || theme.bodyColor    || "#1e293b"
  const primaryColor = theme.primaryColor || "#0f172a"
  const bodyFont     = wizardFont(cfg?.generalFont)
  const headFont     = wizardFont(cfg?.headingFont ?? cfg?.generalFont)
  const displayFont  = wizardFont(cfg?.displayNameFont)
  const displayColor = cfg?.displayNameColor || theme.titleColor || primaryColor
  const orgFont      = wizardFont(cfg?.organizerFont)
  const fullNFont    = wizardFont(cfg?.fullNamesFont)

  const bodySize    = cfg?.generalSize     ?? 14
  const displaySize = cfg?.displayNameSize ?? 36
  const orgSize     = cfg?.organizerSize   ?? 16
  const fullNSize   = cfg?.fullNamesSize   ?? 18
  const sideMargin  = cfg?.sideMargin      ?? 1.25

  const locale = card.language === "ms" ? "ms-MY" : "en-MY"
  const isMs = card.language === "ms"
  const formatDate = (d: Date) =>
    d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ paddingLeft: `${sideMargin}rem`, paddingRight: `${sideMargin}rem` }}>
      {/* top accent bar */}
      <div className="h-1 w-full" style={{ background: primaryColor }} />

      {/* ══ COVER (Page 2) ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen flex flex-col justify-center py-16"
      >
        <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-lg"
          style={{ background: `${primaryColor}12`, border: `1px solid ${primaryColor}20` }}>
          <Building2 className="w-5 h-5" style={{ color: primaryColor }} />
        </div>

        {(cfg?.eventType || card.subtitle) && (
          <p
            className={`${headFont} text-[11px] uppercase tracking-[0.4em] mb-4 opacity-50`}
            style={{ color: bodyColor, fontSize: `${cfg?.eventTypeSize ?? 11}px`, whiteSpace: "pre-line" }}
          >
            {cfg?.eventType || card.subtitle}
          </p>
        )}

        {primaryName && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className={`${displayFont} leading-tight mb-2`}
            style={{ fontSize: `${displaySize}px`, color: displayColor }}
          >
            {primaryName}
          </motion.div>
        )}
        {secondaryName && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className={`${displayFont} leading-tight`}
            style={{ fontSize: `${displaySize}px`, color: displayColor }}
          >
            {secondaryName}
          </motion.div>
        )}

        {cfg?.dayAndDate && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={`${bodyFont} mt-6 opacity-55`}
            style={{ color: bodyColor, fontSize: `${cfg.dayAndDateSize ?? 15}px`, whiteSpace: "pre-line" }}
          >
            {cfg.dayAndDate}
          </motion.p>
        )}

        {venueName && (
          <p className={`${bodyFont} mt-1 opacity-35`} style={{ color: bodyColor, fontSize: `${cfg?.venueLineSize ?? 12}px`, whiteSpace: "pre-line" }}>
            {venueName}
          </p>
        )}
      </motion.div>

      {/* ══ INVITATION TEXT (Page 3) ════════════════════════════════════════ */}
      {(cfg?.openingSpeech || cfg?.organizer1?.name || card.description || cfg?.fullNames) && (
        <div className="pb-4">
          <CorporateRule color={primaryColor} />

          {cfg?.openingSpeech && (
            <div className={`${orgFont} leading-relaxed mb-6 opacity-75`} style={{ color: bodyColor, fontSize: `${orgSize}px` }}>
              {multiLine(cfg.openingSpeech)}
            </div>
          )}

          {cfg?.organizer1?.name && (
            <div className="mb-5 space-y-0.5">
              <p className={`${orgFont} font-semibold`} style={{ color: bodyColor, fontSize: `${orgSize}px` }}>{cfg.organizer1.name}</p>
              {cfg.organizer1.relationship && (
                <p className={`${bodyFont} text-xs opacity-45`} style={{ color: bodyColor }}>{cfg.organizer1.relationship}</p>
              )}
              {cfg.organizerCount === 2 && cfg.organizer2?.name && (
                <>
                  <p className={`${bodyFont} opacity-25 pt-1`} style={{ color: bodyColor, fontSize: "14px" }}>&</p>
                  <p className={`${orgFont} font-semibold`} style={{ color: bodyColor, fontSize: `${orgSize}px` }}>{cfg.organizer2.name}</p>
                  {cfg.organizer2.relationship && (
                    <p className={`${bodyFont} text-xs opacity-45`} style={{ color: bodyColor }}>{cfg.organizer2.relationship}</p>
                  )}
                </>
              )}
            </div>
          )}

          {(cfg?.invitationSpeech || card.description) && (
            <div className={`${bodyFont} leading-relaxed mb-6 opacity-65`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
              {multiLine(cfg?.invitationSpeech || card.description || "")}
            </div>
          )}

          {cfg?.fullNames && (
            <div className={`${fullNFont} my-5 leading-snug`} style={{ color: displayColor, fontSize: `${fullNSize}px` }}>
              {multiLine(cfg.fullNames)}
            </div>
          )}
        </div>
      )}

      {/* ══ VENUE + DATE (Page 4) ══════════════════════════════════════════ */}
      {(seg.venue || seg.date) && (venueName || address || startDT) && (
        <div className="pb-6">
          <CorporateRule color={primaryColor} />

          <div className="rounded-xl p-5 space-y-5"
            style={{ background: `${primaryColor}07`, border: `1px solid ${primaryColor}14` }}>

            {seg.venue && (venueName || address) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 opacity-50" style={{ color: primaryColor }} />
                <div className="flex-1">
                  <p className={`${headFont} text-[10px] uppercase tracking-wider opacity-40 mb-1`} style={{ color: bodyColor }}>
                    {isMs ? "Tempat" : "Venue"}
                  </p>
                  {venueName && <p className={`${orgFont} text-sm font-medium`} style={{ color: bodyColor, whiteSpace: "pre-line" }}>{venueName}</p>}
                  {address && (
                    <div className={`${bodyFont} text-xs opacity-55 mt-1 leading-relaxed`} style={{ color: bodyColor }}>
                      {multiLine(address)}
                    </div>
                  )}
                  {(mapsUrl || wazeUrl) && (
                    <div className="flex gap-2 mt-3">
                      {mapsUrl && (
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                          className={`${bodyFont} inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] border opacity-60 hover:opacity-100 transition-opacity`}
                          style={{ color: bodyColor, borderColor: `${bodyColor}30` }}>
                          <MapPin className="w-3 h-3" /> Google Maps
                        </a>
                      )}
                      {wazeUrl && (
                        <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
                          className={`${bodyFont} inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] border opacity-60 hover:opacity-100 transition-opacity`}
                          style={{ color: bodyColor, borderColor: `${bodyColor}30` }}>
                          <Navigation className="w-3 h-3" /> Waze
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {seg.date && startDT && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-0.5 shrink-0 opacity-50" style={{ color: primaryColor }} />
                <div>
                  <p className={`${headFont} text-[10px] uppercase tracking-wider opacity-40 mb-1`} style={{ color: bodyColor }}>
                    {isMs ? "Tarikh & Masa" : "Date & Time"}
                  </p>
                  <p className={`${bodyFont} text-sm`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
                    {formatDate(startDT)}
                  </p>
                  {seg.time && (
                    <p className={`${bodyFont} text-sm opacity-65`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
                      {formatTime(startDT)}
                      {seg.endTime && endDT && ` – ${formatTime(endDT)}`}
                    </p>
                  )}
                  {cfg?.hijriDate && (
                    <p className={`${bodyFont} text-xs opacity-40 mt-0.5`} style={{ color: bodyColor }}>{cfg.hijriDate}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {cfg?.additionalInfo1 && (
            <div className={`${bodyFont} text-sm opacity-60 mt-5 leading-relaxed`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
              {multiLine(cfg.additionalInfo1)}
            </div>
          )}

          {seg.saveDateBtn && cfg?.startDateTime && (
            <a href={calendarUrl(cfg, address || venueName)} target="_blank" rel="noopener noreferrer"
              className={`${bodyFont} inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium mt-4 transition-opacity opacity-70 hover:opacity-100`}
              style={{ background: `${primaryColor}12`, color: primaryColor, border: `1px solid ${primaryColor}25` }}>
              <Calendar className="w-3.5 h-3.5" />
              {isMs ? "Simpan Tarikh" : "Save to Calendar"}
            </a>
          )}
        </div>
      )}

      {/* ══ EVENT PROGRAM (Page 5) ══════════════════════════════════════════ */}
      {seg.eventProgram && cfg?.eventProgram && (
        <div className="pb-6">
          <CorporateRule color={primaryColor} />
          <p className={`${headFont} text-[10px] tracking-[0.3em] uppercase opacity-40 mb-5`} style={{ color: bodyColor }}>
            {isMs ? "Atur Cara" : "Programme"}
          </p>
          <div className="space-y-3 max-w-sm">
            {parseProgramText(cfg.eventProgram).map((item, i) => (
              <div key={i} className="flex justify-between items-baseline gap-3 border-b pb-3"
                style={{ borderColor: `${primaryColor}10` }}>
                <span className={`${bodyFont} opacity-80`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>{item.label}</span>
                <span className={`${headFont} text-xs opacity-45 shrink-0`} style={{ color: bodyColor }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ COUNTDOWN ══════════════════════════════════════════════════════ */}
      {(cfg?.additionalInfo2 || (seg.countdown && cfg?.startDateTime && !eventPassed)) && (
        <div className="pb-6 text-center">
          <CorporateRule color={primaryColor} />

          {cfg?.additionalInfo2 && (
            <div className={`${orgFont} leading-relaxed mb-8 opacity-65`} style={{ color: bodyColor, fontSize: `${orgSize - 2}px` }}>
              {multiLine(cfg.additionalInfo2)}
            </div>
          )}

          {seg.countdown && cfg?.startDateTime && !eventPassed && (
            <div>
              <p className={`${headFont} text-[10px] tracking-[0.3em] uppercase opacity-40 mb-5`} style={{ color: bodyColor }}>
                {isMs ? "Menghitung Hari" : "Countdown"}
              </p>
              <div className="flex items-start justify-center gap-6">
                {([
                  { val: countdown.d, label: isMs ? "Hari"  : "Days"    },
                  { val: countdown.h, label: isMs ? "Jam"   : "Hours"   },
                  { val: countdown.m, label: isMs ? "Minit" : "Minutes" },
                  { val: countdown.s, label: isMs ? "Saat"  : "Seconds" },
                ] as const).map(({ val, label }, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-14 h-14 flex items-center justify-center rounded-lg mb-1.5"
                      style={{ background: `${primaryColor}10`, border: `1px solid ${primaryColor}18` }}>
                      <span className={`${headFont} text-2xl font-bold`} style={{ color: primaryColor }}>
                        {String(val).padStart(2, "0")}
                      </span>
                    </div>
                    <span className={`${bodyFont} text-[10px] uppercase tracking-wider opacity-40`} style={{ color: bodyColor }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ WISHES ══════════════════════════════════════════════════════════ */}
      {seg.wishes && wishes.length > 0 && (
        <div className="pb-6">
          <CorporateRule color={primaryColor} />
          <p className={`${headFont} text-[10px] tracking-[0.3em] uppercase opacity-40 mb-6`} style={{ color: bodyColor }}>
            {isMs ? "Ucapan" : "Messages"}
          </p>
          <div className="space-y-5 max-w-sm">
            {wishes.map((w, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="p-4 rounded-lg"
                style={{ background: `${primaryColor}06`, border: `1px solid ${primaryColor}10` }}>
                <p className={`${orgFont} text-sm font-medium mb-1`} style={{ color: displayColor }}>{w.guestName}</p>
                <p className={`${bodyFont} text-xs opacity-60 italic leading-relaxed`} style={{ color: bodyColor, fontSize: `${Math.max(bodySize - 1, 12)}px` }}>
                  &ldquo;{w.message}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ══ PHOTO GALLERY ════════════════════════════════════════════════════ */}
      {seg.photoGallery && card.photoItems?.length > 0 && (
        <div className="pb-6 text-center px-2">
          <CorporateRule color={primaryColor} />
          <PhotoGallery
            photos={card.photoItems}
            bodyColor={bodyColor}
            headFont={headFont}
            bodyFont={bodyFont}
            isMs={card.language === "ms"}
          />
        </div>
      )}

      <div className="h-28" />
    </div>
  )
}
