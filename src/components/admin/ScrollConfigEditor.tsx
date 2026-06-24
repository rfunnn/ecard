"use client"

import { useState } from "react"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import type { TemplateDisplayConfig, ContentBlock } from "@/types/template-admin"

interface Props {
  value: TemplateDisplayConfig
  onChange: (v: TemplateDisplayConfig) => void
}

function ContentBlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[]
  onChange: (b: ContentBlock[]) => void
}) {
  const update = (i: number, patch: Partial<ContentBlock>) => {
    const next = blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b))
    onChange(next)
  }
  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i))
  const add = (type: "text" | "image") =>
    onChange([...blocks, type === "text" ? { type: "text", value: "" } : { type: "image", url: "" }])

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => (
        <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="mt-1 text-[10px] font-semibold text-gray-400 w-10 shrink-0 uppercase">
            {b.type}
          </span>
          {b.type === "text" ? (
            <textarea
              className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
              rows={2}
              placeholder="Masukkan teks..."
              value={b.value ?? ""}
              onChange={(e) => update(i, { value: e.target.value })}
            />
          ) : (
            <input
              type="url"
              className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
              placeholder="https://..."
              value={b.url ?? ""}
              onChange={(e) => update(i, { url: e.target.value })}
            />
          )}
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-0.5 p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => add("text")}
          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Teks
        </button>
        <button
          type="button"
          onClick={() => add("image")}
          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Imej
        </button>
      </div>
    </div>
  )
}

export function ScrollConfigEditor({ value, onChange }: Props) {
  const [jsonOpen, setJsonOpen] = useState(false)

  const set = (path: string[], val: unknown) => {
    const next = structuredClone(value) as unknown as Record<string, unknown>
    let cur: Record<string, unknown> = next
    for (let i = 0; i < path.length - 1; i++) {
      if (cur[path[i]] == null || typeof cur[path[i]] !== "object") cur[path[i]] = {}
      cur = cur[path[i]] as Record<string, unknown>
    }
    cur[path[path.length - 1]] = val
    onChange(next as unknown as TemplateDisplayConfig)
  }

  const { scrollSettings: ss, page1, page2, page3Plus } = value

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1"
  const sectionCls = "space-y-4 border border-gray-200 rounded-xl p-4 bg-white"
  const headingCls = "text-sm font-bold text-gray-800 mb-3"

  return (
    <div className="space-y-4">
      {/* Scroll Settings */}
      <div className={sectionCls}>
        <p className={headingCls}>Tetapan Tatal</p>

        <div>
          <label className={labelCls}>Jenis Peralihan</label>
          <div className="flex gap-3">
            {(["js-listener", "scroll-snap"] as const).map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="transitionType"
                  value={t}
                  checked={ss.transitionType === t}
                  onChange={() => set(["scrollSettings", "transitionType"], t)}
                  className="accent-amber-500"
                />
                <span className="text-sm text-gray-700">
                  {t === "js-listener" ? "JS Listener" : "Scroll Snap"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Ganti Imej Pada:{" "}
            <span className="text-amber-600 font-bold">
              {Math.round(ss.imageSwitchOffset * 100)}%
            </span>{" "}
            pertama imej pertama
          </label>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={ss.imageSwitchOffset}
            onChange={(e) => set(["scrollSettings", "imageSwitchOffset"], parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>30%</span><span>100%</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>Animasi</label>
          <select
            value={ss.animation}
            onChange={(e) => set(["scrollSettings", "animation"], e.target.value)}
            className={inputCls}
          >
            <option value="smooth">Lancar (Smooth)</option>
            <option value="instant">Segera (Instant)</option>
          </select>
        </div>
      </div>

      {/* Page 1 — Overlay text + Opening Animation */}
      <div className={sectionCls}>
        <p className={headingCls}>Imej 1 — Halaman Depan</p>

        {/* Overlay text */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Teks Overlay</p>
        <div>
          <label className={labelCls}>Tajuk</label>
          <input
            type="text"
            className={inputCls}
            placeholder="Contoh: Walimatul Urus"
            value={page1.overlayText.title}
            onChange={(e) => set(["page1", "overlayText", "title"], e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Sari Kata</label>
          <input
            type="text"
            className={inputCls}
            placeholder="Contoh: Ahmad & Nurul"
            value={page1.overlayText.subtitle}
            onChange={(e) => set(["page1", "overlayText", "subtitle"], e.target.value)}
          />
        </div>

        {/* Opening animation */}
        <div className="border-t border-gray-100 pt-4 mt-2 space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gaya Pembukaan</p>

          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "fade",  label: "Pudar Masuk",  desc: "Gelap perlahan hilang" },
              { value: "rise",  label: "Naik",          desc: "Teks naik dari bawah" },
              { value: "split", label: "Tersibak",      desc: "Tabir terbelah kiri-kanan" },
              { value: "zoom",  label: "Zum Masuk",     desc: "Teks membesar muncul" },
            ] as const).map((opt) => {
              const active = (page1.openingAnimation?.style ?? "fade") === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set(["page1", "openingAnimation", "style"], opt.value)}
                  className={`flex flex-col gap-0.5 text-left p-2.5 rounded-lg border-2 transition-colors ${
                    active
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className={`text-xs font-semibold ${active ? "text-amber-700" : "text-gray-700"}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-gray-400 leading-tight">{opt.desc}</span>
                </button>
              )
            })}
          </div>

          <div>
            <label className={labelCls}>
              Tempoh:{" "}
              <span className="text-amber-600 font-bold">
                {(page1.openingAnimation?.duration ?? 1.2).toFixed(1)}s
              </span>
            </label>
            <input
              type="range"
              min={0.5} max={3.0} step={0.1}
              value={page1.openingAnimation?.duration ?? 1.2}
              onChange={(e) => set(["page1", "openingAnimation", "duration"], parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0.5s</span><span>3.0s</span>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Lengah:{" "}
              <span className="text-amber-600 font-bold">
                {(page1.openingAnimation?.delay ?? 0.2).toFixed(1)}s
              </span>
            </label>
            <input
              type="range"
              min={0} max={2.0} step={0.1}
              value={page1.openingAnimation?.delay ?? 0.2}
              onChange={(e) => set(["page1", "openingAnimation", "delay"], parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0s</span><span>2.0s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page 2 content */}
      <div className={sectionCls}>
        <p className={headingCls}>Halaman 2 — Kandungan Skrol (di atas Imej 1)</p>
        <ContentBlockEditor
          blocks={page2.scrollContent}
          onChange={(b) => set(["page2", "scrollContent"], b)}
        />
      </div>

      {/* Page 3+ content */}
      <div className={sectionCls}>
        <p className={headingCls}>Halaman 3+ — Kandungan Skrol (di atas Imej 2)</p>
        <ContentBlockEditor
          blocks={page3Plus.scrollContent}
          onChange={(b) => set(["page3Plus", "scrollContent"], b)}
        />
      </div>

      {/* JSON preview */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setJsonOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition-colors"
        >
          Pratonton JSON
          {jsonOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {jsonOpen && (
          <pre className="p-4 text-xs text-gray-600 bg-gray-900 text-green-400 overflow-auto max-h-64">
            {JSON.stringify(value, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
