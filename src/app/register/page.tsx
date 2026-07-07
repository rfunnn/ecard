"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ChevronLeft, Loader2, Check } from "lucide-react"

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: "Sekurang-kurangnya 8 aksara", ok: password.length >= 8 },
    { label: "Mengandungi huruf besar", ok: /[A-Z]/.test(password) },
    { label: "Mengandungi nombor", ok: /\d/.test(password) },
  ]
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1.5">
          <Check className={`w-3 h-3 ${c.ok ? "text-green-500" : "text-[var(--tx-3)]"}`} />
          <span className={`text-[11px] ${c.ok ? "text-green-500" : "text-[var(--tx-3)]"}`}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()

  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [showCf,   setShowCf]   = useState(false)
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [gLoading, setGLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Kata laluan tidak sepadan.")
      return
    }
    if (password.length < 8) {
      setError("Kata laluan mestilah sekurang-kurangnya 8 aksara.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? "Pendaftaran gagal.")
      setLoading(false)
      return
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)

    if (signInRes?.error) {
      router.push("/login")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  async function handleGoogle() {
    setGLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col">
      {/* top bar */}
      <div className="flex items-center px-4 h-12 border-b border-[var(--bd)]">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Link>
        <span className="mx-auto font-playfair text-[15px] text-[var(--tx-1)]">ekadku.com</span>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          {/* heading */}
          <div className="text-center mb-8">
            <h1 className="font-playfair text-3xl text-[var(--tx-1)] mb-1">Daftar Akaun</h1>
            <p className="text-sm text-[var(--tx-3)]">Cipta akaun baharu anda secara percuma</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full flex items-center justify-center gap-2.5 border border-[var(--bd)] bg-[var(--pg-alt)] hover:bg-[var(--sf)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--tx-1)] transition-all disabled:opacity-50 mb-4"
          >
            {gLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            {gLoading ? "Mengalihkan…" : "Daftar dengan Google"}
          </button>

          {/* divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--bd)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--pg)] px-3 text-xs text-[var(--tx-3)]">atau daftar dengan e-mel</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--tx-2)] mb-1.5">Nama Penuh</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[var(--bd)] bg-[var(--pg-alt)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--tx-1)] placeholder-[var(--tx-3)] focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Nama penuh anda"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--tx-2)] mb-1.5">E-mel</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[var(--bd)] bg-[var(--pg-alt)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--tx-1)] placeholder-[var(--tx-3)] focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="anda@contoh.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--tx-2)] mb-1.5">Kata Laluan</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[var(--bd)] bg-[var(--pg-alt)] rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[var(--tx-1)] placeholder-[var(--tx-3)] focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Sekurang-kurangnya 8 aksara"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--tx-2)] mb-1.5">Sahkan Kata Laluan</label>
              <div className="relative">
                <input
                  type={showCf ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[var(--tx-1)] placeholder-[var(--tx-3)] bg-[var(--pg-alt)] focus:outline-none transition-colors ${
                    confirm && confirm !== password
                      ? "border-red-500/50 focus:border-red-500/70"
                      : confirm && confirm === password
                      ? "border-green-500/50 focus:border-green-500/70"
                      : "border-[var(--bd)] focus:border-gold/50"
                  }`}
                  placeholder="Taip semula kata laluan"
                />
                <button
                  type="button"
                  onClick={() => setShowCf((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors"
                  tabIndex={-1}
                >
                  {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-[11px] text-red-500 mt-1">Kata laluan tidak sepadan</p>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 text-gold py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sedang mendaftar…</> : "Daftar Sekarang"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--tx-3)]">
            Sudah ada akaun?{" "}
            <Link href="/login" className="text-[var(--tx-1)] font-semibold hover:text-gold transition-colors">
              Log masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
