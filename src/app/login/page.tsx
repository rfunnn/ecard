"use client"

import { Suspense, useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ChevronLeft, Loader2 } from "lucide-react"

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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const router      = useRouter()
  const params      = useSearchParams()
  const callbackUrl = params.get("callbackUrl") ?? "/"

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [gLoading, setGLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError("E-mel atau kata laluan tidak sah.")
      return
    }
    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGoogle() {
    setGLoading(true)
    await signIn("google", { callbackUrl })
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
            <h1 className="font-playfair text-3xl text-[var(--tx-1)] mb-1">Log Masuk</h1>
            <p className="text-sm text-[var(--tx-3)]">Selamat kembali ke ekadku.com</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full flex items-center justify-center gap-2.5 border border-[var(--bd)] bg-[var(--pg-alt)] hover:bg-[var(--sf)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--tx-1)] transition-all disabled:opacity-50 mb-4"
          >
            {gLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            {gLoading ? "Mengalihkan…" : "Teruskan dengan Google"}
          </button>

          {/* divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--bd)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--pg)] px-3 text-xs text-[var(--tx-3)]">atau dengan e-mel</span>
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--tx-2)]">Kata Laluan</label>
                <Link href="/forgot-password" className="text-xs text-[var(--tx-3)] hover:text-gold transition-colors">
                  Lupa kata laluan?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[var(--bd)] bg-[var(--pg-alt)] rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[var(--tx-1)] placeholder-[var(--tx-3)] focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="••••••••"
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
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 text-gold py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sedang log masuk…</> : "Log Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--tx-3)]">
            Belum ada akaun?{" "}
            <Link href="/register" className="text-[var(--tx-1)] font-semibold hover:text-gold transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
