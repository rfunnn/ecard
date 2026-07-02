"use client"

import { useWizardStore } from "@/store/wizardStore"
import { WizardToggle } from "../shared/WizardToggle"
import type { SegmentConfig } from "@/types/config"
import { getPackageCapabilities } from "@/types/config"

const SEGMENT_LIST: { key: keyof SegmentConfig; label: string }[] = [
  { key: "venue",         label: "Tempat" },
  { key: "date",          label: "Tarikh" },
  { key: "time",          label: "Masa" },
  { key: "endTime",       label: "Masa Tamat" },
  { key: "saveDateBtn",   label: "Butang \"Simpan Tarikh\"" },
  { key: "eventProgram",  label: "Atur Cara Majlis" },
  { key: "countdown",     label: "Menghitung Hari" },
  { key: "attendance",    label: "Kehadiran" },
  { key: "wishes",        label: "Ucapan" },
  { key: "confirmBtn",    label: "Butang \"Sahkan Kehadiran\"" },
  { key: "writeWishBtn",  label: "Butang \"Tulis Ucapan\"" },
]

// These segments require Silver+ (tied to the RSVP feature)
const RSVP_SEGMENTS = new Set<keyof SegmentConfig>(["attendance", "wishes", "confirmBtn", "writeWishBtn"])

export function Page11_Segments() {
  const { config, updateConfig } = useWizardStore()
  const segments = config.segments
  const caps = getPackageCapabilities(config.packageType)

  function toggle(key: keyof SegmentConfig) {
    updateConfig("segments", { ...segments, [key]: !segments[key] })
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-bold text-gray-900 mb-4">Tunjukkan Segmen:</p>
      <div className="space-y-4">
        {SEGMENT_LIST.map(({ key, label }) => {
          const locked = !caps.rsvp && RSVP_SEGMENTS.has(key)
          return (
            <div
              key={key}
              className={`flex items-center justify-between ${locked ? "opacity-40 pointer-events-none" : ""}`}
            >
              <WizardToggle
                checked={segments[key]}
                onChange={() => toggle(key)}
              />
              <span
                className="flex-1 ml-3 text-sm"
                style={{ color: locked ? "#9ca3af" : segments[key] ? "#2563eb" : "#9ca3af" }}
              >
                {label}
              </span>
              {locked && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none ml-2">
                  Silver+
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
