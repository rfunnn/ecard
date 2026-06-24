"use client"

import { useRef, useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"

interface Props {
  label: string
  value?: string
  onChange: (url: string) => void
  required?: boolean
}

const EXPECTED_RATIO = 16 / 9 // height / width for 9:16 portrait
const RATIO_TOLERANCE = 0.08

function checkRatio(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = img.height / img.width
      if (Math.abs(ratio - EXPECTED_RATIO) > RATIO_TOLERANCE * EXPECTED_RATIO) {
        resolve(
          `Nisbah imej tidak sesuai (${img.width}×${img.height}). Diperlukan nisbah 9:16 seperti 1080×1920`
        )
      } else {
        resolve(null)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

export function ImageUploader({ label, value, onChange, required }: Props) {
  const inputRef = useRef<HTMLInputElement | undefined>(undefined)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file: File) => {
    // If the current value is a leftover blob URL from a failed upload, revoke it now
    if (value?.startsWith("blob:")) URL.revokeObjectURL(value)

    setError(null)

    if (!file.type.startsWith("image/")) {
      setError("Hanya fail imej dibenarkan")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Fail terlalu besar (had 5 MB)")
      return
    }

    const ratioError = await checkRatio(file)
    if (ratioError) {
      setError(ratioError)
      return
    }

    // Show local preview immediately so the phone frame updates without waiting for the upload
    const objectUrl = URL.createObjectURL(file)
    onChange(objectUrl)

    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload gagal")
      URL.revokeObjectURL(objectUrl)
      onChange(data.url as string)
    } catch (e) {
      // Keep the blob URL in state so the preview stays visible even if upload fails.
      // It will be revoked the next time the user picks a file or removes the image.
      setError(e instanceof Error ? e.message : "Upload gagal")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    if (value?.startsWith("blob:")) URL.revokeObjectURL(value)
    onChange("")
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* 9:16 frame */}
      <div
        className="relative mx-auto"
        style={{ width: "140px", aspectRatio: "9/16" }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover rounded-xl border border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              title="Buang imej"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => !uploading && inputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1.5 inset-x-1.5 py-1 bg-black/60 hover:bg-black/80 disabled:opacity-60 rounded-lg text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              {uploading ? <><Loader2 className="w-3 h-3 animate-spin" /> Memuat...</> : "Tukar"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            disabled={uploading}
            className={`absolute inset-0 w-full h-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
              dragOver
                ? "border-amber-400 bg-amber-50"
                : "border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50"
            } disabled:opacity-60`}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 text-center px-2 leading-tight">
                  Klik atau seret<br />gambar 9:16
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      <p className="text-xs text-gray-400 text-center">
        JPEG/PNG/WebP · Max 5 MB · Nisbah 9:16
      </p>

      <input
        ref={(el) => { if (el) inputRef.current = el }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
