"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"
import { X, Download } from "lucide-react"
import type { InvitationCardData } from "@/types/invitation"

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  card: InvitationCardData
  contained?: boolean
}

export function QRModal({ isOpen, onClose, card, contained }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { primaryColor, bgColor } = card.theme

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, window.location.href, {
      width: 220,
      margin: 2,
      color: { dark: primaryColor, light: bgColor },
    }).catch(() => {})
  }, [isOpen, primaryColor, bgColor])

  if (!isOpen) return null

  function handleDownload() {
    if (!canvasRef.current) return
    const a = document.createElement("a")
    a.download = `qr-${card.slug}.png`
    a.href = canvasRef.current.toDataURL("image/png")
    a.click()
  }

  const pos = contained ? "absolute" : "fixed"

  return (
    <>
      <div className={`${pos} inset-0 z-[60] bg-black/60`} onClick={onClose} />
      <div
        className={`${pos} inset-x-4 bottom-24 z-[70] max-w-xs mx-auto rounded-2xl p-5 shadow-2xl`}
        style={{ background: bgColor, border: `1.5px solid ${primaryColor}40` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: primaryColor }}>
            {card.language === "ms" ? "Kod QR Jemputan" : "Invitation QR Code"}
          </h3>
          <button onClick={onClose} className="p-1 rounded transition-opacity hover:opacity-60" style={{ color: primaryColor }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <canvas ref={canvasRef} className="rounded-lg" style={{ imageRendering: "pixelated" }} />
          <p className="text-[11px] text-center leading-relaxed" style={{ color: primaryColor, opacity: 0.6 }}>
            {card.language === "ms"
              ? "Imbas kod ini untuk membuka jemputan"
              : "Scan to open this invitation"}
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80 w-full justify-center"
            style={{ background: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}40` }}
          >
            <Download className="w-3.5 h-3.5" />
            {card.language === "ms" ? "Muat Turun QR" : "Download QR"}
          </button>
        </div>
      </div>
    </>
  )
}
