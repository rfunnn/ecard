"use client"

import { useState, useEffect } from "react"
import { Loader2, Save, ExternalLink, CheckCircle2, SlidersHorizontal } from "lucide-react"

interface TemplateOption {
  id: string
  slug: string
  name: string
  nameMs: string
  category: string
  thumbnail: string
  image1Url: string | null
  image2Url: string | null
  defaultConfig: { primaryColor?: string; bgColor?: string }
}

// ─── Inline phone frame (avoids import issues) ────────────────────────────────

function PhonePreview({ template }: { template: TemplateOption | null }) {
  if (!template) {
    return (
      <div
        className="relative mx-auto rounded-[22px] bg-gray-200 border-4 border-gray-300 overflow-hidden flex items-center justify-center"
        style={{ width: 120, aspectRatio: "9/19.5" }}
      >
        <p className="text-[9px] text-gray-400 text-center px-2">Pilih templat</p>
      </div>
    )
  }

  const accent = template.defaultConfig?.primaryColor ?? "#D4AF37"
  const bg = template.defaultConfig?.bgColor ?? "#1a0a00"

  return (
    <div className="relative mx-auto" style={{ width: 120, aspectRatio: "9/19.5" }}>
      <div
        className="absolute inset-0 rounded-[22px] shadow-xl overflow-hidden"
        style={{ border: "4px solid #2d2d2d", background: bg }}
      >
        <div className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="w-10 h-2.5 bg-[#2d2d2d] rounded-b-xl" />
        </div>
        {template.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnail}
            alt={template.nameMs}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3" style={{ background: bg }}>
            <p className="text-[7px] uppercase tracking-[0.2em] opacity-50 mb-2" style={{ color: accent }}>
              {template.category === "WEDDING" ? "Walimatul Urus" : "Jemputan"}
            </p>
            <p className="text-[13px] leading-tight font-serif" style={{ color: accent }}>Adam & Hawa</p>
            <div className="mt-2 w-8 h-px opacity-25" style={{ background: accent }} />
          </div>
        )}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center z-10">
          <div className="w-8 h-0.5 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="absolute left-[-3px] top-[18%] w-[3px] h-3 bg-gray-600 rounded-l-sm" />
      <div className="absolute left-[-3px] top-[27%] w-[3px] h-5 bg-gray-600 rounded-l-sm" />
      <div className="absolute right-[-3px] top-[24%] w-[3px] h-6 bg-gray-600 rounded-r-sm" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoSettingsPage() {
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [slug1, setSlug1] = useState("")
  const [slug2, setSlug2] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/demo-settings")
      .then((r) => r.json())
      .then((d) => {
        setTemplates(d.templates ?? [])
        setSlug1(d.config?.demoSlug1 ?? "")
        setSlug2(d.config?.demoSlug2 ?? "")
      })
      .catch(() => setError("Gagal memuatkan data."))
      .finally(() => setLoading(false))
  }, [])

  const template1 = templates.find((t) => t.slug === slug1) ?? null
  const template2 = templates.find((t) => t.slug === slug2) ?? null

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError("")
    try {
      const res = await fetch("/api/admin/demo-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoSlug1: slug1, demoSlug2: slug2 }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Gagal menyimpan")
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-12">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Memuatkan...</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demo Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tetapkan templat yang dipaparkan pada halaman demo kad jemputan.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Slot 1 */}
        <TemplateSlot
          label="Templat Demo — Muka 1"
          description="Papar pertama pada /invite/demo (tiada parameter templat)"
          value={slug1}
          onChange={setSlug1}
          templates={templates}
          preview={template1}
          demoHref={`/invite/demo${slug1 ? `?template=${slug1}` : ""}`}
        />

        {/* Slot 2 */}
        <TemplateSlot
          label="Templat Demo — Muka 2"
          description="Papar kedua / alternatif pada halaman demo"
          value={slug2}
          onChange={setSlug2}
          templates={templates}
          preview={template2}
          demoHref={slug2 ? `/invite/demo?template=${slug2}` : undefined}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !slug1 || !slug2}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Menyimpan..." : "Simpan Tetapan"}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Tersimpan
          </span>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Pautan Demo</p>
        <div className="space-y-2">
          <DemoLink
            label="Demo Muka 1"
            href={`/invite/demo${slug1 ? `?template=${slug1}` : ""}`}
          />
          {slug2 && (
            <DemoLink
              label="Demo Muka 2"
              href={`/invite/demo?template=${slug2}`}
            />
          )}
          <DemoLink label="Demo Basic"   href="/invite/demo?package=basic" />
          <DemoLink label="Demo Pro"     href="/invite/demo?package=pro" />
          <DemoLink label="Demo Premium" href="/invite/demo?package=premium" />
        </div>
      </div>
    </div>
  )
}

// ─── TemplateSlot ─────────────────────────────────────────────────────────────

function TemplateSlot({
  label,
  description,
  value,
  onChange,
  templates,
  preview,
  demoHref,
}: {
  label: string
  description: string
  value: string
  onChange: (v: string) => void
  templates: TemplateOption[]
  preview: TemplateOption | null
  demoHref?: string
}) {
  const byCategory = templates.reduce<Record<string, TemplateOption[]>>((acc, t) => {
    ;(acc[t.category] ??= []).push(t)
    return acc
  }, {})

  const CAT_LABEL: Record<string, string> = {
    WEDDING: "Perkahwinan",
    BIRTHDAY: "Hari Lahir",
    CORPORATE: "Korporat",
    GENERIC: "Umum",
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>

      <PhonePreview template={preview} />

      {preview && (
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-700">{preview.nameMs || preview.name}</p>
          <p className="text-[11px] text-gray-400">{CAT_LABEL[preview.category] ?? preview.category}</p>
        </div>
      )}

      <div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-amber-400 bg-white"
        >
          <option value="">— Pilih templat —</option>
          {Object.entries(byCategory).map(([cat, list]) => (
            <optgroup key={cat} label={CAT_LABEL[cat] ?? cat}>
              {list.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.nameMs || t.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {preview && (
        <a
          href={`/admin/templates/${preview.id}/author`}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Sesuaikan Builder
        </a>
      )}

      {demoHref && (
        <a
          href={demoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Lihat demo
        </a>
      )}
    </div>
  )
}

function DemoLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 transition-colors group"
    >
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 font-mono">{href}</span>
        <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-amber-400 transition-colors" />
      </div>
    </a>
  )
}
