import { cn } from "@/lib/utils"
import { WIZARD_FONTS } from "@/types/config"

interface FontSelectProps {
  value: string
  onChange: (font: string) => void
  className?: string
}

export function FontSelect({ value, onChange, className }: FontSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "border border-gray-300 rounded-md px-2 py-2 text-sm text-gray-700 bg-white outline-none",
        className
      )}
    >
      {WIZARD_FONTS.map((font) => (
        <option key={font}>{font}</option>
      ))}
    </select>
  )
}
