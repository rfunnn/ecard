"use client"

import { useWizardStore } from "@/store/wizardStore"
import { WizardToggle } from "../shared/WizardToggle"
import type { SegmentConfig } from "@/types/config"

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

export function Page11_Segments() {
  const { config, updateConfig } = useWizardStore()
  const segments = config.segments

  function toggle(key: keyof SegmentConfig) {
    updateConfig("segments", { ...segments, [key]: !segments[key] })
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-bold text-gray-900 mb-4">Tunjukkan Segmen:</p>
      <div className="space-y-4">
        {SEGMENT_LIST.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <WizardToggle
              checked={segments[key]}
              onChange={() => toggle(key)}
            />
            <span
              className="flex-1 ml-3 text-sm cursor-pointer"
              style={{ color: segments[key] ? "#2563eb" : "#9ca3af" }}
              onClick={() => toggle(key)}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
