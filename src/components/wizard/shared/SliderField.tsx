"use client"

interface Props {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}

export function SliderField({ value, onChange, min = 0, max = 100, step = 1, unit }: Props) {
  return (
    <div className="flex items-center gap-3 mt-1">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #2563eb ${((value - min) / (max - min)) * 100}%, #d1d5db ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
      <span className="text-sm text-gray-700 w-10 text-right shrink-0">
        {value}{unit}
      </span>
    </div>
  )
}
