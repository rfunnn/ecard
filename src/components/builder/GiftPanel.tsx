"use client"

import { useEffect, useState } from "react"
import { Gift, Trash2, Plus, ExternalLink, Loader2 } from "lucide-react"
import { useBuilderStore } from "@/store/builderStore"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import type { GiftItem } from "@/types/invitation"

export function GiftPanel() {
  const slug = useBuilderStore((s) => s.card.slug)
  const lang = useBuilderStore((s) => s.card.language) === "ms"

  const [items, setItems] = useState<GiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ imageUrl: "", link: "", label: "" })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/gifts/${slug}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  async function handleAdd() {
    if (!form.imageUrl.trim()) { setFormError(lang ? "URL gambar diperlukan" : "Image URL is required"); return }
    if (!form.link.trim()) { setFormError(lang ? "Pautan diperlukan" : "Link is required"); return }
    setFormError("")
    setAdding(true)
    try {
      const res = await fetch(`/api/gifts/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: form.imageUrl, link: form.link, label: form.label || undefined }),
      })
      if (!res.ok) throw new Error()
      const { item } = await res.json()
      setItems((prev) => [...prev, item])
      setForm({ imageUrl: "", link: "", label: "" })
    } catch {
      setFormError(lang ? "Gagal menambah item" : "Failed to add item")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await fetch(`/api/gifts/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    } catch {
      // optimistic delete failed — refetch
      fetch(`/api/gifts/${slug}`).then((r) => r.json()).then((d) => setItems(d.items ?? []))
    }
  }

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full pb-6">
      <div className="space-y-1 pb-2">
        <h3 className="text-xs font-semibold text-gold/80 uppercase tracking-widest">
          {lang ? "Hadiah" : "Gift"}
        </h3>
        <p className="text-xs text-cream/30">
          {lang
            ? "Tambah gambar dan pautan hadiah. Akan dipaparkan pada butang hadiah di footer kad."
            : "Add gift images and links. Shown when guests tap the gift icon in the card footer."}
        </p>
      </div>

      {/* Existing items */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 text-gold/40 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-cream/20">
          <Gift className="w-8 h-8" />
          <p className="text-xs">{lang ? "Tiada item hadiah lagi" : "No gift items yet"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5"
            >
              {/* 1:1 image preview */}
              <div
                className="w-14 h-14 rounded-lg bg-white/10 shrink-0 overflow-hidden"
                style={{ aspectRatio: "1/1" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.label ?? "gift"}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>

              <div className="flex-1 min-w-0">
                {item.label && (
                  <p className="text-xs text-cream/80 font-medium truncate">{item.label}</p>
                )}
                <p className="text-[10px] text-cream/30 truncate">{item.link}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-cream/30 hover:text-cream/60 hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-cream/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new item form */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <p className="text-xs font-medium text-cream/50 uppercase tracking-wider">
          {lang ? "Tambah Baru" : "Add New"}
        </p>

        <div className="space-y-2">
          <Input
            label={lang ? "URL Gambar (1:1)" : "Image URL (1:1 ratio)"}
            placeholder="https://example.com/image.jpg"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          />

          {/* Live 1:1 preview */}
          {form.imageUrl && (
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 border border-white/10 mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            </div>
          )}

          <Input
            label={lang ? "Pautan (URL)" : "Link (URL)"}
            placeholder="https://example.com/wishlist"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
          />

          <Input
            label={lang ? "Label (pilihan)" : "Label (optional)"}
            placeholder={lang ? "cth: Shopee Wishlist" : "e.g. Shopee Wishlist"}
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />
        </div>

        {formError && (
          <p className="text-xs text-red-400">{formError}</p>
        )}

        <Button
          className="w-full"
          size="sm"
          loading={adding}
          onClick={handleAdd}
        >
          <Plus className="w-3.5 h-3.5" />
          {lang ? "Tambah Item Hadiah" : "Add Gift Item"}
        </Button>
      </div>
    </div>
  )
}
