"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Copy, Check, ExternalLink, Eye, Lock, Globe } from "lucide-react"
import { useBuilderStore } from "@/store/builderStore"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Toggle } from "@/components/ui/Toggle"

interface SharePanelProps {
  onPublishToggle: (published: boolean) => Promise<void>
  onPasswordSet: (password: string | null) => Promise<void>
}

export function SharePanel({ onPublishToggle, onPasswordSet }: SharePanelProps) {
  const { card } = useBuilderStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [showPasswordField, setShowPasswordField] = useState(false)
  const lang = card.language === "ms"

  const invitePath = card.cardNum ? `/${card.cardNum}` : `/invite/${card.slug}`
  const [shareUrl, setShareUrl] = useState(invitePath)

  useEffect(() => {
    setShareUrl(`${window.location.origin}${card.cardNum ? `/${card.cardNum}` : `/invite/${card.slug}`}`)
  }, [card.slug, card.cardNum])

  useEffect(() => {
    if (!canvasRef.current || !card.slug) return
    QRCode.toCanvas(canvasRef.current, shareUrl, {
      width: 180,
      margin: 1,
      color: { dark: "#D4AF37", light: "#1a0a00" },
    }).catch(() => {})
  }, [card.slug, shareUrl])

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handlePublish(checked: boolean) {
    setPublishing(true)
    try { await onPublishToggle(checked) } finally { setPublishing(false) }
  }

  async function handlePasswordSave() {
    await onPasswordSet(passwordInput || null)
    setPasswordInput("")
    setShowPasswordField(false)
  }

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full pb-6">
      <div className="space-y-1 pb-2">
        <h3 className="text-xs font-semibold text-gold/80 uppercase tracking-widest">Kongsi</h3>
        <p className="text-xs text-cream/30">{lang ? "Urus pautan dan privasi kad" : "Manage link and card privacy"}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
        <Eye className="w-4 h-4 text-gold/50 shrink-0" />
        <div>
          <p className="text-xs text-cream/40">{lang ? "Jumlah Tontonan" : "Total Views"}</p>
          <p className="text-sm font-semibold text-cream">{card.viewCount ?? 0}</p>
        </div>
      </div>

      {/* Publish toggle */}
      <div className="p-3 rounded-xl border border-white/5 bg-white/3">
        <Toggle
          label={lang ? (card.isPublished ? "Diterbitkan" : "Draf") : (card.isPublished ? "Published" : "Draft")}
          description={lang
            ? (card.isPublished ? "Pautan aktif dan boleh dikongsi" : "Hanya anda yang boleh melihat kad ini")
            : (card.isPublished ? "Link is active and shareable" : "Only you can view this card")}
          checked={!!card.isPublished}
          onChange={handlePublish}
          disabled={publishing}
        />
      </div>

      {/* Link */}
      {card.isPublished && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-cream/60 uppercase tracking-wider">
              {lang ? "Pautan Kad" : "Card Link"}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-cream/60 truncate font-mono">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-2.5 rounded-lg border border-white/10 hover:border-gold/30 text-cream/60 hover:text-gold transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-gold" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg border border-white/10 hover:border-gold/30 text-cream/60 hover:text-gold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-white/5 bg-[#1a0a00]">
            <canvas ref={canvasRef} className="rounded-lg" style={{ imageRendering: "pixelated" }} />
            <p className="text-xs text-cream/30 text-center">
              {lang ? "Imbas kod QR untuk buka kad" : "Scan QR code to open the card"}
            </p>
          </div>

          {/* Password protection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cream/40" />
                <span className="text-xs font-medium text-cream/60 uppercase tracking-wider">
                  {lang ? "Kata Laluan" : "Password"}
                </span>
              </div>
              <button
                onClick={() => setShowPasswordField((v) => !v)}
                className="text-xs text-gold/60 hover:text-gold"
              >
                {showPasswordField ? (lang ? "Batal" : "Cancel") : (lang ? "Tetapkan" : "Set")}
              </button>
            </div>
            {showPasswordField && (
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder={lang ? "Kosongkan untuk padam" : "Leave empty to remove"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handlePasswordSave} variant="outline">
                  <Globe className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
