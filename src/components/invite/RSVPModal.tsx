"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Heart, Check, X } from "lucide-react"
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

export function RSVPModal({ isOpen, onClose, card, onAnalytic, contained }: RSVPModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const lang = card.language === "ms"
  const { primaryColor, bgColor } = card.theme

  const wCfg = card.wizardConfig as WizardConfig | undefined
  const guestLimitPerRSVP = wCfg?.rsvp?.guestLimitPerRSVP ?? 5

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { attendance: "ATTENDING", guestCount: 1 },
  })

  const attendance = watch("attendance")

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
      setSubmitted(true)
    } catch {
      setError(lang ? "Ralat berlaku. Cuba lagi." : "An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 px-6 text-center"
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
                    <button
                      onClick={onClose}
                      className="px-6 py-2 rounded-full text-sm font-medium transition-all active:scale-95"
                      style={{ border: `1.5px solid ${primaryColor}`, color: primaryColor }}
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
