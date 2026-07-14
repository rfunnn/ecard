"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SimpleRichText } from "../shared/SimpleRichText"
import { WizardToggle } from "../shared/WizardToggle"
import { LockedPage } from "../shared/LockedPage"
import type { RSVPWizardConfig } from "@/types/config"
import { getPackageCapabilities } from "@/types/config"

type RSVPMode = RSVPWizardConfig["mode"]

const MODES_MS: { value: RSVPMode; label: string }[] = [
  { value: "RSVP_WISHES",  label: "RSVP + Ucapan" },
  { value: "WISHES_ONLY",  label: "Ucapan Sahaja" },
  { value: "THIRD_PARTY",  label: "Pihak Ketiga" },
  { value: "NONE",         label: "Tiada" },
]
const MODES_EN: { value: RSVPMode; label: string }[] = [
  { value: "RSVP_WISHES",  label: "RSVP + Wishes" },
  { value: "WISHES_ONLY",  label: "Wishes Only" },
  { value: "THIRD_PARTY",  label: "Third Party" },
  { value: "NONE",         label: "None" },
]

const SHOW_FIELDS_MS: { key: keyof RSVPWizardConfig["showFields"]; label: string }[] = [
  { key: "name",         label: "Nama" },
  { key: "phone",        label: "Telefon" },
  { key: "email",        label: "Alamat Emel" },
  { key: "address",      label: "Alamat Rumah" },
  { key: "company",      label: "Nama Syarikat" },
  { key: "jobTitle",     label: "Jawatan Pekerjaan" },
  { key: "vehiclePlate", label: "No. Plat Kenderaan" },
  { key: "notes",        label: "Catatan" },
  { key: "wishes",       label: "Ucapan" },
]
const SHOW_FIELDS_EN: { key: keyof RSVPWizardConfig["showFields"]; label: string }[] = [
  { key: "name",         label: "Name" },
  { key: "phone",        label: "Phone" },
  { key: "email",        label: "Email Address" },
  { key: "address",      label: "Home Address" },
  { key: "company",      label: "Company Name" },
  { key: "jobTitle",     label: "Job Title" },
  { key: "vehiclePlate", label: "Vehicle Plate No." },
  { key: "notes",        label: "Notes" },
  { key: "wishes",       label: "Wishes" },
]

export function Page7_RSVP() {
  const { config, updateConfig } = useWizardStore()
  const rsvp = config.rsvp
  const caps = getPackageCapabilities(config.packageType)
  const isMs = config.language === "ms"
  const modes = isMs ? MODES_MS : MODES_EN
  const showFields = isMs ? SHOW_FIELDS_MS : SHOW_FIELDS_EN

  if (!caps.rsvp) {
    return <LockedPage feature={isMs ? "RSVP / Ucapan" : "RSVP / Wishes"} requiredPlan="Silver (RM40)" />
  }

  function updateRSVP(updates: Partial<RSVPWizardConfig>) {
    updateConfig("rsvp", { ...rsvp, ...updates })
  }

  function toggleField(key: keyof RSVPWizardConfig["showFields"]) {
    updateRSVP({ showFields: { ...rsvp.showFields, [key]: !rsvp.showFields[key] } })
  }

  return (
    <div className="space-y-6">
      {/* Mode */}
      <div>
        <FieldLabel label={isMs ? "Mod Pilihan" : "Mode"} />
        <div className="space-y-2 mt-1">
          {modes.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rsvpMode"
                checked={rsvp.mode === value}
                onChange={() => updateRSVP({ mode: value })}
                className="accent-[#2563eb]"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Note */}
      <div>
        <FieldLabel label={isMs ? "Nota (jika ada)" : "Note (if any)"} />
        <SimpleRichText
          value={rsvp.note}
          onChange={(v) => updateRSVP({ note: v })}
          placeholder="Insert text here ..."
          rows={3}
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* RSVP close date */}
      <div>
        <FieldLabel label={isMs ? "Tarikh Tutup RSVP (jika ada)" : "RSVP Close Date (if any)"} info />
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={rsvp.closeDate}
            onChange={(e) => updateRSVP({ closeDate: e.target.value })}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => updateRSVP({ closeDate: "" })}
            className="px-3 py-2 text-sm text-blue-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            RESET
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Show fields */}
      <div>
        <FieldLabel label={isMs ? "Tunjukkan Input" : "Show Fields"} />
        <div className="space-y-2 mt-1">
          {showFields.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rsvp.showFields[key]}
                onChange={() => toggleField(key)}
                className="w-4 h-4 accent-[#2563eb] rounded"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Separate children */}
      <WizardToggle
        checked={rsvp.separateChildren}
        onChange={(v) => updateRSVP({ separateChildren: v })}
        label={isMs ? "Asingkan Kehadiran Kanak-kanak" : "Separate Children's Attendance"}
      />

      <div className="border-t border-gray-100" />

      {/* Guest limits */}
      <div className="space-y-4">
        <div>
          <FieldLabel label={isMs ? "Had Tetamu per RSVP" : "Guest Limit per RSVP"} required />
          <input
            type="number"
            value={rsvp.guestLimitPerRSVP}
            onChange={(e) => updateRSVP({ guestLimitPerRSVP: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
          />
        </div>
        <div>
          <FieldLabel label={isMs ? "Jumlah Keseluruhan Tetamu" : "Total Guest Limit"} required />
          <input
            type="number"
            value={rsvp.totalGuestLimit}
            onChange={(e) => updateRSVP({ totalGuestLimit: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
          />
        </div>
      </div>

    </div>
  )
}
