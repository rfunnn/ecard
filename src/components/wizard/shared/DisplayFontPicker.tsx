"use client"

const FONTS = [
  { key: "GreatVibes",     css: "font-great-vibes", label: "Great Vibes" },
  { key: "DancingScript",  css: "font-dancing",      label: "Dancing Script" },
  { key: "PlayfairScript", css: "font-playfair",     label: "Playfair" },
  { key: "Cormorant",      css: "font-cormorant",    label: "Cormorant" },
  { key: "Garamond",       css: "font-garamond",     label: "Garamond" },
  { key: "Cinzel",         css: "font-cinzel",       label: "Cinzel" },
  { key: "Montserrat",     css: "font-montserrat",   label: "Montserrat" },
  { key: "Raleway",        css: "font-raleway",      label: "Raleway" },
  { key: "OpenSans",       css: "font-opensans",     label: "Open Sans" },
  { key: "Lato",           css: "font-lato",         label: "Lato" },
]

interface Props {
  value: string
  onChange: (font: string) => void
  sampleText?: string
}

export function DisplayFontPicker({ value, onChange, sampleText = "Ahmad & Nurul" }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {FONTS.map(({ key, css, label }) => {
        const selected = value === key || (!value && key === "PlayfairScript")
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-lg border-2 transition-all text-center ${
              selected
                ? "border-amber-500 bg-amber-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span
              className={`${css} leading-tight text-gray-800 w-full overflow-hidden`}
              style={{ fontSize: "1.15rem" }}
            >
              {sampleText}
            </span>
            <span className="font-sans text-[9px] uppercase tracking-widest text-gray-400">
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
