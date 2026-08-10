"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2, XCircle, PauseCircle, Loader2, ChevronDown,
  FileText, RotateCcw, Pencil, Trash2, Upload, X, Building2,
} from "lucide-react"
import type { BusinessType } from "@prisma/client"

interface Props {
  partnerId: string
  currentStatus: string
  currentRate: number
}

export function PartnerStatusActions({ partnerId, currentStatus, currentRate }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [rate, setRate] = useState((currentRate / 100).toFixed(2))
  const [showRate, setShowRate] = useState(false)

  async function updatePartner(payload: Record<string, unknown>, label: string) {
    if (loading) return
    setLoading(label)
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        alert(data.error ?? `Gagal: ${label}`)
      }
    } finally {
      setLoading(null)
    }
  }

  async function saveRate() {
    const rmValue = parseFloat(rate)
    if (isNaN(rmValue) || rmValue < 0) { alert("Kadar mestilah 0 atau lebih"); return }
    await updatePartner({ partnerRate: Math.round(rmValue * 100) }, "rate")
    setShowRate(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus !== "ACTIVE" && (
        <button onClick={() => updatePartner({ status: "ACTIVE" }, "approve")} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Lulus
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button onClick={() => updatePartner({ status: "REJECTED" }, "reject")} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          Tolak
        </button>
      )}
      {currentStatus === "ACTIVE" && (
        <button onClick={() => updatePartner({ status: "SUSPENDED" }, "suspend")} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "suspend" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PauseCircle className="w-3.5 h-3.5" />}
          Gantung
        </button>
      )}
      {currentStatus === "SUSPENDED" && (
        <button onClick={() => updatePartner({ status: "ACTIVE" }, "reactivate")} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "reactivate" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          Aktifkan Semula
        </button>
      )}

      <div className="relative">
        <button onClick={() => setShowRate((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors">
          Edit Kadar <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {showRate && (
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[200px]">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kadar (RM / kad)</label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">RM</span>
                <input type="number" min="0" step="0.50" value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <button onClick={saveRate} disabled={loading === "rate"}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg font-semibold disabled:opacity-50">
                {loading === "rate" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Edit partner details modal
// ---------------------------------------------------------------------------

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  BUSINESS_CARD:  "Business Card",
  EVENT_SPACE:    "Event Space",
  EVENT_PLANNER:  "Event Planner",
  VENDOR:         "Vendor",
  OTHERS:         "Others",
}

interface PartnerEditProps {
  partner: {
    id: string
    companyName: string
    contactPerson: string
    email: string
    phone: string
    businessType: BusinessType
    slug: string
    logo: string | null
    address: string | null
    registrationNumber: string | null
    website: string | null
    instagram: string | null
    facebook: string | null
  }
}

export function PartnerEditButton({ partner }: PartnerEditProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    companyName:        partner.companyName,
    contactPerson:      partner.contactPerson,
    email:              partner.email,
    phone:              partner.phone,
    businessType:       partner.businessType,
    slug:               partner.slug,
    logo:               partner.logo ?? "",
    address:            partner.address ?? "",
    registrationNumber: partner.registrationNumber ?? "",
    website:            partner.website ?? "",
    instagram:          partner.instagram ?? "",
    facebook:           partner.facebook ?? "",
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function uploadLogo(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) { alert(data.error ?? "Upload gagal"); return }
      setForm((f) => ({ ...f, logo: data.url ?? "" }))
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    setError("")
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        companyName:        form.companyName,
        contactPerson:      form.contactPerson,
        email:              form.email,
        phone:              form.phone,
        businessType:       form.businessType,
        slug:               form.slug,
        logo:               form.logo || null,
        address:            form.address || null,
        registrationNumber: form.registrationNumber || null,
        website:            form.website || null,
        instagram:          form.instagram || null,
        facebook:           form.facebook || null,
      }
      const res = await fetch(`/api/admin/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setError(data.error ?? "Simpan gagal")
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Edit Partner</h2>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Logo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Logo</label>
            <div className="flex items-center gap-3">
              {form.logo ? (
                <img src={form.logo} alt="logo" className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-indigo-300" />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploading ? "Muat naik..." : "Tukar Logo"}
                </button>
                {form.logo && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, logo: "" }))}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Buang
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }}
              />
            </div>
          </div>

          {/* Core fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama Syarikat" value={form.companyName} onChange={(v) => set("companyName", v)} required />
            <Field label="Pegawai Hubungi" value={form.contactPerson} onChange={(v) => set("contactPerson", v)} required />
            <Field label="E-mel" value={form.email} onChange={(v) => set("email", v)} type="email" required />
            <Field label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} required />
            <Field label="Slug (subdomain)" value={form.slug} onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required hint="huruf kecil, nombor, sempang sahaja" />
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Jenis Perniagaan</label>
              <select
                value={form.businessType}
                onChange={(e) => set("businessType", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              >
                {(Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map((k) => (
                  <option key={k} value={k}>{BUSINESS_TYPE_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional fields */}
          <Field label="No. Pendaftaran" value={form.registrationNumber} onChange={(v) => set("registrationNumber", v)} />
          <Field label="Alamat" value={form.address} onChange={(v) => set("address", v)} multiline />
          <Field label="Laman Web" value={form.website} onChange={(v) => set("website", v)} type="url" />
          <Field label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} hint="@handle" />
          <Field label="Facebook" value={form.facebook} onChange={(v) => set("facebook", v)} />
        </div>

        {error && (
          <p className="px-6 py-2 text-sm text-red-600 bg-red-50 border-t border-red-100">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 font-medium transition-colors">
            Batal
          </button>
          <button onClick={save} disabled={saving || uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Delete partner button
// ---------------------------------------------------------------------------

interface DeletePartnerProps {
  partnerId: string
  companyName: string
}

export function DeletePartnerButton({ partnerId, companyName }: DeletePartnerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Padam partner "${companyName}"? Tindakan ini tidak boleh dibatalkan.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/admin/partners")
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        alert(data.error ?? "Padam gagal")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-semibold transition-colors"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      Padam
    </button>
  )
}

// ---------------------------------------------------------------------------
// Invoice components (unchanged)
// ---------------------------------------------------------------------------

interface GenerateInvoiceProps {
  partnerId: string
  defaultPeriod: string
}

export function GenerateInvoiceButton({ partnerId, defaultPeriod }: GenerateInvoiceProps) {
  const router = useRouter()
  const [period, setPeriod] = useState(defaultPeriod)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function generate() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/billing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, billingPeriod: period }),
      })
      const data = await res.json() as { invoice?: { invoiceNumber: string }; error?: string }
      if (res.ok) {
        router.refresh()
      } else {
        setError(data.error ?? "Jana invois gagal")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <input
          type="month"
          value={period}
          onChange={(e) => { setPeriod(e.target.value); setError("") }}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
        />
        <button onClick={generate} disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          Jana Invois
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface InvoiceActionsProps {
  invoiceId: string
  currentStatus: string
}

export function InvoiceActions({ invoiceId, currentStatus }: InvoiceActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function update(status: string, label: string) {
    if (!confirm(`Tandakan invois ini sebagai "${label}"?`)) return
    setLoading(label)
    try {
      const res = await fetch(`/api/admin/billing/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        alert(data.error ?? "Gagal kemaskini invois")
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentStatus === "ISSUED" && (
        <button onClick={() => update("PAID", "Dibayar")} disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "Dibayar" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          Dibayar
        </button>
      )}
      {(currentStatus === "ISSUED" || currentStatus === "DRAFT") && (
        <button onClick={() => update("VOID", "Dibatal")} disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 text-xs font-semibold transition-colors">
          {loading === "Dibatal" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
          Batal
        </button>
      )}
      {currentStatus === "OVERDUE" && (
        <button onClick={() => update("PAID", "Dibayar")} disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "Dibayar" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          Dibayar
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared field component
// ---------------------------------------------------------------------------

function Field({
  label, value, onChange, type = "text", required, hint, multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  hint?: string
  multiline?: boolean
}) {
  const base = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={base} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}
