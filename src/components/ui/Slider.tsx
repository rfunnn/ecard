"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  valueSuffix?: string
  showValue?: boolean
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueSuffix, showValue = true, value, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-cream/60 uppercase tracking-wider">{label}</label>
            {showValue && (
              <span className="text-xs text-gold font-mono">
                {value}{valueSuffix}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={cn(
            "w-full h-1.5 rounded-full appearance-none cursor-pointer",
            "bg-white/10",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-lg",
            "[&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing",
            "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"
