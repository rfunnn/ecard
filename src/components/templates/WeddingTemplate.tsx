"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Navigation, Calendar } from "lucide-react"
import type { InvitationCardData } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"

// â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { wizardFont, calendarUrl, parseProgramText, useCountdown, multiLine } from "./templateUtils"
import { PhotoGallery } from "./PhotoGallery"

interface WishEntry { guestName: string; message: string }

// â”€â”€â”€ component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function WeddingDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-5">
      <div className="h-px flex-1 opacity-15" style={{ background: color }} />
      <svg width="10" height="10" viewBox="0 0 20 20" fill={color} opacity="0.25">
        <circle cx="10" cy="10" r="3" />
        <path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke={color} strokeWidth="1.2" fill="none" />
      </svg>
      <div className="h-px flex-1 opacity-15" style={{ background: color }} />
    </div>
  )
}

interface Props { card: InvitationCardData; onRsvpOpen?: () => void; previewPage?: number }

export function WeddingTemplate({ card, onRsvpOpen, previewPage: p }: Props) {
  const cfg = card.wizardConfig as WizardConfig | undefined
  const { theme } = card

  // segments â€” default everything on when no wizard config
  const seg = cfg?.segments ?? {
    venue: true, date: true, time: true, endTime: true,
    saveDateBtn: true, eventProgram: true, countdown: true,
    attendance: true, wishes: true, confirmBtn: true, writeWishBtn: true,
    photoGallery: true,
  }

  // names â€” wizard Page 2 stores combined "displayName" (e.g. "Ahmad & Nurul")
  const displayParts = cfg?.displayName
    ? cfg.displayName.split(/\s*&\s*/).map((s) => s.trim()).filter(Boolean)
    : [card.groomName ?? "", card.brideName ?? ""].filter(Boolean)
  const groomName = displayParts[0] ?? ""
  const brideName = displayParts[1] ?? ""

  // dates
  const startDT = cfg?.startDateTime ? new Date(cfg.startDateTime)
    : card.eventDate ? new Date(card.eventDate) : null
  const endDT = cfg?.endDateTime ? new Date(cfg.endDateTime) : null
  const eventPassed = startDT ? startDT < new Date() : false

  // countdown
  const countdown = useCountdown(cfg?.startDateTime ?? card.eventDate ?? "")

  // wishes
  const [wishes, setWishes] = useState<WishEntry[]>([])
  useEffect(() => {
    if (!seg.wishes || !card.isPublished || !card.slug) return
    fetch(`/api/rsvp/${card.slug}`)
      .then((r) => r.json())
      .then((d) => setWishes(
        (d.rsvps ?? []).filter((r: { message?: string }) => r.message?.trim())
      ))
      .catch(() => {})
  }, [card.slug, card.isPublished, seg.wishes])

  // venue / navigation
  const venueName  = cfg?.venueLine    || card.venueName   || ""
  const address    = cfg?.venueAddress || card.venueAddress || ""
  const mapsUrl    = cfg?.googleMapsUrl || card.venueMapUrl || ""
  const wazeUrl    = cfg?.wazeUrl || ""

  // colours + fonts
  const bodyColor    = cfg?.generalColor || theme.bodyColor    || "#3a2010"
  const primaryColor = theme.primaryColor || "#8B6914"
  const bodyFont     = wizardFont(cfg?.generalFont)
  const headFont     = wizardFont(cfg?.headingFont  ?? cfg?.generalFont)
  const displayFont  = wizardFont(cfg?.displayNameFont)
  const displayColor = cfg?.displayNameColor || theme.titleColor || primaryColor
  const orgFont      = wizardFont(cfg?.organizerFont)
  const fullNFont    = wizardFont(cfg?.fullNamesFont)

  // common sizes
  const bodySize    = cfg?.generalSize     ?? 14
  const displaySize = cfg?.displayNameSize ?? 52
  const orgSize     = cfg?.organizerSize   ?? 20
  const fullNSize   = cfg?.fullNamesSize   ?? 22
  const sideMargin  = cfg?.sideMargin      ?? 1.25

  // locale
  const locale = card.language === "ms" ? "ms-MY" : "en-MY"
  const formatDate = (d: Date) =>
    d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })

  // Section visibility — when previewPage is set only the relevant sections render.
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

      {/* â•â• SECTION 1 Â· COVER (Config Page 2) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {showCover && <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="min-h-screen flex flex-col items-center justify-center text-center py-10"
      >
        {/* event type */}
        {(cfg?.eventType || card.subtitle) && (
          <p
            className={`${headFont} uppercase tracking-[0.4em] mb-6 opacity-75`}
            style={{ color: bodyColor, fontSize: `${cfg?.eventTypeSize ?? 13}px`, whiteSpace: "pre-line" }}
          >
            {cfg?.eventType || card.subtitle}
          </p>
        )}

        {/* names */}
        <div className="mb-6">
          {groomName && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className={`${displayFont} leading-none`}
              style={{ fontSize: `${displaySize}px`, color: displayColor }}
            >
              {groomName}
            </motion.div>
          )}
          {(groomName || brideName) && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className={`${bodyFont} my-4 opacity-40`}
              style={{ color: bodyColor, fontSize: "22px" }}
            >
              &amp;
            </motion.div>
          )}
          {brideName && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className={`${displayFont} leading-none`}
              style={{ fontSize: `${displaySize}px`, color: displayColor }}
            >
              {brideName}
            </motion.div>
          )}
        </div>

        {/* day & date text */}
        {cfg?.dayAndDate && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className={`${bodyFont} mt-6 opacity-70`}
            style={{ color: bodyColor, fontSize: `${cfg.dayAndDateSize ?? 18}px`, whiteSpace: "pre-line" }}
          >
            {cfg.dayAndDate}
          </motion.p>
        )}

        {/* venue line */}
        {venueName && (
          <p
            className={`${bodyFont} mt-3 opacity-45`}
            style={{ color: bodyColor, fontSize: `${cfg?.venueLineSize ?? 13}px`, whiteSpace: "pre-line" }}
          >
            {venueName}
          </p>
        )}
      </motion.div>}

      {/* â•â• SECTION 2 Â· INVITATION TEXT (Config Page 3) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {showInvitation && (cfg?.openingSpeech || cfg?.organizer1?.name || card.description || cfg?.fullNames) && (
        <div className="pb-3 text-center">
          <WeddingDivider color={bodyColor} />

          {/* opening speech / bismillah */}
          {cfg?.openingSpeech && (
            <div
              className={`${orgFont} leading-relaxed mb-5 opacity-80`}
              style={{ color: bodyColor, fontSize: `${orgSize}px` }}
            >
              {multiLine(cfg.openingSpeech)}
            </div>
          )}

          {/* organizers */}
          {cfg?.organizer1?.name && (
            <div className="mb-4 space-y-1">
              <p className={`${orgFont}`} style={{ color: bodyColor, fontSize: `${orgSize}px` }}>
                {cfg.organizer1.name}
              </p>
              {cfg.organizer1.relationship && (
                <p className={`${bodyFont} text-xs opacity-50`} style={{ color: bodyColor }}>
                  {cfg.organizer1.relationship}
                </p>
              )}
              {cfg.organizerCount === 2 && cfg.organizer2?.name && (
                <>
                  <p className={`${bodyFont} opacity-35 pt-1`} style={{ color: bodyColor, fontSize: "16px" }}>
                    &amp;
                  </p>
                  <p className={`${orgFont}`} style={{ color: bodyColor, fontSize: `${orgSize}px` }}>
                    {cfg.organizer2.name}
                  </p>
                  {cfg.organizer2.relationship && (
                    <p className={`${bodyFont} text-xs opacity-50`} style={{ color: bodyColor }}>
                      {cfg.organizer2.relationship}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* invitation speech */}
          {(cfg?.invitationSpeech || card.description) && (
            <div
              className={`${bodyFont} leading-relaxed mb-4 opacity-70 italic`}
              style={{ color: bodyColor, fontSize: `${bodySize}px` }}
            >
              {multiLine(cfg?.invitationSpeech || card.description || "")}
            </div>
          )}

          {/* full names */}
          {cfg?.fullNames && (
            <div
              className={`${fullNFont} my-4 leading-snug`}
              style={{ color: displayColor, fontSize: `${fullNSize}px` }}
            >
              {multiLine(cfg.fullNames)}
            </div>
          )}
        </div>
      )}

      {/* â•â• SECTION 3 Â· VENUE + DATE + DRESS CODE (Config Page 4) â•â•â•â•â•â•â• */}
      {showVenueDate && (seg.venue || seg.date) && (venueName || address || startDT) && (
        <div className="pb-4 text-center">
          <WeddingDivider color={bodyColor} />

          {/* TEMPAT */}
          {seg.venue && (venueName || address) && (
            <div className="mb-5">
              <p
                className={`${headFont} text-[10px] tracking-[0.35em] uppercase opacity-45 mb-2`}
                style={{ color: bodyColor }}
              >
                Tempat
              </p>
              {venueName && (
                <p className={`${orgFont} text-lg`} style={{ color: bodyColor, whiteSpace: "pre-line" }}>
                  {venueName}
                </p>
              )}
              {address && (
                <div
                  className={`${bodyFont} text-xs opacity-55 mt-2 leading-relaxed`}
                  style={{ color: bodyColor, fontSize: `${Math.max(bodySize - 2, 11)}px` }}
                >
                  {multiLine(address)}
                </div>
              )}

              {/* map / waze buttons */}
              {(mapsUrl || wazeUrl) && (
                <div className="flex justify-center gap-2 mt-4">
                  {mapsUrl && (
                    <a
                      href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className={`${bodyFont} inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border opacity-65 hover:opacity-100 transition-opacity`}
                      style={{ color: bodyColor, borderColor: `${bodyColor}35` }}
                    >
                      <MapPin className="w-3 h-3" />
                      Google Maps
                    </a>
                  )}
                  {wazeUrl && (
                    <a
                      href={wazeUrl} target="_blank" rel="noopener noreferrer"
                      className={`${bodyFont} inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border opacity-65 hover:opacity-100 transition-opacity`}
                      style={{ color: bodyColor, borderColor: `${bodyColor}35` }}
                    >
                      <Navigation className="w-3 h-3" />
                      Waze
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TARIKH */}
          {seg.date && startDT && (
            <div className="mb-5">
              <p
                className={`${headFont} text-[10px] tracking-[0.35em] uppercase opacity-45 mb-2`}
                style={{ color: bodyColor }}
              >
                Tarikh
              </p>
              <p className={`${bodyFont} text-sm opacity-80`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
                {formatDate(startDT)}
              </p>
              {seg.time && (
                <p className={`${bodyFont} text-sm opacity-65 mt-1`} style={{ color: bodyColor, fontSize: `${bodySize}px` }}>
                  {formatTime(startDT)}
                  {seg.endTime && endDT && ` â€“ ${formatTime(endDT)}`}
                </p>
              )}
              {cfg?.hijriDate && (
                <p className={`${bodyFont} text-xs opacity-45 mt-1`} style={{ color: bodyColor }}>
                  {cfg.hijriDate}
                </p>
              )}
            </div>
          )}

          {/* additionalInfo1 â€” dress code / extra info */}
          {cfg?.additionalInfo1 && (
            <div
              className={`${bodyFont} text-sm opacity-65 mb-4 leading-relaxed`}
              style={{ color: bodyColor, fontSize: `${bodySize}px` }}
            >
              {multiLine(cfg.additionalInfo1)}
            </div>
          )}

          {/* Simpan Tarikh button */}
          {seg.saveDateBtn && cfg?.startDateTime && (
            <a
              href={calendarUrl(cfg, address || venueName)}
              target="_blank" rel="noopener noreferrer"
              className={`${bodyFont} inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium mt-2 transition-opacity opacity-75 hover:opacity-100`}
              style={{ background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}35` }}
            >
              <Calendar className="w-3.5 h-3.5" />
              Simpan Tarikh
            </a>
          )}
        </div>
      )}

      {/* â•â• SECTION 4 Â· EVENT PROGRAM (Config Page 5) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {showProgramme && seg.eventProgram && cfg?.eventProgram && (
        <div className="pb-4">
          <WeddingDivider color={bodyColor} />
          <p
            className={`${headFont} text-[10px] tracking-[0.35em] uppercase opacity-45 text-center mb-4`}
            style={{ color: bodyColor }}
          >
            Atur Cara Majlis
          </p>
          <div className="space-y-3 max-w-xs mx-auto">
            {parseProgramText(cfg.eventProgram).map((item, i) => (
              <div key={i} className="flex justify-between items-baseline gap-3">
                <span
                  className={`${bodyFont} opacity-75`}
                  style={{ color: bodyColor, fontSize: `${bodySize}px` }}
                >
                  {item.label}
                </span>
                <span
                  className={`${bodyFont} opacity-50 text-right shrink-0`}
                  style={{ color: bodyColor, fontSize: `${Math.max(bodySize - 1, 12)}px` }}
                >
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â•â• SECTION 5 Â· PRAYER + COUNTDOWN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {showCountdown && (cfg?.additionalInfo2 || (seg.countdown && cfg?.startDateTime && !eventPassed)) && (
        <div className="pb-4 text-center">
          <WeddingDivider color={bodyColor} />

          {/* prayer / dua */}
          {cfg?.additionalInfo2 && (
            <div
              className={`${orgFont} leading-relaxed mb-6 opacity-70 italic`}
              style={{ color: bodyColor, fontSize: `${orgSize - 2}px` }}
            >
              {multiLine(cfg.additionalInfo2)}
            </div>
          )}

          {/* countdown */}
          {seg.countdown && cfg?.startDateTime && !eventPassed && (
            <div>
              <p
                className={`${headFont} text-[10px] tracking-[0.35em] uppercase opacity-45 mb-4`}
                style={{ color: bodyColor }}
              >
                Menghitung Hari
              </p>
              <div className="flex items-start justify-center gap-4">
                {([
                  { val: countdown.d, label: card.language === "ms" ? "Hari"  : "Days"    },
                  { val: countdown.h, label: card.language === "ms" ? "Jam"   : "Hours"   },
                  { val: countdown.m, label: card.language === "ms" ? "Minit" : "Minutes" },
                  { val: countdown.s, label: card.language === "ms" ? "Saat"  : "Seconds" },
                ] as const).map(({ val, label }, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[2.5rem]">
                    <span
                      className={`${headFont} text-2xl font-bold leading-none`}
                      style={{ color: primaryColor }}
                    >
                      {String(val).padStart(2, "0")}
                    </span>
                    <span
                      className={`${bodyFont} text-[10px] uppercase tracking-wider opacity-45 mt-1.5`}
                      style={{ color: bodyColor }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* â•â• SECTION 6 Â· WISHES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* ══ KEHADIRAN CTA ════════════════════════════════════════════════════ */}
      {showAttendance && seg.attendance && (
        <div className="pb-4 text-center">
          <WeddingDivider color={bodyColor} />
          <p
            className={`${headFont} text-[10px] tracking-[0.35em] uppercase opacity-45 mb-6`}
            style={{ color: bodyColor }}
          >
            {card.language === "ms" ? "Kehadiran" : "Attendance"}
          </p>
          <div className="flex flex-col items-center gap-3">
            {seg.confirmBtn && (
              <button
                onClick={onRsvpOpen}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
                style={{ border: `1px solid ${primaryColor}70`, color: primaryColor }}
              >
                {card.language === "ms" ? "Sahkan Kehadiran" : "Confirm Attendance"}
              </button>
            )}
            {seg.writeWishBtn && (
              <button
                onClick={onRsvpOpen}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm transition-all active:scale-95 opacity-70"
                style={{ border: `1px solid ${bodyColor}40`, color: bodyColor }}
              >
                {card.language === "ms" ? "Tulis Ucapan" : "Write a Wish"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ UCAPAN WALL ══════════════════════════════════════════════════════ */}
      {showAttendance && seg.wishes && wishes.length > 0 && (
        <div className="pb-4 text-center">
          <WeddingDivider color={bodyColor} />
          <p
            className={`${headFont} text-[10px] tracking-[0.35em] uppercase opacity-45 mb-5`}
            style={{ color: bodyColor }}
          >
            {card.language === "ms" ? "Ucapan" : "Wishes"}
          </p>
          <div className="space-y-5 max-w-sm mx-auto">
            {wishes.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <p className={`${orgFont} text-base mb-1`} style={{ color: displayColor }}>
                  {w.guestName}
                </p>
                <p
                  className={`${bodyFont} text-sm opacity-60 italic leading-relaxed`}
                  style={{ color: bodyColor, fontSize: `${bodySize}px` }}
                >
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
          <WeddingDivider color={bodyColor} />
          <PhotoGallery
            photos={card.photoItems}
            bodyColor={bodyColor}
            headFont={headFont}
            bodyFont={bodyFont}
            isMs={card.language === "ms"}
          />
        </div>
      )}

      {/* footer spacer clears action bar */}
      <div className="h-20" />
    </div>
  )
}
