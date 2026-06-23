"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Heart, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input, Textarea } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import type { InvitationCardData } from "@/types/invitation"

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
}

export function RSVPModal({ isOpen, onClose, card, onAnalytic }: RSVPModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const lang = card.language === "ms"

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

  const attendanceOptions = [
    { value: "ATTENDING",     label: lang ? "Ya, saya hadir" : "Yes, I'll attend" },
    { value: "MAYBE",         label: lang ? "Mungkin hadir" : "Maybe" },
    { value: "NOT_ATTENDING", label: lang ? "Tidak dapat hadir" : "Unable to attend" },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lang ? "Pengesahan Kehadiran" : "RSVP"}>
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 px-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-gold" />
          </div>
          <h3 className="font-playfair text-xl text-cream mb-2">
            {lang ? "Terima Kasih!" : "Thank You!"}
          </h3>
          <p className="text-cream/50 text-sm mb-6">
            {lang ? "Maklum balas anda telah diterima." : "Your response has been recorded."}
          </p>
          <Button onClick={onClose}>{lang ? "Tutup" : "Close"}</Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <Input
            label={lang ? "Nama Anda" : "Your Name"}
            placeholder={lang ? "cth: Ahmad bin Ali" : "e.g. John Smith"}
            error={errors.guestName?.message}
            {...register("guestName", { required: lang ? "Nama diperlukan" : "Name is required" })}
          />

          <Select
            label={lang ? "Kehadiran" : "Attendance"}
            options={attendanceOptions}
            {...register("attendance")}
          />

          {attendance !== "NOT_ATTENDING" && (
            <Input
              type="number"
              label={lang ? "Bilangan Tetamu" : "Number of Guests"}
              min={1}
              max={20}
              {...register("guestCount")}
            />
          )}

          <Input
            label={lang ? "No. WhatsApp (pilihan)" : "WhatsApp No. (optional)"}
            placeholder="+601X-XXXXXXX"
            {...register("phone")}
          />

          <Textarea
            label={lang ? "Ucapan (pilihan)" : "Message (optional)"}
            placeholder={lang ? "Selamat pengantin baru!" : "Congratulations!"}
            rows={3}
            {...register("message")}
          />

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              {lang ? "Batal" : "Cancel"}
            </Button>
            <Button type="submit" className="flex-1" loading={submitting}>
              <Heart className="w-4 h-4" />
              {lang ? "Hantar" : "Submit"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
