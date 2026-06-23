"use client"

import { useEffect, useState } from "react"
import { Gift, Trash2, Plus, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import type { GiftItem } from "@/types/invitation"

export function Page10_Gift() {
  const cardSlug = useWizardStore((s) => s.cardSlug)

  const [items, setItems] = useState<GiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ imageUrl: "", link: "", label: "" })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    if (!cardSlug) return
    setLoading(true)
    fetch(`/api/gifts/${cardSlug}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [cardSlug])

  async function handleAdd() {
    setFormError("")
    if (!form.imageUrl.trim()) { setFormError("URL gambar diperlukan"); return }
    if (!form.link.trim()) { setFormError("Pautan diperlukan"); return }

    let linkUrl = form.link.trim()
    if (!/^https?:\/\//i.test(linkUrl)) linkUrl = "https://" + linkUrl

    setAdding(true)
    try {
      const res = await fetch(`/api/gifts/${cardSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: form.imageUrl.trim(),
          link: linkUrl,
          label: form.label.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      const { item } = await res.json()
      setItems((prev) => [...prev, item])
      setForm({ imageUrl: "", link: "", label: "" })
    } catch {
      setFormError("Gagal menambah item. Cuba semula.")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await fetch(`/api/gifts/${cardSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    } catch {
      fetch(`/api/gifts/${cardSlug}`)
        .then((r) => r.json())
        .then((d) => setItems(d.items ?? []))
    }
  }

  return (
    <div className="space-y-6">

      {/* Info */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Tetapkan Senarai Hadiah</p>
          <p>Tambah gambar (nisbah 1:1) dan pautan untuk setiap hadiah. Tetamu akan melihat ini apabila mengetik ikon hadiah pada footer kad.</p>
        </div>
      </div>

      {/* Existing items */}
      <div>
        <FieldLabel label="Item Hadiah" />

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-gray-300 border border-dashed border-gray-200 rounded-xl">
            <Gift className="w-9 h-9" />
            <p className="text-sm text-gray-400">Tiada item hadiah lagi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border border-gray-200 rounded-xl p-2.5 bg-white"
              >
                {/* 1:1 image */}
                <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.label ?? "gift"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement
                      el.style.display = "none"
                      el.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg></div>`
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.label || "—"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{item.link}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    title="Buka pautan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Padam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Add new item */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Tambah Item Baru</p>

        {/* Image URL */}
        <div>
          <FieldLabel label="URL Gambar (nisbah 1:1)" />
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="https://example.com/image.jpg"
          />

          {/* Live 1:1 preview */}
          {form.imageUrl && (
            <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3" }}
              />
            </div>
          )}
        </div>

        {/* Link */}
        <div>
          <FieldLabel label="Pautan (URL)" />
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="https://shopee.com.my/wishlist"
          />
        </div>

        {/* Label */}
        <div>
          <FieldLabel label="Label (pilihan)" />
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="cth: Shopee Wishlist, Lazada, dll."
          />
        </div>

        {formError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {formError}
          </p>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {adding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Tambah Item Hadiah
        </button>
      </div>
    </div>
  )
}
