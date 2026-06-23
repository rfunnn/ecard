"use client"

interface Props {
  value: string
  onChange: (val: string) => void
  className?: string
}

export function ColorField({ value, onChange, className }: Props) {
  return (
    <div className={`flex items-center border border-gray-300 rounded-md overflow-hidden ${className ?? ""}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1.5 text-sm font-mono outline-none min-w-0 w-20"
        maxLength={7}
      />
      <label className="relative w-10 h-9 cursor-pointer shrink-0 border-l border-gray-300">
        <div className="w-full h-full" style={{ background: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </label>
    </div>
  )
}
