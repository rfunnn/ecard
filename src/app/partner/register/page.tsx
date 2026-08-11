"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Globe, AtSign, ChevronLeft, Loader2, Upload, X, Link2 } from "lucide-react"
import { useT } from "@/lib/i18n"

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"

function slugPreview(companyName: string, fallback: string): string {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || fallback
}

const inputCls = "w-full border border-[var(--bd)] bg-[var(--pg)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--tx-1)] placeholder-[var(--tx-3)] focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
const labelCls = "block text-[12px] font-semibold text-[var(--tx-2)] mb-1.5 uppercase tracking-wide"

export default function PartnerRegisterPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const t = useT()
  const r = t.partnerRegister

  const [form, setForm] = useState({
    companyName: "", contactPerson: "", phone: "", email: "",
    businessType: "", registrationNumber: "", address: "",
    website: "", instagram: "", facebook: "",
  })
  const [logo, setLogo]               = useState("")
  const [logoPreview, setLogoPreview] = useState("")
  const [uploading, setUploading]     = useState(false)
  const [error, setError]             = useState("")
  const [loading, setLoading]         = useState(false)

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError(r.errorLogoSize)
      return
    }
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? r.errorUploadFail)
      setLogo(data.url!)
      setLogoPreview(data.url!)
    } catch (err) {
      setError(err instanceof Error ? err.message : r.errorUploadFail)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.businessType) {
      setError(r.errorBusinessType)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logo: logo || undefined }),
      })
      const data = await res.json() as { partner?: { slug: string; companyName: string; businessType: string }; error?: string }

      if (!res.ok) {
        setError(data.error ?? r.errorRegisterFail)
        return
      }

      const p = data.partner!
      router.push(
        `/partner/success?slug=${encodeURIComponent(p.slug)}&name=${encodeURIComponent(p.companyName)}&type=${encodeURIComponent(p.businessType)}`
      )
    } catch {
      setError(r.errorNetwork)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--pg)] py-8 px-5 lg:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {r.backToHome}
          </Link>
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-[var(--tx-3)] mb-2">{r.badge}</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--tx-1)] mb-3">{r.title}</h1>
          <p className="text-sm text-[var(--tx-2)] max-w-md mx-auto leading-relaxed">{r.desc}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Info */}
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-[var(--tx-1)] flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gold" />
              {r.sectionCompany}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>{r.labelCompanyName} *</label>
                <input className={inputCls} placeholder={r.placeholderCompanyName} value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)} required />
                {form.companyName && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--tx-3)]">
                    <Link2 className="w-3 h-3 shrink-0" />
                    {r.subdomainYours}{" "}
                    <span className="font-mono font-semibold text-gold">{slugPreview(form.companyName, r.slugFallback)}.{BASE_DOMAIN}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>{r.labelContactPerson} *</label>
                <input className={inputCls} placeholder={r.placeholderContactPerson} value={form.contactPerson}
                  onChange={(e) => set("contactPerson", e.target.value)} required />
              </div>

              <div>
                <label className={labelCls}>{r.labelPhone} *</label>
                <input className={inputCls} type="tel" placeholder="+60123456789" value={form.phone}
                  onChange={(e) => set("phone", e.target.value)} required />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>{r.labelEmail} *</label>
                <input className={inputCls} type="email" placeholder={r.placeholderEmail} value={form.email}
                  onChange={(e) => set("email", e.target.value)} required />
              </div>

              <div>
                <label className={labelCls}>{r.labelRegNo}</label>
                <input className={inputCls} placeholder={r.placeholderRegNo} value={form.registrationNumber}
                  onChange={(e) => set("registrationNumber", e.target.value)} />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className={labelCls}>{r.labelBusinessType} *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {r.businessTypes.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.businessType === opt.value
                        ? "border-gold/60 bg-gold/5"
                        : "border-[var(--bd)] hover:border-gold/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="businessType"
                      value={opt.value}
                      checked={form.businessType === opt.value}
                      onChange={() => set("businessType", opt.value)}
                      className="mt-0.5 accent-[#FFCC00]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--tx-1)]">{opt.label}</p>
                      <p className="text-[11px] text-[var(--tx-3)] leading-relaxed mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className={labelCls}>{r.labelLogo}</label>
              {logoPreview ? (
                <div className="flex items-center gap-3">
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-[var(--bd)]" />
                  <button type="button" onClick={() => { setLogo(""); setLogoPreview("") }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                    <X className="w-3 h-3" /> {r.logoRemove}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[var(--bd)] hover:border-gold/40 rounded-xl text-sm text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? r.logoUploading : r.logoUpload}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>

          {/* Online Presence */}
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-[var(--tx-1)] flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-gold" />
              {r.sectionOnline}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>{r.labelAddress}</label>
                <textarea className={`${inputCls} resize-none`} rows={2} placeholder={r.placeholderAddress}
                  value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><Globe className="w-3 h-3 inline mr-1" />{r.labelWebsite}</label>
                <input className={inputCls} type="url" placeholder="https://syarikat.com" value={form.website}
                  onChange={(e) => set("website", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><AtSign className="w-3 h-3 inline mr-1" />{r.labelInstagram}</label>
                <input className={inputCls} placeholder="@namahandleanda" value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><Globe className="w-3 h-3 inline mr-1" />{r.labelFacebook}</label>
                <input className={inputCls} placeholder="facebook.com/namasyarikat" value={form.facebook}
                  onChange={(e) => set("facebook", e.target.value)} />
              </div>
            </div>
          </div>

          {form.companyName && (
            <div className="bg-[var(--pg-alt)] border border-gold/25 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-gold shrink-0" />
                <p className="text-sm font-semibold text-[var(--tx-1)]">{r.subdomainTitle}</p>
              </div>
              <div className="bg-[var(--pg)] border border-[var(--bd)] rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-gold break-all">
                  {slugPreview(form.companyName, r.slugFallback)}.{BASE_DOMAIN}
                </span>
              </div>
              <p className="text-xs text-[var(--tx-3)] leading-relaxed">{r.subdomainNote}</p>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "#FFCC00", color: "#141414" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? r.submitting : r.submitBtn}
          </button>

          <p className="text-center text-[11px] text-[var(--tx-3)]">
            {r.alreadyPartner}{" "}
            <Link href="/partner/dashboard" className="text-gold hover:underline">{r.goToDashboard}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
