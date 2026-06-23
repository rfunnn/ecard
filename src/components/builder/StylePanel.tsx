"use client"

import { useBuilderStore } from "@/store/builderStore"
import { Select } from "@/components/ui/Select"
import { Slider } from "@/components/ui/Slider"
import { GOOGLE_FONTS } from "@/types/invitation"
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { cn } from "@/lib/utils"

const fontOptions = GOOGLE_FONTS.map((f) => ({ value: f, label: f }))

const COLORS = [
  "#D4AF37", "#F2D06B", "#8B6914", "#C0392B", "#E74C3C",
  "#2980B9", "#27AE60", "#8E44AD", "#F39C12", "#ECF0F1",
  "#BDC3C7", "#95A5A6", "#34495E", "#2C3E50", "#F5E6C8",
]

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-cream/60 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border border-white/20" style={{ background: value }} />
          <span className="text-xs font-mono text-cream/40">{value}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
              value === c ? "border-white scale-110" : "border-transparent"
            )}
            style={{ background: c }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded-full cursor-pointer border border-white/20 bg-transparent p-0"
          title="Custom color"
        />
      </div>
    </div>
  )
}

export function StylePanel() {
  const { card, updateTheme } = useBuilderStore()
  const theme = card.theme

  if (!theme) return null

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full pb-6">
      <div className="space-y-1 pb-2">
        <h3 className="text-xs font-semibold text-gold/80 uppercase tracking-widest">Gaya</h3>
        <p className="text-xs text-cream/30">Sesuaikan warna dan tipografi</p>
      </div>

      {/* Colors */}
      <ColorPicker
        label="Warna Utama"
        value={theme.primaryColor}
        onChange={(v) => updateTheme({ primaryColor: v })}
      />
      <ColorPicker
        label="Warna Teks Tajuk"
        value={theme.titleColor}
        onChange={(v) => updateTheme({ titleColor: v })}
      />
      <ColorPicker
        label="Warna Teks Kandungan"
        value={theme.bodyColor}
        onChange={(v) => updateTheme({ bodyColor: v })}
      />
      <ColorPicker
        label="Warna Latar"
        value={theme.bgColor}
        onChange={(v) => updateTheme({ bgColor: v })}
      />

      <div className="h-px bg-white/5" />

      {/* Fonts */}
      <Select
        label="Fon Tajuk"
        value={theme.titleFont}
        onChange={(e) => updateTheme({ titleFont: e.target.value })}
        options={fontOptions}
      />
      <Slider
        label="Saiz Tajuk"
        min={18}
        max={72}
        step={2}
        value={theme.titleSize}
        valueSuffix="px"
        onChange={(e) => updateTheme({ titleSize: Number(e.target.value) })}
      />

      <Select
        label="Fon Kandungan"
        value={theme.bodyFont}
        onChange={(e) => updateTheme({ bodyFont: e.target.value })}
        options={fontOptions}
      />
      <Slider
        label="Saiz Kandungan"
        min={10}
        max={24}
        step={1}
        value={theme.bodySize}
        valueSuffix="px"
        onChange={(e) => updateTheme({ bodySize: Number(e.target.value) })}
      />

      <div className="h-px bg-white/5" />

      {/* Text alignment */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-cream/60 uppercase tracking-wider">Penjajaran Teks</label>
        <div className="flex gap-2">
          {(["left", "center", "right"] as const).map((align) => {
            const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight
            return (
              <button
                key={align}
                type="button"
                onClick={() => updateTheme({ textAlign: align })}
                className={cn(
                  "flex-1 flex items-center justify-center py-2 rounded-lg border transition-all",
                  theme.textAlign === align
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-white/10 text-cream/40 hover:border-white/20 hover:text-cream/60"
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="h-px bg-white/5" />

      <Slider
        label="Kelegapan Latar"
        min={0}
        max={1}
        step={0.05}
        value={theme.bgOpacity}
        onChange={(e) => updateTheme({ bgOpacity: Number(e.target.value) })}
      />
    </div>
  )
}
