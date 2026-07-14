"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { WIZARD_FONTS } from "@/types/config"

const FONT_CSS: Record<string, string> = {
  Default:        "font-lato",
  PlayfairScript: "font-playfair",
  Cormorant:      "font-cormorant",
  Spartan:        "font-lato",
  Cinzel:         "font-cinzel",
  GreatVibes:     "font-great-vibes",
  DancingScript:  "font-dancing",
  Montserrat:     "font-montserrat",
  Lato:           "font-lato",
  Garamond:       "font-garamond",
  Raleway:        "font-raleway",
  OpenSans:       "font-opensans",
  Sacramento:     "font-sacramento",
  AlexBrush:      "font-alex-brush",
  PinyonScript:   "font-pinyon",
  Allura:         "font-allura",
  Parisienne:     "font-parisienne",
}

const FONT_LABEL: Record<string, string> = {
  Default:        "Default",
  PlayfairScript: "Playfair",
  Cormorant:      "Cormorant",
  Spartan:        "Spartan",
  Cinzel:         "Cinzel",
  GreatVibes:     "Great Vibes",
  DancingScript:  "Dancing Script",
  Montserrat:     "Montserrat",
  Lato:           "Lato",
  Garamond:       "Garamond",
  Raleway:        "Raleway",
  OpenSans:       "Open Sans",
  Sacramento:     "Sacramento",
  AlexBrush:      "Alex Brush",
  PinyonScript:   "Pinyon Script",
  Allura:         "Allura",
  Parisienne:     "Parisienne",
}

interface FontSelectProps {
  value: string
  onChange: (font: string) => void
  className?: string
  sampleText?: string
}

export function FontSelect({ value, onChange, className, sampleText = "Contoh teks" }: FontSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const key = value || "Default"
  const css = FONT_CSS[key] ?? "font-lato"
  const label = FONT_LABEL[key] ?? key

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2.5 bg-white outline-none hover:border-gray-400 transition-colors"
      >
        <span className={`${css} text-gray-800 truncate`} style={{ fontSize: "1rem" }}>
          {sampleText}
        </span>
        <span className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 hidden sm:inline">
            {label}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {WIZARD_FONTS.map((font) => {
            const selected = key === font
            const fcss = FONT_CSS[font] ?? "font-lato"
            const flabel = FONT_LABEL[font] ?? font
            return (
              <button
                key={font}
                type="button"
                onClick={() => { onChange(font); setOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                  selected ? "bg-amber-50" : "hover:bg-gray-50"
                }`}
              >
                <span className={`${fcss} text-gray-800 truncate`} style={{ fontSize: "1rem" }}>
                  {sampleText}
                </span>
                <span className={`font-sans text-[10px] uppercase tracking-widest ml-2 shrink-0 ${
                  selected ? "text-amber-600 font-semibold" : "text-gray-400"
                }`}>
                  {flabel}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
