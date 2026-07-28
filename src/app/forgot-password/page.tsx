"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Mail } from "lucide-react"
import { useT } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function ForgotPasswordPage() {
  const { auth: a } = useT()
  const [email,   setEmail]   = useState("")
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? a.forgotError)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col">
      {/* top bar */}
      <div className="flex items-center px-4 h-12 border-b border-[var(--bd)]">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {a.backToLogin}
        </Link>
        <span className="mx-auto font-playfair text-[15px] text-[var(--tx-1)]">ekadku.com</span>
        <LanguageSwitcher />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          {sent ? (
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(var(--gold-rgb, 212,175,55), 0.15)", border: "1px solid rgba(var(--gold-rgb, 212,175,55), 0.3)" }}
              >
                <Mail className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-playfair text-2xl text-[var(--tx-1)] mb-2">{a.forgotSentTitle}</h2>
              <p className="text-sm text-[var(--tx-3)] mb-1">{a.forgotSentDesc}</p>
              <p className="text-sm font-semibold text-[var(--tx-1)] mb-6">{email}</p>
              <p className="text-xs text-[var(--tx-3)] mb-8">{a.forgotLinkValid}</p>
              <Link
                href="/login"
                className="text-sm text-[var(--tx-1)] font-semibold hover:text-gold transition-colors"
              >
                {a.forgotBackLink}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-playfair text-3xl text-[var(--tx-1)] mb-1">{a.forgotTitle}</h1>
                <p className="text-sm text-[var(--tx-3)]">{a.forgotSubtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--tx-2)] mb-1.5">{a.email}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-[var(--bd)] bg-[var(--pg-alt)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--tx-1)] placeholder-[var(--tx-3)] focus:outline-none focus:border-gold/50 transition-colors"
                    placeholder={a.emailPlaceholder}
                  />
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
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {a.forgotSending}</>
                    : a.forgotSendBtn
                  }
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--tx-3)]">
                <Link href="/login" className="text-[var(--tx-1)] font-semibold hover:text-gold transition-colors">
                  {a.forgotBackLink}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
