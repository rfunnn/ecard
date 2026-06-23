"use client"

import { useBuilderStore } from "@/store/builderStore"
import { Input, Textarea } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"

export function ContentPanel() {
  const { card, updateContent } = useBuilderStore()
  const isWedding = card.template?.category === "WEDDING"
  const lang = card.language === "ms"

  function field(key: string) {
    return {
      value: (card as Record<string, unknown>)[key] as string ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        updateContent({ [key]: e.target.value }),
    }
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full pb-6">
      <div className="space-y-1 pb-2">
        <h3 className="text-xs font-semibold text-gold/80 uppercase tracking-widest">Kandungan</h3>
        <p className="text-xs text-cream/30">Isi maklumat kad jemputan</p>
      </div>

      <Select
        label="Bahasa / Language"
        value={card.language ?? "ms"}
        onChange={(e) => updateContent({ language: e.target.value })}
        options={[
          { value: "ms", label: "Bahasa Melayu" },
          { value: "en", label: "English" },
        ]}
      />

      <Input
        label={lang ? "Tajuk" : "Title"}
        placeholder={isWedding ? (lang ? "cth: Walimatul Urus" : "e.g. Wedding Reception") : (lang ? "Tajuk majlis" : "Event title")}
        {...field("title")}
      />

      {isWedding && (
        <>
          <Input
            label={lang ? "Nama Pengantin Lelaki" : "Groom's Name"}
            placeholder={lang ? "cth: Ahmad bin Ali" : "e.g. Ahmad bin Ali"}
            {...field("groomName")}
          />
          <Input
            label={lang ? "Nama Pengantin Perempuan" : "Bride's Name"}
            placeholder={lang ? "cth: Siti binti Hassan" : "e.g. Siti binti Hassan"}
            {...field("brideName")}
          />
        </>
      )}

      <Input
        label={lang ? "Subjudul (pilihan)" : "Subtitle (optional)"}
        placeholder={lang ? "Maklumat tambahan" : "Additional info"}
        {...field("subtitle")}
      />

      <div className="h-px bg-white/5" />

      <Input
        type="date"
        label={lang ? "Tarikh Majlis" : "Event Date"}
        {...field("eventDate")}
      />

      <Input
        type="time"
        label={lang ? "Masa Majlis" : "Event Time"}
        {...field("eventTime")}
      />

      <div className="h-px bg-white/5" />

      <Input
        label={lang ? "Nama Tempat" : "Venue Name"}
        placeholder={lang ? "cth: Dewan Seri Murni" : "e.g. Dewan Seri Murni"}
        {...field("venueName")}
      />

      <Textarea
        label={lang ? "Alamat Tempat" : "Venue Address"}
        placeholder={lang ? "Nombor, Jalan, Bandar, Negeri" : "No., Street, City, State"}
        rows={2}
        {...field("venueAddress")}
      />

      <Input
        label={lang ? "Pautan Google Maps (pilihan)" : "Google Maps Link (optional)"}
        placeholder="https://maps.google.com/..."
        {...field("venueMapUrl")}
      />

      <div className="h-px bg-white/5" />

      <Textarea
        label={lang ? "Penerangan" : "Description"}
        placeholder={lang ? "Cerita latar belakang atau mesej..." : "Background story or message..."}
        rows={4}
        {...field("description")}
      />

      <Textarea
        label={lang ? "Nota Kaki (pilihan)" : "Footer Note (optional)"}
        placeholder={lang ? "cth: Hadiah tidak diperlukan..." : "e.g. No gifts necessary..."}
        rows={2}
        {...field("footerNote")}
      />

      <div className="h-px bg-white/5" />

      <Input
        label={lang ? "No. WhatsApp" : "WhatsApp Number"}
        placeholder="+601X-XXXXXXXX"
        {...field("whatsappNumber")}
      />

      <Input
        label={lang ? "Nama Kenalan" : "Contact Name"}
        placeholder={lang ? "cth: Pak Long" : "e.g. Uncle John"}
        {...field("contactName")}
      />
    </div>
  )
}
