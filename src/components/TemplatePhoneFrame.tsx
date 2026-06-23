"use client"

export interface TemplateForFrame {
  slug: string
  nameMs: string
  category: string
  thumbnail: string
  defaultConfig: {
    primaryColor?: string
    bgColor?: string
  }
}

interface Props {
  template: TemplateForFrame
  previewName?: string
  size?: "sm" | "md" | "lg"
}

const SIZE_MAP = {
  sm: "100px",
  md: "130px",
  lg: "160px",
}

export function TemplatePhoneFrame({ template, previewName = "", size = "md" }: Props) {
  const accent = template.defaultConfig?.primaryColor ?? "#D4AF37"
  const bg     = template.defaultConfig?.bgColor      ?? "#1a0a00"
  const maxW   = SIZE_MAP[size]

  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: "100%", maxWidth: maxW, aspectRatio: "9/19.5" }}
    >
      {/* Phone body */}
      <div
        className="absolute inset-0 rounded-[22px] bg-gray-900 shadow-xl overflow-hidden"
        style={{ border: "5px solid #2d2d2d" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="w-12 h-3 bg-[#2d2d2d] rounded-b-xl" />
        </div>

        {/* Screen */}
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.nameMs}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-3"
            style={{ background: bg }}
          >
            <p className="text-[8px] uppercase tracking-[0.25em] opacity-50 mb-2" style={{ color: accent }}>
              {template.category === "WEDDING" ? "Walimatul Urus"
                : template.category === "BIRTHDAY" ? "Jemputan"
                : template.nameMs}
            </p>
            <p className="text-base leading-tight font-playfair" style={{ color: accent }}>
              {previewName || "Adam & Hawa"}
            </p>
            <div className="mt-3 w-10 h-px opacity-25" style={{ background: accent }} />
          </div>
        )}

        {/* Home indicator */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="w-10 h-0.5 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Side buttons */}
      <div className="absolute left-[-3px] top-[18%] w-[3px] h-4 bg-gray-600 rounded-l-sm" />
      <div className="absolute left-[-3px] top-[27%] w-[3px] h-6 bg-gray-600 rounded-l-sm" />
      <div className="absolute left-[-3px] top-[38%] w-[3px] h-6 bg-gray-600 rounded-l-sm" />
      <div className="absolute right-[-3px] top-[24%] w-[3px] h-8 bg-gray-600 rounded-r-sm" />
    </div>
  )
}
