"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

const FONTS = [
  // Handwriting / script
  { key: "Sacramento",    css: "font-sacramento",  label: "Sacramento" },
  { key: "AlexBrush",     css: "font-alex-brush",  label: "Alex Brush" },
  { key: "PinyonScript",  css: "font-pinyon",       label: "Pinyon Script" },
  { key: "Allura",        css: "font-allura",       label: "Allura" },
  { key: "Parisienne",    css: "font-parisienne",   label: "Parisienne" },
  { key: "GreatVibes",    css: "font-great-vibes",  label: "Great Vibes" },
  { key: "DancingScript", css: "font-dancing",      label: "Dancing Script" },
  // Serif
  { key: "PlayfairScript", css: "font-playfair",   label: "Playfair" },
  { key: "Cormorant",     css: "font-cormorant",    label: "Cormorant" },
  { key: "Garamond",      css: "font-garamond",     label: "Garamond" },
  { key: "Cinzel",        css: "font-cinzel",       label: "Cinzel" },
  // Sans-serif
  { key: "Montserrat",    css: "font-montserrat",   label: "Montserrat" },
  { key: "Raleway",       css: "font-raleway",      label: "Raleway" },
  { key: "OpenSans",      css: "font-opensans",     label: "Open Sans" },
  { key: "Lato",          css: "font-lato",         label: "Lato" },
]

interface Props {
  value: string
  onChange: (font: string) => void
  sampleText?: string
}

export function DisplayFontPicker({ value, onChange, sampleText = "Ahmad & Nurul" }: Props) {
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

  const current = FONTS.find((f) => f.key === value) ?? FONTS.find((f) => f.key === "PlayfairScript")!

  return (
    <div className="relative mt-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2.5 bg-white outline-none hover:border-gray-400 transition-colors"
      >
        <span className={`${current.css} text-gray-800 truncate`} style={{ fontSize: "1.1rem" }}>
          {sampleText}
        </span>
        <span className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 hidden sm:inline">
            {current.label}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {FONTS.map(({ key, css, label }) => {
            const selected = value === key || (!value && key === "PlayfairScript")
            return (
              <button
                key={key}
                type="button"
                onClick={() => { onChange(key); setOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                  selected ? "bg-amber-50" : "hover:bg-gray-50"
                }`}
              >
                <span className={`${css} text-gray-800 truncate`} style={{ fontSize: "1.1rem" }}>
                  {sampleText}
                </span>
                <span className={`font-sans text-[10px] uppercase tracking-widest ml-2 shrink-0 ${
                  selected ? "text-amber-600 font-semibold" : "text-gray-400"
                }`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
