"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { SimpleRichText } from "../shared/SimpleRichText"
import { WIZARD_FONTS } from "@/types/config"

export function Page3_InvitationText() {
  const { config, updateConfig } = useWizardStore()

  return (
    <div className="space-y-6">
      {/* Opening Speech */}
      <div>
        <FieldLabel label="Pembuka Ucapan" />
        <SimpleRichText
          value={config.openingSpeech}
          onChange={(v) => updateConfig("openingSpeech", v)}
          placeholder="Walimatul Urus"
          rows={3}
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* Number of Organizers */}
      <div>
        <FieldLabel label="Bilangan Penganjur" required />
        <div className="flex gap-6 mt-1">
          {([1, 2] as const).map((n) => (
            <label key={n} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="organizerCount"
                checked={config.organizerCount === n}
                onChange={() => updateConfig("organizerCount", n)}
                className="accent-[#2563eb]"
              />
              <span className="text-sm text-gray-700">{n === 1 ? "Satu" : "Dua"}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Organizer 1 */}
      <div className="space-y-2">
        <div>
          <FieldLabel label="Nama Penganjur (jika ada)" />
          <input
            type="text"
            value={config.organizer1.name}
            onChange={(e) => updateConfig("organizer1", { ...config.organizer1, name: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Azman bin Ahmad & Norazrina binti Jaalam"
          />
        </div>
        <div>
          <FieldLabel label="Hubungan (jika ada)" />
          <input
            type="text"
            value={config.organizer1.relationship}
            onChange={(e) => updateConfig("organizer1", { ...config.organizer1, relationship: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bapa Pengantin Lelaki & Ibu Pengantin Lelaki"
          />
        </div>
      </div>

      {/* Organizer 2 (conditional) */}
      {config.organizerCount === 2 && (
        <div className="space-y-2">
          <div>
            <FieldLabel label="Nama Penganjur #2 (jika ada)" />
            <input
              type="text"
              value={config.organizer2.name}
              onChange={(e) => updateConfig("organizer2", { ...config.organizer2, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Allahyarham Dr Mohd Fauzi bin Abdullah & Rahmawati"
            />
          </div>
          <div>
            <FieldLabel label="Hubungan (jika ada)" />
            <input
              type="text"
              value={config.organizer2.relationship}
              onChange={(e) => updateConfig("organizer2", { ...config.organizer2, relationship: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bapa Pengantin Perempuan & Ibu Pengantin Perempuan"
            />
          </div>
        </div>
      )}

      {/* Organizer font + size */}
      <div className="flex gap-2 items-center">
        <select
          value={config.organizerFont}
          onChange={(e) => updateConfig("organizerFont", e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-sm text-gray-700 bg-white outline-none"
        >
          {WIZARD_FONTS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>
      <SliderField value={config.organizerSize} onChange={(v) => updateConfig("organizerSize", v)} min={8} max={48} />

      <div className="border-t border-gray-100" />

      {/* Invitation Speech */}
      <div>
        <FieldLabel label="Ayat Ucapan" required />
        <SimpleRichText
          value={config.invitationSpeech}
          onChange={(v) => updateConfig("invitationSpeech", v)}
          placeholder="Dengan penuh kesyukuran, kami mempersilakan..."
          rows={5}
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* Full Names */}
      <div>
        <FieldLabel label="Nama Penuh (jika ada)" info />
        <input
          type="text"
          value={config.fullNames}
          onChange={(e) => updateConfig("fullNames", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Arfan bin Azman & Rafeka binti Mohd Fauzi"
        />
        <div className="mt-2">
          <select
            value={config.fullNamesFont}
            onChange={(e) => updateConfig("fullNamesFont", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm text-gray-700 bg-white outline-none"
          >
            {WIZARD_FONTS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <SliderField value={config.fullNamesSize} onChange={(v) => updateConfig("fullNamesSize", v)} min={8} max={48} />
      </div>
    </div>
  )
}
