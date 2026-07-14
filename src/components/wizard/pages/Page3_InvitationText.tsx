"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { FontSelect } from "../shared/FontSelect"
import { WizardInput } from "../shared/WizardInput"
import { SimpleRichText } from "../shared/SimpleRichText"

const DIVIDER = <div className="border-t border-gray-100" />

export function Page3_InvitationText() {
  const { config, updateConfig } = useWizardStore()
  const isMs = config.language === "ms"

  return (
    <div className="space-y-6">
      {/* Opening Speech */}
      <div>
        <FieldLabel label={isMs ? "Pembuka Ucapan" : "Opening Speech"} />
        <SimpleRichText
          value={config.openingSpeech}
          onChange={(v) => updateConfig("openingSpeech", v)}
          placeholder="Walimatul Urus"
          rows={3}
        />
      </div>

      {DIVIDER}

      {/* Number of Organizers */}
      <div>
        <FieldLabel label={isMs ? "Bilangan Penganjur" : "Number of Organisers"} required />
        <div className="flex gap-6 mt-1">
          {([1, 2] as const).map((count) => (
            <label key={count} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="organizerCount"
                checked={config.organizerCount === count}
                onChange={() => updateConfig("organizerCount", count)}
                className="accent-[#2563eb]"
              />
              <span className="text-sm text-gray-700">{count === 1 ? (isMs ? "Satu" : "One") : (isMs ? "Dua" : "Two")}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Organizer 1 */}
      <div className="space-y-2">
        <div>
          <FieldLabel label={isMs ? "Nama Penganjur (jika ada)" : "Organiser Name (if any)"} />
          <WizardInput
            value={config.organizer1.name}
            onChange={(e) => updateConfig("organizer1", { ...config.organizer1, name: e.target.value })}
            placeholder="Azman bin Ahmad & Norazrina binti Jaalam"
          />
        </div>
        <div>
          <FieldLabel label={isMs ? "Hubungan (jika ada)" : "Relationship (if any)"} />
          <WizardInput
            value={config.organizer1.relationship}
            onChange={(e) => updateConfig("organizer1", { ...config.organizer1, relationship: e.target.value })}
            placeholder="Bapa Pengantin Lelaki & Ibu Pengantin Lelaki"
          />
        </div>
      </div>

      {/* Organizer 2 (conditional) */}
      {config.organizerCount === 2 && (
        <div className="space-y-2">
          <div>
            <FieldLabel label={isMs ? "Nama Penganjur #2 (jika ada)" : "Organiser #2 Name (if any)"} />
            <WizardInput
              value={config.organizer2.name}
              onChange={(e) => updateConfig("organizer2", { ...config.organizer2, name: e.target.value })}
              placeholder="Allahyarham Dr Mohd Fauzi bin Abdullah & Rahmawati"
            />
          </div>
          <div>
            <FieldLabel label={isMs ? "Hubungan (jika ada)" : "Relationship (if any)"} />
            <WizardInput
              value={config.organizer2.relationship}
              onChange={(e) => updateConfig("organizer2", { ...config.organizer2, relationship: e.target.value })}
              placeholder="Bapa Pengantin Perempuan & Ibu Pengantin Perempuan"
            />
          </div>
        </div>
      )}

      {/* Organizer font + size */}
      <FontSelect
        value={config.organizerFont}
        onChange={(font) => updateConfig("organizerFont", font)}
        className="w-full"
      />
      <SliderField value={config.organizerSize} onChange={(v) => updateConfig("organizerSize", v)} min={8} max={48} />

      {DIVIDER}

      {/* Invitation Speech */}
      <div>
        <FieldLabel label={isMs ? "Ayat Ucapan" : "Invitation Text"} required />
        <SimpleRichText
          value={config.invitationSpeech}
          onChange={(v) => updateConfig("invitationSpeech", v)}
          placeholder="Dengan penuh kesyukuran, kami mempersilakan..."
          rows={5}
        />
      </div>

      {DIVIDER}

      {/* Full Names */}
      <div>
        <FieldLabel label={isMs ? "Nama Penuh (jika ada)" : "Full Name (if any)"} info />
        <WizardInput
          value={config.fullNames}
          onChange={(e) => updateConfig("fullNames", e.target.value)}
          placeholder="Arfan bin Azman & Rafeka binti Mohd Fauzi"
        />
        <div className="mt-2">
          <FontSelect
            value={config.fullNamesFont}
            onChange={(font) => updateConfig("fullNamesFont", font)}
            className="w-full"
            sampleText={config.fullNames?.split("\n")[0] || "Ahmad bin Ali & Nurul binti Hassan"}
          />
        </div>
        <SliderField value={config.fullNamesSize} onChange={(v) => updateConfig("fullNamesSize", v)} min={8} max={48} />
      </div>
    </div>
  )
}
