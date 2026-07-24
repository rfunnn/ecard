"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { ColorField } from "../shared/ColorField"
import { DisplayFontPicker } from "../shared/DisplayFontPicker"
import { WizardInput } from "../shared/WizardInput"
import { WizardTextarea } from "../shared/WizardTextarea"

const DIVIDER = <div className="border-t border-gray-100" />

export function Page2_FrontPage() {
  const { config, updateConfig } = useWizardStore()
  const isMs = config.language === "ms"

  return (
    <div className="space-y-6">
      {/* Front Page Content Offset */}
      <div>
        <FieldLabel label={isMs ? "Geser Kandungan Atas/Bawah" : "Move Content Up / Down"} />
        <SliderField
          value={config.frontPageContentOffset ?? 0}
          onChange={(v) => updateConfig("frontPageContentOffset", v)}
          min={-200}
          max={200}
          step={4}
          unit="px"
        />
        <p className="text-[11px] text-gray-400 mt-1">
          {isMs ? "Nilai negatif geser kandungan ke atas, positif ke bawah." : "Negative moves content up, positive moves it down."}
        </p>
      </div>

      {DIVIDER}

      {/* Event Type */}
      <div>
        <FieldLabel label={isMs ? "Jenis Majlis" : "Event Type"} />
        <WizardTextarea
          value={config.eventType}
          onChange={(e) => updateConfig("eventType", e.target.value)}
          rows={2}
          className="text-center"
          placeholder="Walimatul Urus"
        />
        <SliderField value={config.eventTypeSize} onChange={(v) => updateConfig("eventTypeSize", v)} min={8} max={48} />
      </div>

      {DIVIDER}

      {/* Display Name */}
      <div>
        <FieldLabel label={isMs ? "Nama Panggilan" : "Display Name"} required info />
        <WizardInput
          value={config.displayName}
          onChange={(e) => updateConfig("displayName", e.target.value)}
          placeholder="Arfan & Rafeka"
        />
        <DisplayFontPicker
          value={config.displayNameFont}
          onChange={(font) => updateConfig("displayNameFont", font)}
          sampleText={config.displayName || "Ahmad & Nurul"}
        />
        <div className="flex items-center justify-between mt-3">
          <FieldLabel label={isMs ? "Warna" : "Color"} />
          <ColorField value={config.displayNameColor} onChange={(v) => updateConfig("displayNameColor", v)} />
        </div>
        <SliderField value={config.displayNameSize} onChange={(v) => updateConfig("displayNameSize", v)} min={16} max={80} />
      </div>

      {DIVIDER}

      {/* Start DateTime */}
      <div>
        <FieldLabel label={isMs ? "Tarikh & Waktu Majlis Bermula" : "Event Start Date & Time"} required />
        <WizardInput
          type="datetime-local"
          value={config.startDateTime}
          onChange={(e) => updateConfig("startDateTime", e.target.value)}
          className="text-gray-700"
        />
      </div>

      {/* End DateTime */}
      <div>
        <FieldLabel label={isMs ? "Tarikh & Waktu Majlis Berakhir" : "Event End Date & Time"} required />
        <WizardInput
          type="datetime-local"
          value={config.endDateTime}
          onChange={(e) => updateConfig("endDateTime", e.target.value)}
          className="text-gray-700"
        />
      </div>

      {DIVIDER}

      {/* Day & Date display text */}
      <div>
        <FieldLabel label={isMs ? "Hari & Tarikh" : "Day & Date"} />
        <WizardTextarea
          value={config.dayAndDate}
          onChange={(e) => updateConfig("dayAndDate", e.target.value)}
          rows={2}
          className="text-center"
          placeholder={"Ahad\n12 Januari 2025"}
        />
        <SliderField value={config.dayAndDateSize} onChange={(v) => updateConfig("dayAndDateSize", v)} min={8} max={48} />
      </div>

      {/* Venue line */}
      <div>
        <FieldLabel label={isMs ? "Nama Tempat/Hashtag/dll (jika ada)" : "Venue Name/Hashtag/etc. (if any)"} />
        <WizardTextarea
          value={config.venueLine}
          onChange={(e) => updateConfig("venueLine", e.target.value)}
          rows={2}
          className="text-center"
          placeholder={"Dataran Gangsa\nMelaka"}
        />
        <FieldLabel label={isMs ? "Saiz Fon" : "Font Size"} />
        <SliderField value={config.venueLineSize} onChange={(v) => updateConfig("venueLineSize", v)} min={8} max={36} />
      </div>
    </div>
  )
}
