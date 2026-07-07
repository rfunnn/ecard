"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Save, Trash2, Lock, Unlock, Loader2, AlertCircle } from "lucide-react"
import { ImageUploader } from "./ImageUploader"
import { ScrollConfigEditor } from "./ScrollConfigEditor"
import { TemplatePreview } from "./TemplatePreview"
import type { AdminTemplate, TemplateDisplayConfig } from "@/types/template-admin"
import { DEFAULT_DISPLAY_CONFIG } from "@/types/template-admin"

interface Props {
  initialData?: AdminTemplate
}

function nameToSlugBase(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const CATEGORIES = [
  { value: "WEDDING",   label: "Perkahwinan" },
  { value: "BIRTHDAY",  label: "Hari Lahir" },
  { value: "CORPORATE", label: "Korporat" },
  { value: "GENERIC",   label: "Umum" },
]

export function TemplateForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData

  const [name,          setName]          = useState(initialData?.name ?? "")
  const [nameMs,        setNameMs]        = useState(initialData?.nameMs ?? "")
  const [slug,          setSlug]          = useState(initialData?.slug ?? "")
  const [slugLocked,    setSlugLocked]    = useState(isEdit)
  const [category,      setCategory]      = useState(initialData?.category ?? "WEDDING")
  const [sortOrder,     setSortOrder]     = useState(initialData?.sortOrder ?? 0)
  const [isActive,      setIsActive]      = useState(initialData?.isActive ?? true)
  const [image1Url,     setImage1Url]     = useState(initialData?.image1Url ?? "")
  const [image2Url,     setImage2Url]     = useState(initialData?.image2Url ?? "")
  const [displayConfig, setDisplayConfig] = useState<TemplateDisplayConfig>(
    (initialData?.displayConfig as TemplateDisplayConfig | undefined) ?? DEFAULT_DISPLAY_CONFIG
  )

  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [canForce,   setCanForce]   = useState(false)
  const [cardCount,  setCardCount]  = useState(0)

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugLocked) setSlug(nameToSlugBase(v))
  }

  const handleSave = useCallback(async () => {
    setError(null)
    if (!name.trim()) { setError("Nama template diperlukan"); return }
    if (!image1Url)                  { setError("Imej 1 diperlukan"); return }
    if (image1Url.startsWith("blob:")) { setError("Sila tunggu muat naik Imej 1 selesai"); return }
    if (!image2Url)                  { setError("Imej 2 diperlukan"); return }
    if (image2Url.startsWith("blob:")) { setError("Sila tunggu muat naik Imej 2 selesai"); return }

    setSaving(true)
    try {
      const url   = isEdit ? `/api/admin/templates/${initialData.id}` : "/api/admin/templates"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nameMs: nameMs.trim() || name.trim(),
          slug: slug.trim() || undefined,
          category,
          isActive,
          sortOrder,
          image1Url: image1Url || undefined,
          image2Url: image2Url || undefined,
          displayConfig,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(
        typeof data.error === "string" ? data.error : "Gagal menyimpan"
      )
      router.push("/admin/templates")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ralat tidak diketahui")
    } finally {
      setSaving(false)
    }
  }, [name, nameMs, slug, category, isActive, sortOrder, image1Url, image2Url, displayConfig, isEdit, initialData, router])

  const handleDelete = async (force = false) => {
    if (!initialData) return
    const confirmMsg = force
      ? `Padam template "${name}" bersama ${cardCount} kad? Tindakan ini tidak boleh dibatalkan.`
      : `Padam template "${name}"? Tindakan ini tidak boleh dibatalkan.`
    if (!confirm(confirmMsg)) return
    setDeleting(true)
    setError(null)
    setCanForce(false)
    try {
      const url = `/api/admin/templates/${initialData.id}${force ? "?force=true" : ""}`
      const res = await fetch(url, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        if (data.canForce) {
          setCanForce(true)
          setCardCount(data.cardCount ?? 0)
        }
        throw new Error(typeof data.error === "string" ? data.error : "Gagal memadam")
      }
      router.push("/admin/templates")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ralat tidak diketahui")
    } finally {
      setDeleting(false)
    }
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1"
  const sectionCls = "bg-white rounded-xl border border-gray-200 p-5 space-y-4"
  const sectionHeadingCls = "text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Template" : "Template Baru"}
          </h1>
          {isEdit && (
            <p className="text-sm text-gray-500 font-mono mt-0.5">{initialData.slug}</p>
          )}
        </div>
        <Link
          href="/admin/templates"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Kembali
        </Link>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span>{error}</span>
            {canForce && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => handleDelete(true)}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Padam paksa (termasuk {cardCount} kad)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">

        {/* ── Left: form ── */}
        <div className="space-y-5">

          {/* A. Basic Info */}
          <div className={sectionCls}>
            <h2 className={sectionHeadingCls}>A · Maklumat Asas</h2>

            <div>
              <label className={labelCls}>Nama Template (EN)</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Wedding Classic"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Nama Template (MS)</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Perkahwinan Klasik (kosongkan = sama seperti EN)"
                value={nameMs}
                onChange={(e) => setNameMs(e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Slug</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={`${inputCls} font-mono`}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={slugLocked}
                  placeholder="auto-generate dari nama"
                />
                <button
                  type="button"
                  onClick={() => setSlugLocked((l) => !l)}
                  className="shrink-0 px-3 border border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors"
                  title={slugLocked ? "Buka kunci untuk edit" : "Kunci slug"}
                >
                  {slugLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Kategori</label>
                <select
                  className={inputCls}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Susunan</label>
                <input
                  type="number"
                  className={inputCls}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive((a) => !a)}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  isActive ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">{isActive ? "Aktif" : "Tidak Aktif"}</span>
            </div>
          </div>

          {/* B. Image Upload */}
          <div className={sectionCls}>
            <h2 className={sectionHeadingCls}>B · Muat Naik Imej (potret)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ImageUploader
                label="Imej 1 — Skrin Depan"
                value={image1Url}
                onChange={setImage1Url}
                required
              />
              <ImageUploader
                label="Imej 2 — Latar Tatal"
                value={image2Url}
                onChange={setImage2Url}
                required
              />
            </div>
          </div>

          {/* C. Display Config */}
          <div className={sectionCls}>
            <h2 className={sectionHeadingCls}>C · Tetapan Tatal &amp; Kandungan</h2>
            <ScrollConfigEditor value={displayConfig} onChange={setDisplayConfig} />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 pb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="w-4 h-4" /> Simpan Template</>
                )}
              </button>
              <Link
                href="/admin/templates"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Batal
              </Link>
            </div>

            {isEdit && (
              <button
                type="button"
                onClick={() => handleDelete()}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 border border-red-200 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {deleting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memadam...</>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /> Padam</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Right: live preview (sticky) ── */}
        <div className="lg:sticky lg:top-20">
          <TemplatePreview
            image1Url={image1Url || undefined}
            image2Url={image2Url || undefined}
            config={displayConfig}
            name={name}
            slug={slug}
            category={category}
          />
        </div>
      </div>
    </div>
  )
}
