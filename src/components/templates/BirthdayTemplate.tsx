"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Navigation, Calendar } from "lucide-react"
import type { InvitationCardData } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { wizardFont, calendarUrl, parseProgramText, useCountdown, multiLine } from "./templateUtils"
import { PhotoGallery } from "./PhotoGallery"

interface WishEntry { guestName: string; message: string }

function BirthdayDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      <div className="h-px flex-1" style={{ background: `${color}30` }} />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-full" style={{ width: i === 1 ? "8px" : "5px", height: i === 1 ? "8px" : "5px", background: color, opacity: i === 1 ? 0.7 : 0.3 }} />
        ))}
      </div>
      <div className="h-px flex-1" style={{ background: `${color}30` }} />
    </div>
  )
}

interface Props { card: InvitationCardData; onRsvpOpen?: () => void; previewPage?: number }

export function BirthdayTemplate({ card, onRsvpOpen, previewPage: p }: Props) {
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

  const bodyColor    = cfg?.generalColor || theme.bodyColor    || "#1a1a2e"
  const primaryColor = theme.primaryColor || "#7c3aed"
  const bodyFont     = wizardFont(cfg?.generalFont)
  const headFont     = wizardFont(cfg?.headingFont ?? cfg?.generalFont)
  const displayFont  = wizardFont(cfg?.displayNameFont)
  const displayColor = cfg?.displayNameColor || theme.titleColor || primaryColor
  const orgFont      = wizardFont(cfg?.organizerFont)
  const fullNFont    = wizardFont(cfg?.fullNamesFont)

  const bodySize    = cfg?.generalSize     ?? 14
  const displaySize = cfg?.displayNameSize ?? 48
  const orgSize     = cfg?.organizerSize   ?? 18
  const fullNSize   = cfg?.fullNamesSize   ?? 20
  const sideMargin  = cfg?.sideMargin      ?? 1.25

  const locale = card.language === "ms" ? "ms-MY" : "en-MY"
  const isMs = card.language === "ms"
  const formatDate = (d: Date) =>
    d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })

  const all          = !p || p === 12
  const showCover      = all || [1, 2, 6, 8, 9, 10].includes(p!)
  const showInvitation = all || p === 3
  const showVenueDate  = all || p === 4
  const showProgramme  = all || p === 5
  const showCountdown  = all || p === 5
  const showAttendance = all || p === 7
  const showPhotos     = all || p === 11

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ paddingLeft: `${sideMargin}rem`, paddingRight: `${sideMargin}rem` }}>

      {/* ══ COVER (Page 2) ══════════════════════════════════════════════════ */}
      {showCover && <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="min-h-screen flex flex-col items-center justify-center text-center py-16"
      >
        {/* event type */}
        {(cfg?.eventType || card.subtitle) && (
          <p
            className={`${headFont} uppercase tracking-[0.3em] mb-8 opacity-70`}
            style={{ color: bodyColor, fontSize: `${cfg?.eventTypeSize ?? 13}px`, whiteSpace: "pre-line" }}
          >
            {cfg?.eventType || card.subtitle}
          </p>
        )}

        {/* primary name */}
        {primaryName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`${displayFont} leading-none mb-2`}
            style={{ fontSize: `${displaySize}px`, color: displayColor }}
          >
            {primaryName}
          </motion.div>
        )}
        {secondaryName && (
          <>
            <p className={`${bodyFont} my-3 opacity-40`} style={{ color: bodyColor, fontSize: "20px" }}>
              &amp;
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className={`${displayFont} leading-none`}
              style={{ fontSize: `${displaySize}px`, color: displayColor }}
            >
              {secondaryName}
            </motion.div>
          </>
        )}

        {/* day & date */}
        {cfg?.dayAndDate && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className={`${bodyFont} mt-7 opacity-65`}
            style={{ color: bodyColor, fontSize: `${cfg.dayAndDateSize ?? 18}px`, whiteSpace: "pre-line" }}
          >
            {cfg.dayAndDate}
          </motion.p>
        )}

        {/* venue line */}
        {venueName && (
          <p className={`${bodyFont} mt-2 opacity-40`} style={{ color: bodyColor, fontSize: `${cfg?.venueLineSize ?? 13}px`, whiteSpace: "pre-line" }}>
            {venueName}
          </p>
        )}
      </motion.div>}

      {showInvitation && (cfg?.openingSpeech || cfg?.organizer1?.name || card.description || cfg?.fullNames) && (
        <div className="pb-4 text-center">
          <BirthdayDivider color={primaryColor} />

          {cfg?.openingSpeech && (
            <div className={`${orgFont} leading-relaxed mb-8 opacity-80`} style={{ color: bodyColor, fontSize: `${orgSize}px` }}>
              {multiLine(cfg.openingSpeech)}
            </div>
          )}

          {cfg?.organizer1?.name && (
            <div className="mb-6 space-y-1">
              <p className={`${orgFont}`} style={{ color: bodyColor, fontSize: `${orgSize}px` }}>{cfg.organizer1.name}</p>
              {cfg.organizer1.relationship && (
                <p className={`${bodyFont} text-xs opacity-50`} style={{ color: bodyColor }}>{cfg.organizer1.relationship}</p>
              )}
              {cfg.organizerCount === 2 && cfg.organizer2?.name && (
                <>
                  <p className={`${bodyFont} opacity-30 pt-1`} style={{ color: bodyColor, fontSize: "16px" }}>&amp;</p>
                  <p className={`${orgFont}`} style={{ color: bodyColor, fontSize: `${orgSize}px` }}>{cfg.organizer2.name}</p>
                  {cfg.organizer2.relationship && (
                    <p className={`${bodyFont} text-xs opacity-50`} style={{ color: bodyColor }}>{cfg.organizer2.relationship}</p>
                  )}
                </>
              )}
            </div>
          )}

          {(cfg?.invitationSpeech || card.description) && (
            <div className={`${bodyFont} leading-relaxed mb-6 opacity-70 italic`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
              {multiLine(cfg?.invitationSpeech || card.description || "")}
            </div>
          )}

          {cfg?.fullNames && (
            <div className={`${fullNFont} my-6 leading-snug`} style={{ color: displayColor, fontSize: `${fullNSize}px` }}>
              {multiLine(cfg.fullNames)}
            </div>
          )}
        </div>
      )}

      {/* ══ VENUE + DATE (Page 4) ══════════════════════════════════════════ */}
      {showVenueDate && (seg.venue || seg.date) && (venueName || address || startDT) && (
        <div className="pb-6 text-center">
          <BirthdayDivider color={primaryColor} />

          {seg.venue && (venueName || address) && (
            <div className="mb-8">
              <p className={`${headFont} text-[11px] tracking-[0.3em] uppercase opacity-40 mb-3`} style={{ color: bodyColor }}>
                {isMs ? "Tempat" : "Venue"}
              </p>
              {venueName && <p className={`${orgFont} text-lg`} style={{ color: bodyColor, whiteSpace: "pre-line" }}>{venueName}</p>}
              {address && (
                <div className={`${bodyFont} text-xs opacity-55 mt-2 leading-relaxed`} style={{ color: bodyColor, fontSize: `${Math.max(bodySize - 2, 11)}px` }}>
                  {multiLine(address)}
                </div>
              )}
              {(mapsUrl || wazeUrl) && (
                <div className="flex justify-center gap-2 mt-4">
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className={`${bodyFont} inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border opacity-65 hover:opacity-100 transition-opacity`}
                      style={{ color: bodyColor, borderColor: `${bodyColor}35` }}>
                      <MapPin className="w-3 h-3" /> Google Maps
                    </a>
                  )}
                  {wazeUrl && (
                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
                      className={`${bodyFont} inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border opacity-65 hover:opacity-100 transition-opacity`}
                      style={{ color: bodyColor, borderColor: `${bodyColor}35` }}>
                      <Navigation className="w-3 h-3" /> Waze
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {seg.date && startDT && (
            <div className="mb-8">
              <p className={`${headFont} text-[11px] tracking-[0.3em] uppercase opacity-40 mb-3`} style={{ color: bodyColor }}>
                {isMs ? "Tarikh" : "Date"}
              </p>
              <p className={`${bodyFont} text-sm opacity-80`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
                {formatDate(startDT)}
              </p>
              {seg.time && (
                <p className={`${bodyFont} text-sm opacity-65 mt-1`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
                  {formatTime(startDT)}
                  {seg.endTime && endDT && ` – ${formatTime(endDT)}`}
                </p>
              )}
              {cfg?.hijriDate && (
                <p className={`${bodyFont} text-xs opacity-45 mt-1`} style={{ color: bodyColor }}>{cfg.hijriDate}</p>
              )}
            </div>
          )}

          {cfg?.additionalInfo1 && (
            <div className={`${bodyFont} text-sm opacity-65 mb-6 leading-relaxed`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
              {multiLine(cfg.additionalInfo1)}
            </div>
          )}

          {seg.saveDateBtn && cfg?.startDateTime && (
            <a href={calendarUrl(cfg, address || venueName)} target="_blank" rel="noopener noreferrer"
              className={`${bodyFont} inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium mt-2 transition-opacity opacity-75 hover:opacity-100`}
              style={{ background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}35` }}>
              <Calendar className="w-3.5 h-3.5" />
              {isMs ? "Simpan Tarikh" : "Save Date"}
            </a>
          )}
        </div>
      )}

      {/* ══ EVENT PROGRAM (Page 5) ══════════════════════════════════════════ */}
      {showProgramme && seg.eventProgram && cfg?.eventProgram && (
        <div className="pb-6">
          <BirthdayDivider color={primaryColor} />
          <p className={`${headFont} text-[11px] tracking-[0.3em] uppercase opacity-40 text-center mb-6`} style={{ color: bodyColor }}>
            {isMs ? "Atur Cara" : "Programme"}
          </p>
          <div className="space-y-4 max-w-xs mx-auto">
            {parseProgramText(cfg.eventProgram).map((item, i) => (
              <div key={i} className="flex justify-between items-baseline gap-3">
                <span className={`${bodyFont} opacity-75`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>{item.label}</span>
                <span className={`${bodyFont} opacity-50 text-right shrink-0`} style={{ color: bodyColor, fontSize: `${Math.max(bodySize - 1, 12)}px` }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ COUNTDOWN (Page 5 extra) ══════════════════════════════════════════ */}
      {showCountdown && (cfg?.additionalInfo2 || (seg.countdown && cfg?.startDateTime && !eventPassed)) && (
        <div className="pb-6 text-center">
          <BirthdayDivider color={primaryColor} />

          {cfg?.additionalInfo2 && (
            <div className={`${orgFont} leading-relaxed mb-10 opacity-70 italic`} style={{ color: bodyColor, fontSize: `${orgSize - 2}px` }}>
              {multiLine(cfg.additionalInfo2)}
            </div>
          )}

          {seg.countdown && cfg?.startDateTime && !eventPassed && (
            <div>
              <p className={`${headFont} text-[11px] tracking-[0.3em] uppercase opacity-40 mb-6`} style={{ color: bodyColor }}>
                {isMs ? "Menghitung Hari" : "Countdown"}
              </p>
              <div className="flex items-start justify-center gap-5">
                {([
                  { val: countdown.d, label: isMs ? "Hari"  : "Days"    },
                  { val: countdown.h, label: isMs ? "Jam"   : "Hours"   },
                  { val: countdown.m, label: isMs ? "Minit" : "Minutes" },
                  { val: countdown.s, label: isMs ? "Saat"  : "Seconds" },
                ] as const).map(({ val, label }, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[2.5rem]">
                    <span className={`${headFont} text-3xl font-bold leading-none`} style={{ color: primaryColor }}>
                      {String(val).padStart(2, "0")}
                    </span>
                    <span className={`${bodyFont} text-[10px] uppercase tracking-wider opacity-40 mt-1.5`} style={{ color: bodyColor }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ KEHADIRAN CTA ════════════════════════════════════════════════════ */}
      {showAttendance && seg.attendance && (
        <div className="pb-4 text-center">
          <BirthdayDivider color={primaryColor} />
          <p className={`${headFont} text-[11px] tracking-[0.3em] uppercase opacity-40 mb-6`} style={{ color: bodyColor }}>
            {isMs ? "Kehadiran" : "Attendance"}
          </p>
          <div className="flex flex-col items-center gap-3">
            {seg.confirmBtn && (
              <button
                onClick={onRsvpOpen}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
                style={{ border: `1px solid ${primaryColor}70`, color: primaryColor }}
              >
                {isMs ? "Sahkan Kehadiran" : "Confirm Attendance"}
              </button>
            )}
            {seg.writeWishBtn && (
              <button
                onClick={onRsvpOpen}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm transition-all active:scale-95 opacity-70"
                style={{ border: `1px solid ${bodyColor}40`, color: bodyColor }}
              >
                {isMs ? "Tulis Ucapan" : "Write a Wish"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ UCAPAN WALL ══════════════════════════════════════════════════════ */}
      {showAttendance && seg.wishes && wishes.length > 0 && (
        <div className="pb-6 text-center">
          <BirthdayDivider color={primaryColor} />
          <p className={`${headFont} text-[11px] tracking-[0.3em] uppercase opacity-40 mb-8`} style={{ color: bodyColor }}>
            {isMs ? "Ucapan" : "Wishes"}
          </p>
          <div className="space-y-7 max-w-sm mx-auto">
            {wishes.map((w, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <p className={`${orgFont} text-base mb-1`} style={{ color: displayColor }}>{w.guestName}</p>
                <p className={`${bodyFont} text-sm opacity-60 italic leading-relaxed`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
                  &ldquo;{w.message}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ══ PHOTO GALLERY ════════════════════════════════════════════════════ */}
      {showPhotos && seg.photoGallery && card.photoItems?.length > 0 && (
        <div className="pb-6 text-center px-2">
          <BirthdayDivider color={primaryColor} />
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
