"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { WizardToggle } from "../shared/WizardToggle"

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/)
  return match ? match[1] : null
}

export function Page9_Music() {
  const { config, updateConfig } = useWizardStore()
  const [showEmbed, setShowEmbed] = useState(false)
  const videoId = extractYouTubeId(config.youtubeUrl)

  const startSeconds = (() => {
    const [mm, ss] = config.musicStartTime.split(":").map(Number)
    return (mm || 0) * 60 + (ss || 0)
  })()

  return (
    <div className="space-y-6">
      {/* YouTube URL */}
      <div>
        <FieldLabel label="Pautan Lagu Youtube (jika ada)" />
        <input
          type="url"
          value={config.youtubeUrl}
          onChange={(e) => {
            updateConfig("youtubeUrl", e.target.value)
            setShowEmbed(false)
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://www.youtube.be/UlkiwmnPDGk?si=hx5OH4WZUmLbvYsX"
        />
      </div>

      {/* Start time */}
      <div>
        <FieldLabel label="Mula Dari (mm:ss)" />
        <div className="flex gap-2">
          <input
            type="text"
            value={config.musicStartTime}
            onChange={(e) => updateConfig("musicStartTime", e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="00:00"
          />
          <button
            type="button"
            onClick={() => setShowEmbed(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm text-gray-700 font-medium"
          >
            <Play className="w-3.5 h-3.5" />
            MAINKAN
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <WizardToggle
          checked={config.showMusicPlayer}
          onChange={(v) => updateConfig("showMusicPlayer", v)}
          label="Tunjukkan"
        />
        <WizardToggle
          checked={config.autoplayMusic}
          onChange={(v) => updateConfig("autoplayMusic", v)}
          label="Autoplay"
        />
      </div>

      {/* YouTube embed preview */}
      {videoId && showEmbed && (
        <div>
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-black" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?start=${startSeconds}&autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="YouTube Music Preview"
            />
          </div>
        </div>
      )}

      {/* Browser support info */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 space-y-1">
        <p>Sokongan autoplay bergantung pada peranti &amp; pelayar:</p>
        <p><span className="font-medium">Menyokong:</span> Chrome, Safari, Firefox, Opera, Brave, Edge &amp; UC Browser versi terkini.</p>
        <p><span className="font-medium">Tidak Menyokong:</span> Facebook/Instagram/Telegram Browser &amp; pelayar yang kurang popular (Mi Browser, Vivo Browser, dll.)</p>
      </div>

      <div className="border-t border-gray-100" />

      {/* Scroll delay */}
      <div>
        <FieldLabel label="Delay Auto Skrol (saat)" />
        <SliderField
          value={config.scrollDelay}
          onChange={(v) => updateConfig("scrollDelay", v)}
          min={0}
          max={10}
          step={0.5}
          unit="s"
        />
      </div>
    </div>
  )
}
