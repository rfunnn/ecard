"use client"

import { useState } from "react"
import Image from "next/image"
import { useBuilderStore } from "@/store/builderStore"
import { Input } from "@/components/ui/Input"
import { Toggle } from "@/components/ui/Toggle"
import { Slider } from "@/components/ui/Slider"
import { Button } from "@/components/ui/Button"
import { Music, ExternalLink } from "lucide-react"

export function MediaPanel() {
  const { card, updateMedia } = useBuilderStore()
  const media = card.media
  const [urlInput, setUrlInput] = useState(media?.youtubeUrl ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const lang = card.language === "ms"

  if (!media) return null

  async function handleValidateUrl() {
    if (!urlInput.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/youtube/validate?url=${encodeURIComponent(urlInput)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "URL tidak sah")
      updateMedia({ youtubeUrl: urlInput, youtubeVideoId: data.videoId })
    } catch (e) {
      setError(e instanceof Error ? e.message : "URL tidak sah")
    } finally {
      setLoading(false)
    }
  }

  function handleRemove() {
    setUrlInput("")
    updateMedia({ youtubeUrl: undefined, youtubeVideoId: undefined })
  }

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full pb-6">
      <div className="space-y-1 pb-2">
        <h3 className="text-xs font-semibold text-gold/80 uppercase tracking-widest">Media</h3>
        <p className="text-xs text-cream/30">{lang ? "Tetapan muzik latar" : "Background music settings"}</p>
      </div>

      <Toggle
        label={lang ? "Aktifkan Muzik" : "Enable Music"}
        description={lang ? "Tambah muzik latar dari YouTube" : "Add background music from YouTube"}
        checked={media.audioEnabled}
        onChange={(v) => updateMedia({ audioEnabled: v })}
      />

      {media.audioEnabled && (
        <>
          <div className="space-y-2">
            <Input
              label="YouTube URL"
              placeholder="https://youtube.com/watch?v=..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              error={error}
              hint={lang ? "Tampal pautan YouTube untuk muzik latar" : "Paste YouTube link for background music"}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleValidateUrl() } }}
            />
            <Button
              variant="outline"
              size="sm"
              loading={loading}
              onClick={handleValidateUrl}
              className="w-full"
            >
              <Music className="w-3.5 h-3.5" />
              {lang ? "Sahkan URL" : "Validate URL"}
            </Button>
          </div>

          {media.youtubeVideoId && (
            <div className="rounded-xl overflow-hidden border border-white/10 relative group">
              <Image
                src={`https://img.youtube.com/vi/${media.youtubeVideoId}/mqdefault.jpg`}
                alt="YouTube thumbnail"
                width={320}
                height={180}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => window.open(`https://youtube.com/watch?v=${media.youtubeVideoId}`, "_blank")}
                  className="flex items-center gap-1.5 text-xs text-cream/80 hover:text-cream"
                >
                  <ExternalLink className="w-3 h-3" />
                  {lang ? "Buka" : "Open"}
                </button>
                <span className="text-cream/30">·</span>
                <button onClick={handleRemove} className="text-xs text-red-400 hover:text-red-300">
                  {lang ? "Padam" : "Remove"}
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className="h-px bg-white/5" />

          <Toggle
            label={lang ? "Main Automatik" : "Autoplay"}
            description={lang ? "Nota: penyemak imbas mungkin sekatan autoplay" : "Note: browsers may block autoplay"}
            checked={media.autoplay}
            onChange={(v) => updateMedia({ autoplay: v })}
          />

          <Toggle
            label={lang ? "Ulang Muzik" : "Loop Audio"}
            checked={media.loopAudio}
            onChange={(v) => updateMedia({ loopAudio: v })}
          />

          <Slider
            label={lang ? "Kelantangan" : "Volume"}
            min={0}
            max={1}
            step={0.1}
            value={media.volume}
            valueSuffix=""
            onChange={(e) => updateMedia({ volume: Number(e.target.value) })}
          />
        </>
      )}
    </div>
  )
}
