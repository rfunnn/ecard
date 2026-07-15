/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import { Images, Trash2, Plus, Upload, X, Loader2 } from "lucide-react"
import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { LockedPage } from "../shared/LockedPage"
import { getPackageCapabilities } from "@/types/config"
import type { PhotoItem } from "@/types/invitation"

export function Page11_Photos() {
  const cardSlug        = useWizardStore((s) => s.cardSlug)
  const authoringMode   = useWizardStore((s) => s.authoringMode)
  const photoItems      = useWizardStore((s) => s.photoItems)
  const setPhotoItems   = useWizardStore((s) => s.setPhotoItems)
  const addPhotoItem    = useWizardStore((s) => s.addPhotoItem)
  const removePhotoItem = useWizardStore((s) => s.removePhotoItem)
  const { config, updateConfig } = useWizardStore()
  const caps = getPackageCapabilities(config.packageType)
  const isMs = config.language === "ms"

  const [loading, setLoading]         = useState(true)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [caption, setCaption]         = useState("")
  const [preview, setPreview]         = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | undefined>(undefined)

  useEffect(() => {
    // Authoring a template (or no card yet): photos live only in the store.
    if (authoringMode || !cardSlug) { setLoading(false); return }
    setLoading(true)
    fetch(`/api/photos/${cardSlug}`)
      .then((r) => r.json())
      .then((d) => setPhotoItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [cardSlug, authoringMode, setPhotoItems])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setUploadError(isMs ? "Hanya fail imej dibenarkan." : "Only image files allowed.")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError(isMs ? "Fail terlalu besar (had 8 MB)." : "File too large (max 8 MB).")
      return
    }
    setUploadError(null)
    setPendingFile(file)
    setPreview(URL.createObjectURL(file))
    e.target.value = ""
  }

  function cancelPending() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setPendingFile(null)
    setCaption("")
    setUploadError(null)
  }

  async function confirmUpload() {
    if (!pendingFile) return
    if (!authoringMode && !cardSlug) return
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append("file", pendingFile)
      const upRes = await fetch("/api/upload", { method: "POST", body: form })
      if (!upRes.ok) throw new Error("upload")
      const { url } = await upRes.json() as { url: string }

      if (authoringMode) {
        // Authoring a template: keep the photo in-memory (seeded onto cards later).
        addPhotoItem({ id: crypto.randomUUID(), imageUrl: url, caption: caption.trim() || undefined, sortOrder: photoItems.length })
      } else {
        const saveRes = await fetch(`/api/photos/${cardSlug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url, caption: caption.trim() || undefined }),
        })
        if (!saveRes.ok) throw new Error("save")
        const { item } = await saveRes.json() as { item: PhotoItem }
        addPhotoItem(item)
      }

      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setPendingFile(null)
      setCaption("")
    } catch {
      setUploadError(isMs ? "Gagal muat naik. Cuba semula." : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    removePhotoItem(id)
    if (authoringMode || !cardSlug) return
    await fetch(`/api/photos/${cardSlug}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  if (!caps.photoGallery) {
    return <LockedPage feature={isMs ? "Galeri Foto" : "Photo Gallery"} requiredPlan="Gold (RM60)" />
  }

  const showEnabled = config.segments.photoGallery

  return (
    <div className="space-y-5">
      {/* toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {isMs ? "Tunjukkan Galeri Foto" : "Show Photo Gallery"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isMs ? "Paparan slaid automatik pada kad" : "Auto-sliding gallery on the card"}
          </p>
        </div>
        <button
          onClick={() => updateConfig("segments", { ...config.segments, photoGallery: !showEnabled })}
          className={`relative w-11 h-6 rounded-full transition-colors ${showEnabled ? "bg-blue-500" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showEnabled ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* photo list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : photoItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photoItems.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
              <img src={item.imageUrl} alt={item.caption ?? ""} className="w-full h-full object-cover" />
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1.5 py-1">
                  <p className="text-[9px] text-white truncate">{item.caption}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <Images className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-xs text-gray-400">
            {isMs ? "Tiada foto lagi." : "No photos yet."}
          </p>
        </div>
      )}

      {/* add photo panel */}
      {preview ? (
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          </div>
          <FieldLabel label={isMs ? "Kapsyen (pilihan)" : "Caption (optional)"} />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={isMs ? "Tambah kapsyen..." : "Add caption..."}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          <div className="flex gap-2">
            <button
              onClick={cancelPending}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              {isMs ? "Batal" : "Cancel"}
            </button>
            <button
              onClick={confirmUpload}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {isMs ? "Muat Naik" : "Upload"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl py-3 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isMs ? "Tambah Foto" : "Add Photo"}
        </button>
      )}

      <input
        ref={fileInputRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {photoItems.length > 0 && (
        <p className="text-[10px] text-gray-400 text-center">
          {isMs
            ? `${photoItems.length} foto · Slaid automatik pada kad`
            : `${photoItems.length} photo${photoItems.length !== 1 ? "s" : ""} · Auto-slides on the card`}
        </p>
      )}
    </div>
  )
}
