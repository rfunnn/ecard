"use client"

import { useWizardStore } from "@/store/wizardStore"
import { WizardToggle } from "../shared/WizardToggle"
import type { SegmentConfig } from "@/types/config"
import { getPackageCapabilities } from "@/types/config"

const SEGMENT_LIST_MS: { key: keyof SegmentConfig; label: string; tier?: string }[] = [
  { key: "venue",         label: "Tempat" },
  { key: "date",          label: "Tarikh" },
  { key: "time",          label: "Masa" },
  { key: "endTime",       label: "Masa Tamat" },
  { key: "saveDateBtn",   label: "Butang \"Simpan Tarikh\"" },
  { key: "eventProgram",  label: "Atur Cara Majlis" },
  { key: "countdown",     label: "Menghitung Hari" },
  { key: "attendance",    label: "Kehadiran",           tier: "Silver+" },
  { key: "wishes",        label: "Ucapan",              tier: "Silver+" },
  { key: "confirmBtn",    label: "Butang \"Sahkan Kehadiran\"", tier: "Silver+" },
  { key: "writeWishBtn",  label: "Butang \"Tulis Ucapan\"",    tier: "Silver+" },
  { key: "photoGallery",  label: "Galeri Foto",         tier: "Gold" },
]

const SEGMENT_LIST_EN: { key: keyof SegmentConfig; label: string; tier?: string }[] = [
  { key: "venue",         label: "Venue" },
  { key: "date",          label: "Date" },
  { key: "time",          label: "Time" },
  { key: "endTime",       label: "End Time" },
  { key: "saveDateBtn",   label: "\"Save Date\" Button" },
  { key: "eventProgram",  label: "Event Programme" },
  { key: "countdown",     label: "Countdown" },
  { key: "attendance",    label: "Attendance",                  tier: "Silver+" },
  { key: "wishes",        label: "Wishes",                      tier: "Silver+" },
  { key: "confirmBtn",    label: "\"Confirm Attendance\" Button", tier: "Silver+" },
  { key: "writeWishBtn",  label: "\"Write Wish\" Button",       tier: "Silver+" },
  { key: "photoGallery",  label: "Photo Gallery",               tier: "Gold" },
]

const SILVER_SEGMENTS = new Set<keyof SegmentConfig>(["attendance", "wishes", "confirmBtn", "writeWishBtn"])
const GOLD_SEGMENTS   = new Set<keyof SegmentConfig>(["photoGallery"])

export function Page12_Segments() {
  const { config, updateConfig } = useWizardStore()
  const segments = config.segments
  const caps = getPackageCapabilities(config.packageType)
  const isMs = config.language === "ms"
  const segmentList = isMs ? SEGMENT_LIST_MS : SEGMENT_LIST_EN

  function toggle(key: keyof SegmentConfig) {
    updateConfig("segments", { ...segments, [key]: !segments[key] })
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-bold text-gray-900 mb-4">{isMs ? "Tunjukkan Segmen:" : "Show Segments:"}</p>
      <div className="space-y-4">
        {segmentList.map(({ key, label, tier }) => {
          const locked =
            (SILVER_SEGMENTS.has(key) && !caps.rsvp) ||
            (GOLD_SEGMENTS.has(key)   && !caps.photoGallery)
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
              {locked && tier && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none ml-2">
                  {tier}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
