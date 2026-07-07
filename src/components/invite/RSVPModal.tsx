"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Heart, Check, X, Calendar, Apple } from "lucide-react"
import type { InvitationCardData } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { InviteBottomSheet } from "./InviteBottomSheet"

interface FormData {
  guestName: string
  attendance: "ATTENDING" | "NOT_ATTENDING" | "MAYBE"
  guestCount: number
  message?: string
  phone?: string
}

interface RSVPModalProps {
  isOpen: boolean
  onClose: () => void
  card: InvitationCardData
  onAnalytic?: (event: string) => void
  contained?: boolean
}

// Build Google Calendar URL from card data
function buildGoogleUrl(card: InvitationCardData): string {
  const wCfg = card.wizardConfig as WizardConfig | undefined
  const fmt = (iso: string) => {
    const d = new Date(iso)
    const p = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
  }
  const title = wCfg
    ? `${wCfg.eventType || "Majlis"} – ${wCfg.displayName || card.title}`
    : card.title
  const start = wCfg?.startDateTime
    ? fmt(wCfg.startDateTime)
    : card.eventDate
    ? fmt(card.eventDate)
    : ""
  const end = wCfg?.endDateTime
    ? fmt(wCfg.endDateTime)
    : start
  const venue = wCfg?.venueAddress || wCfg?.venueLine || card.venueAddress || card.venueName || ""
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&location=${encodeURIComponent(venue)}`
}

// Build .ics file content for Apple Calendar / Outlook
function buildIcsContent(card: InvitationCardData): string {
  const wCfg = card.wizardConfig as WizardConfig | undefined
  const fmt = (iso: string) => {
    const d = new Date(iso)
    const p = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
  }
  const title = wCfg
    ? `${wCfg.eventType || "Majlis"} – ${wCfg.displayName || card.title}`
    : card.title
  const start = wCfg?.startDateTime
    ? fmt(wCfg.startDateTime)
    : card.eventDate
    ? fmt(card.eventDate)
    : fmt(new Date().toISOString())
  const end = wCfg?.endDateTime ? fmt(wCfg.endDateTime) : start
  const venue = wCfg?.venueAddress || wCfg?.venueLine || card.venueAddress || card.venueName || ""
  const uid = `${card.slug}-rsvp@ekadku.com`
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ekadku.com//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    venue ? `LOCATION:${venue}` : "",
    `URL:${typeof window !== "undefined" ? window.location.href : ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n")
}

export function RSVPModal({ isOpen, onClose, card, onAnalytic, contained }: RSVPModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedAttendance, setSubmittedAttendance] = useState<string>("")
  const [error, setError] = useState("")
  const lang = card.language === "ms"
  const { primaryColor, bgColor } = card.theme

  const wCfg = card.wizardConfig as WizardConfig | undefined
  const guestLimitPerRSVP = wCfg?.rsvp?.guestLimitPerRSVP ?? 5
  const hasEventDate = !!(wCfg?.startDateTime || card.eventDate)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { attendance: "ATTENDING", guestCount: 1 },
  })

  const attendance = watch("attendance")

  const downloadIcs = useCallback(() => {
    const content = buildIcsContent(card)
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${card.slug}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }, [card])

  async function onSubmit(data: FormData) {
    if (!data.guestName?.trim()) return
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/rsvp/${card.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, guestCount: Number(data.guestCount) || 1 }),
      })
      if (!res.ok) throw new Error()
      onAnalytic?.("RSVP_SUBMIT")
      setSubmittedAttendance(data.attendance)
      setSubmitted(true)
    } catch {
      setError(lang ? "Ralat berlaku. Cuba lagi." : "An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const showCalendar = submitted && hasEventDate && submittedAttendance !== "NOT_ATTENDING"

  const inputStyle: React.CSSProperties = {
    background: `${primaryColor}12`,
    border: `1px solid ${primaryColor}30`,
    color: primaryColor,
    borderRadius: "8px",
    padding: "8px 10px",
    width: "100%",
    fontSize: "13px",
    outline: "none",
  }

  const labelStyle: React.CSSProperties = {
    color: `${primaryColor}90`,
    fontSize: "11px",
    display: "block",
    marginBottom: "4px",
  }

  return (
    <InviteBottomSheet isOpen={isOpen} onClose={onClose} contained={contained}>
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: bgColor, border: `1px solid ${primaryColor}25` }}
      >
              {/* header */}
              <div
                className="flex items-center justify-between px-5 pt-4 pb-3"
                style={{ borderBottom: `1px solid ${primaryColor}20` }}
              >
                <p className="text-xs font-bold tracking-[0.2em]" style={{ color: primaryColor }}>
                  {lang ? "PENGESAHAN KEHADIRAN" : "RSVP"}
                </p>
                <button
                  onClick={onClose}
                  className="w-6 h-6 flex items-center justify-center rounded-full transition-opacity opacity-50 hover:opacity-100"
                  style={{ color: primaryColor }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* scrollable content */}
              <div className={`overflow-y-auto ${contained ? "max-h-[25vh]" : "max-h-[55vh]"}`}>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 px-6 text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                      style={{ background: `${primaryColor}20` }}
                    >
                      <Check className="w-7 h-7" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="text-base font-semibold mb-1" style={{ color: primaryColor }}>
                      {lang ? "Terima Kasih!" : "Thank You!"}
                    </h3>
                    <p className="text-xs mb-5" style={{ color: `${primaryColor}80` }}>
                      {lang ? "Maklum balas anda telah diterima." : "Your response has been recorded."}
                    </p>

                    {showCalendar && (
                      <div className="w-full mb-5 space-y-2">
                        <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: `${primaryColor}60` }}>
                          {lang ? "Simpan ke Kalendar" : "Add to Calendar"}
                        </p>
                        <a
                          href={buildGoogleUrl(card)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                          style={{ background: `${primaryColor}15`, border: `1px solid ${primaryColor}35`, color: primaryColor }}
                        >
                          <Calendar className="w-4 h-4" />
                          Google Calendar
                        </a>
                        <button
                          onClick={downloadIcs}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                          style={{ background: `${primaryColor}15`, border: `1px solid ${primaryColor}35`, color: primaryColor }}
                        >
                          <Apple className="w-4 h-4" />
                          {lang ? "Apple / Kalendar Lain" : "Apple / Other Calendar"}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={onClose}
                      className="px-6 py-2 rounded-full text-sm font-medium transition-all active:scale-95"
                      style={{ border: `1.5px solid ${primaryColor}50`, color: `${primaryColor}80` }}
                    >
                      {lang ? "Tutup" : "Close"}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-3">
                    <div>
                      <label style={labelStyle}>{lang ? "Nama Anda" : "Your Name"}</label>
                      <input
                        style={inputStyle}
                        placeholder={lang ? "cth: Ahmad bin Ali" : "e.g. John Smith"}
                        {...register("guestName", { required: true })}
                      />
                      {errors.guestName && (
                        <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>
                          {lang ? "Nama diperlukan" : "Name is required"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label style={labelStyle}>{lang ? "Kehadiran" : "Attendance"}</label>
                      <select style={inputStyle} {...register("attendance")}>
                        <option value="ATTENDING">{lang ? "Ya, saya hadir" : "Yes, I'll attend"}</option>
                        <option value="MAYBE">{lang ? "Mungkin hadir" : "Maybe"}</option>
                        <option value="NOT_ATTENDING">{lang ? "Tidak dapat hadir" : "Unable to attend"}</option>
                      </select>
                    </div>

                    {attendance !== "NOT_ATTENDING" && (
                      <div>
                        <label style={labelStyle}>
                          {lang ? "Bilangan Tetamu" : "Number of Guests"}
                          <span style={{ opacity: 0.6 }}> (max {guestLimitPerRSVP})</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={guestLimitPerRSVP}
                          style={inputStyle}
                          {...register("guestCount", {
                            min: { value: 1, message: lang ? "Minimum 1 tetamu" : "Minimum 1 guest" },
                            max: { value: guestLimitPerRSVP, message: lang ? `Maksimum ${guestLimitPerRSVP} tetamu` : `Maximum ${guestLimitPerRSVP} guests` },
                          })}
                        />
                        {errors.guestCount && (
                          <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>
                            {errors.guestCount.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label style={labelStyle}>{lang ? "No. WhatsApp (pilihan)" : "WhatsApp No. (optional)"}</label>
                      <input
                        style={inputStyle}
                        placeholder="+601X-XXXXXXX"
                        {...register("phone")}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>{lang ? "Ucapan (pilihan)" : "Message (optional)"}</label>
                      <textarea
                        rows={2}
                        style={{ ...inputStyle, resize: "none" }}
                        placeholder={lang ? "Selamat pengantin baru!" : "Congratulations!"}
                        {...register("message")}
                      />
                    </div>

                    {error && (
                      <p className="text-[11px] text-center" style={{ color: "#ef4444" }}>{error}</p>
                    )}

                    <div className="flex gap-2 pt-1 pb-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 rounded-full text-sm transition-all active:scale-95"
                        style={{ border: `1px solid ${primaryColor}35`, color: `${primaryColor}80` }}
                      >
                        {lang ? "Batal" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        style={{ background: `${primaryColor}20`, border: `1px solid ${primaryColor}60`, color: primaryColor }}
                      >
                        {submitting ? (
                          <div
                            className="w-4 h-4 rounded-full border-2 animate-spin"
                            style={{ borderColor: `${primaryColor}40`, borderTopColor: primaryColor }}
                          />
                        ) : (
                          <>
                            <Heart className="w-3.5 h-3.5" style={{ fill: primaryColor, color: primaryColor }} />
                            {lang ? "Hantar" : "Submit"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
      </div>
    </InviteBottomSheet>
  )
}
