"use client"

import { useEffect, useRef, useState } from "react"
import { Gift, Trash2, Plus, Upload, X, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { LockedPage } from "../shared/LockedPage"
import { getPackageCapabilities } from "@/types/config"

function check1to1(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = img.width / img.height
      if (Math.abs(ratio - 1) > 0.15)
        resolve(`Nisbah gambar tidak sesuai (${img.width}×${img.height}). Diperlukan 1:1 (persegi).`)
      else
        resolve(null)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

function BankQrUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement | undefined>(undefined)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    if (file.size > 5 * 1024 * 1024) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) onUploaded(data.url as string)
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      disabled={uploading}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-amber-50 disabled:opacity-50"
    >
      {uploading
        ? <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
        : <><Upload className="w-5 h-5 text-gray-400" /><span className="text-[10px] text-gray-400">QR</span></>
      }
      <input
        ref={(el) => { if (el) ref.current = el }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }}
      />
    </button>
  )
}

export function Page10_Gift() {
  const cardSlug       = useWizardStore((s) => s.cardSlug)
  const giftItems      = useWizardStore((s) => s.giftItems)
  const setGiftItems   = useWizardStore((s) => s.setGiftItems)
  const addGiftItem    = useWizardStore((s) => s.addGiftItem)
  const removeGiftItem = useWizardStore((s) => s.removeGiftItem)
  const { config, updateConfig } = useWizardStore()
  const caps = getPackageCapabilities(config.packageType)

  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ imageUrl: "", link: "", label: "" })
  const [formError, setFormError] = useState("")
  const [imgUploading, setImgUploading] = useState(false)
  const [imgError, setImgError] = useState<string | null>(null)
  const imgInputRef = useRef<HTMLInputElement | undefined>(undefined)

  useEffect(() => {
    if (!cardSlug) return
    setLoading(true)
    fetch(`/api/gifts/${cardSlug}`)
      .then((r) => r.json())
      .then((d) => {
        setGiftItems(d.items ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [cardSlug])

  async function handleImageFile(file: File) {
    if (form.imageUrl.startsWith("blob:")) URL.revokeObjectURL(form.imageUrl)
    setImgError(null)

    if (!file.type.startsWith("image/")) { setImgError("Hanya fail imej dibenarkan"); return }
    if (file.size > 5 * 1024 * 1024) { setImgError("Fail terlalu besar (had 5 MB)"); return }

    const ratioErr = await check1to1(file)
    if (ratioErr) { setImgError(ratioErr); return }

    const blobUrl = URL.createObjectURL(file)
    setForm((f) => ({ ...f, imageUrl: blobUrl }))

    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload gagal")
      URL.revokeObjectURL(blobUrl)
      setForm((f) => ({ ...f, imageUrl: data.url as string }))
    } catch (e) {
      setImgError(e instanceof Error ? e.message : "Upload gagal")
    } finally {
      setImgUploading(false)
    }
  }

  function clearImage() {
    if (form.imageUrl.startsWith("blob:")) URL.revokeObjectURL(form.imageUrl)
    setForm((f) => ({ ...f, imageUrl: "" }))
    setImgError(null)
  }

  async function handleAdd() {
    setFormError("")
    if (!form.imageUrl.trim()) { setFormError("Gambar diperlukan"); return }
    if (form.imageUrl.startsWith("blob:")) { setFormError("Sila tunggu muat naik gambar selesai"); return }
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
      addGiftItem(item)
      setForm({ imageUrl: "", link: "", label: "" })
    } catch {
      setFormError("Gagal menambah item. Cuba semula.")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    removeGiftItem(id)
    try {
      await fetch(`/api/gifts/${cardSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    } catch {
      fetch(`/api/gifts/${cardSlug}`)
        .then((r) => r.json())
        .then((d) => setGiftItems(d.items ?? []))
    }
  }

  if (!caps.wishlist && !caps.moneyGift) {
    return <LockedPage feature="Hadiah & Pembayaran" requiredPlan="Gold (RM60)" />
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

      {/* Delivery address */}
      <div>
        <FieldLabel label="Alamat Penghantaran Hadiah" />
        <p className="text-xs text-gray-400 mb-2">
          Alamat ini ditunjukkan kepada tetamu apabila mereka ingin menempah hadiah melalui pos.
        </p>
        <textarea
          value={config.deliveryAddress}
          onChange={(e) => updateConfig("deliveryAddress", e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          placeholder={"No. 4, Jalan Pahat,\nTaman Gembira, Seksyen 40,\n40150 Shah Alam, Selangor"}
        />
      </div>

      {/* Bank / payment info */}
      <div className="space-y-3">
        <FieldLabel label="Maklumat Bank / Pembayaran" />
        <p className="text-xs text-gray-400 -mt-1">
          Maklumat ini ditunjukkan kepada tetamu dalam bahagian hadiah untuk pemindahan wang.
        </p>

        <input
          type="text"
          value={config.bankName}
          onChange={(e) => updateConfig("bankName", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Nama Bank (cth: Maybank, CIMB, DuitNow)"
        />
        <input
          type="text"
          value={config.bankAccountName}
          onChange={(e) => updateConfig("bankAccountName", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Nama Pemilik Akaun"
        />
        <input
          type="text"
          value={config.bankAccountNumber}
          onChange={(e) => updateConfig("bankAccountNumber", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="No. Akaun / No. Telefon (DuitNow)"
        />

        {/* QR code upload */}
        <div>
          <p className="text-xs text-gray-500 mb-2">QR Code Pembayaran (pilihan)</p>
          <div className="flex items-start gap-3">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 shrink-0">
              {config.bankQrUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={config.bankQrUrl} alt="QR" className="absolute inset-0 w-full h-full object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => updateConfig("bankQrUrl", "")}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <BankQrUpload onUploaded={(url) => updateConfig("bankQrUrl", url)} />
              )}
            </div>
            <p className="text-xs text-gray-400 pt-2 leading-snug">
              Muat naik QR kod bank anda (DuitNow, Maybank QR, dll.).<br />
              JPEG / PNG · Max 5 MB
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Existing items */}
      <div>
        <FieldLabel label="Item Hadiah" />

        {loading && giftItems.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : giftItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-gray-300 border border-dashed border-gray-200 rounded-xl">
            <Gift className="w-9 h-9" />
            <p className="text-sm text-gray-400">Tiada item hadiah lagi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {giftItems.map((item) => (
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

        {/* Image upload */}
        <div>
          <FieldLabel label="Gambar (nisbah 1:1)" />

          <div className="flex items-start gap-3">
            {/* Square picker / preview */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 shrink-0">
              {form.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {imgUploading ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                      title="Buang gambar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  disabled={imgUploading}
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-1 transition-colors hover:bg-amber-50 disabled:opacity-50"
                >
                  {imgUploading ? (
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-gray-400 leading-tight">1:1</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 pt-1 space-y-1.5">
              <p className="text-xs text-gray-500 leading-snug">
                Muat naik gambar persegi (1:1) seperti logo kedai atau produk.<br />
                JPEG / PNG / WebP · Max 5 MB
              </p>
              {!form.imageUrl && !imgUploading && (
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  className="text-xs text-amber-600 underline decoration-amber-400"
                >
                  Pilih fail
                </button>
              )}
            </div>
          </div>

          {imgError && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {imgError}
            </p>
          )}

          <input
            ref={(el) => { if (el) imgInputRef.current = el }}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageFile(file)
              e.target.value = ""
            }}
          />
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
          disabled={adding || imgUploading}
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
