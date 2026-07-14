"use client"

import { Pencil } from "lucide-react"

interface Props {
  value: string
  onChange: (val: string) => void
  className?: string
}

export function ColorField({ value, onChange, className }: Props) {
  return (
    <label
      className={`relative cursor-pointer inline-flex items-center justify-center shrink-0 ${className ?? ""}`}
      title={value}
    >
      {/* Colour swatch circle */}
      <div
        className="w-9 h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center"
        style={{ background: value || "#ffffff" }}
      >
        <Pencil className="w-3.5 h-3.5 drop-shadow" style={{ color: getContrastColor(value) }} />
      </div>
      {/* Native colour picker — invisible, sits on top */}
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
      />
    </label>
  )
}

/** Returns black or white depending on which contrasts better with `hex`. */
function getContrastColor(hex: string): string {
  if (!hex || hex.length < 7) return "#ffffff"
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Perceived luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? "#00000088" : "#ffffff99"
}
